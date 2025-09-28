import { json } from 'express';
import {Request, Response} from 'express';
import express, { type Express } from 'express';
import Parser from './services/Parser.js';
import cors from 'cors';
import Cookies from './services/Cookies.js';
import cookieParser from 'cookie-parser';
import Cache from './services/Cache.js';
import { setupSwagger } from './routes/Swagger.js';
import { getRates } from './routes/GetRates.js';
import { getUser } from './routes/GetUser.js';
import { postUser } from './routes/PostUser.js';

const app: Express = express();
const port = 3001;

app.use(json());
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);

//Время
const ONE_HOUR = 3600;

app.use(cookieParser());
app.use(Cookies.assignUserIdAndAddUserToDB);

setupSwagger(app);

/**
 * @swagger
 * components:
 *   schemas:
 *     CurrencyInfo:
 *       type: object
 *       additionalProperties: false
 *       required:
 *         - Cur_Name
 *         - Cur_ID
 *         - Cur_Scale
 *         - Cur_Abbreviation
 *         - Cur_OfficialRate
 *         - Date
 *       properties:
 *         Cur_Name:
 *           type: string
 *           description: Наименование валюты.
 *           example: "Доллар США"
 *         Cur_ID:
 *           type: integer
 *           format: int32
 *           description: ID валюты.
 *           example: 440
 *         Cur_Scale:
 *           type: integer
 *           format: int32
 *           description: Номинал (количество единиц валюты, за которое указывается официальный курс).
 *           example: 1
 *         Cur_Abbreviation:
 *           type: string
 *           description: Аббревиатура валюты.
 *           example: USD
 *         Cur_OfficialRate:
 *           type: number
 *           format: double
 *           description: Официальный курс по отношению к белорусскому рублю.
 *           example: 3.2456
 *         Date:
 *           type: string
 *           format: date-time
 *           description: Дата последнего обновления курса.
 *           example: "2025-08-24T00:00:00Z"
 *
 *     Rates:
 *       type: object
 *       additionalProperties: false
 *       required:
 *         - base
 *         - targets
 *       properties:
 *         base:
 *           type: string
 *           description: Базовая валюта
 *           example: USD
 *         targets:
 *           type: array
 *           description: Курсы целевых валют относительно базовой
 *           items:
 *             type: object
 *             additionalProperties: false
 *             required:
 *               - abbreviation
 *               - amount
 *               - name
 *             properties:
 *               abbreviation:
 *                 type: string
 *                 description: Аббревиатура целевой валюты
 *                 example: EUR
 *               amount:
 *                 type: number
 *                 format: double
 *                 description: Курс целевой валюты относительно базовой
 *                 example: 0.9213
 *               name:
 *                 type: string
 *                 description: Полное название валюты
 *                 example: "Евро"
 *
 *     ApiError:
 *       type: object
 *       additionalProperties: false
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: string
 *           example: "Сообщение об ошибке"
 *
 *     Error:
 *       type: object
 *       additionalProperties: false
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           example: "Internal Server Error"
 *     User:
 *       type: object
 *       additionalProperties: false
 *       required:
 *         - id
 *         - base_currency
 *         - amount
 *         - targets
 *         - favorites
 *         - created_at
 *         - updated_at
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Идентификатор пользователя.
 *           example: "00000000-0000-0000-0000-000000000000"
 *         base_currency:
 *           type: string
 *           description: Базовая валюта.
 *           example: "USD"
 *         amount:
 *           type: string
 *           description: Сумма в базовой валюте.
 *           example: "100"
 *         targets:
 *           type: string
 *           description: Список целевых валют через запятую.
 *           example: "EUR,BYN,PLN"
 *         favorites:
 *           type: string
 *           description: Список избранных валют через запятую.
 *           example: "USD,EUR"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Дата и время создания записи.
 *           example: "2025-08-23 17:35:29.337542+00"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Дата и время последнего обновления записи.
 *           example: "2025-08-24 11:34:27.654698+00"
 *
 *     UserUpsert:
 *       type: object
 *       additionalProperties: false
 *       description: Поля для обновления/создания пользователя. Все поля необязательны — укажите только то, что нужно изменить.
 *       properties:
 *         base_currency:
 *           type: string
 *           description: Базовая валюта.
 *           example: "USD"
 *         amount:
 *           type: string
 *           description: Сумма в базовой валюте.
 *           example: "100"
 *         targets:
 *           type: string
 *           description: Список целевых валют через запятую.
 *           example: "EUR,BYN,PLN"
 *         favorites:
 *           type: string
 *           description: Список избранных валют через запятую.
 *           example: "USD,EUR"
 *       minProperties: 1
 */



/**
 * @swagger
 * /api/allCurrencyInfo:
 *   get:
 *     summary: Получить список валют
 *     tags:
 *       - Currencies/Rates
 *     responses:
 *       '200':
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CurrencyInfo'
 *             examples:
 *               success:
 *                 summary: Пример массива валют
 *                 value:
 *                   - Cur_Name: "Доллар США"
 *                     Cur_ID: 440
 *                     Cur_Scale: 1
 *                     Cur_Abbreviation: USD
 *                     Cur_OfficialRate: 2.9743
 *                     Date: "2024-08-23T00:00:00Z"
 *                   - Cur_Name: "Евро"
 *                     Cur_ID: 978
 *                     Cur_Scale: 1
 *                     Cur_Abbreviation: EUR
 *                     Cur_OfficialRate: 3.2489
 *                     Date: "2024-08-23T00:00:00Z"
 */
app.get('/api/allCurrencyInfo', Cache.assignMemoryCache(ONE_HOUR), async (_req: Request, res: Response) => {
    try {
        res.send(await Parser.getAllCurrencyInfo());
    } catch (error) {
        console.error(error);
    }
});


/**
 * @swagger
 * /api/currencies:
 *      get:
 *          summary: Получить массив аббревиатур
 *          tags:
 *              - Currencies/Rates
 *          responses:
 *              '200':
 *                  description: Успешный ответ
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                          examples:
 *                              success:
 *                                  summary: Пример массива аббревиатур.
 *                                  value:
 *                                      - USD
 *                                      - EUR
 *                                      - CNY
 *
 */
app.get('/api/currencies', Cache.assignMemoryCache(ONE_HOUR), async (_req: Request, res: Response) => {
    try {
        res.json(await Parser.getCurrenciesArray());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Не удалось получить список валют' });
    }
});


/**
 * @swagger
 * /api/rates:
 *   get:
 *     summary: Получить курсы для базовой валюты
 *     description: Возвращает курсы целевых валют относительно указанной базовой валюты.
 *     tags:
 *       - Currencies/Rates
 *     operationId: getRates
 *     parameters:
 *       - in: query
 *         name: base
 *         description: Код базовой валюты (например, USD). Обязательный параметр.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: targets
 *         description: CSV-список целевых валют (например, EUR,BYN,PLN). Может быть пустым.
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *     responses:
 *       '200':
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rates'
 *             examples:
 *               withTargets:
 *                 summary: С целевыми валютами
 *                 value:
 *                   base: USD
 *                   targets:
 *                     - abbreviation: EUR
 *                       amount: 0.9213
 *                       name: "Евро"
 *                     - abbreviation: BYN
 *                       amount: 3.2456
 *                       name: "Белорусский рубль"
 *               empty:
 *                 summary: Без целевых валют
 *                 value:
 *                   base: USD
 *                   targets: []
 *       '500':
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               serverError:
 *                 summary: Ошибка при получении курсов
 *                 value:
 *                   error: "Не удалось получить курсы"
 */
app.use(getRates);


/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Получить данные пользователя
 *     description: Возвращает запись пользователя из БД по userId, установленному в cookie.
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя успешно получены.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Отсутствует или неверный идентификатор пользователя в cookie.
 *       404:
 *         description: Пользователь не найден.
 *       500:
 *         description: Внутренняя ошибка сервера.
 */
app.use(getUser);


/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Создать/обновить данные пользователя (upsert)
 *     description: Обновляет поля пользователя, идентифицированного по cookie userId. Если пользователя ещё нет, он будет создан.
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpsert'
 *           examples:
 *             updateBaseAndTargets:
 *               summary: Обновление базовой и целевых валют
 *               value:
 *                 base_currency: "USD"
 *                 targets: "EUR,BYN,PLN"
 *             setAmountAndFavorites:
 *               summary: Установка суммы и избранных валют
 *               value:
 *                 amount: "100"
 *                 favorites: "USD,EUR"
 *     responses:
 *       200:
 *         description: Данные пользователя обновлены.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       201:
 *         description: Пользователь создан.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Некорректное тело запроса.
 *       401:
 *         description: Отсутствует или неверный идентификатор пользователя в cookie.
 *       500:
 *         description: Внутренняя ошибка сервера.
 */
app.use(postUser);

app.listen(port, () => console.log('Сервер запущен: ', `http://localhost:${port}`));
