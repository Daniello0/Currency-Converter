import { json } from 'express';
import {Request, Response} from 'express';
import express, { type Express } from 'express';
import Parser from './Parser.ts';
import cors from 'cors';
import Cookies from './Cookies.ts';
import cookieParser from 'cookie-parser';
import DBController from './DBController.ts';
import Cache from './Cache.ts';

type RequestWithUserId = Request & {
    userId?: string;
}

type CacheObj = {
    base_currency: string;
    targets: string;
    data: string;
}

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

app.get('/api/allCurrencyInfo', Cache.assignMemoryCache(ONE_HOUR), async (_req: Request, res: Response) => {
    try {
        res.send(await Parser.getAllCurrencyInfo());
    } catch (error) {
        console.error(error);
    }
});

app.get('/api/currencies', Cache.assignMemoryCache(ONE_HOUR), async (_req: Request, res: Response) => {
    try {
        res.json(await Parser.getCurrenciesArray());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Не удалось получить список валют' });
    }
});

app.get('/api/rates', async (req: Request, res: Response) => {
    const { base } = req.query;
    const targets: unknown = req.query.targets || '';
    console.log('targets: ', targets);

    const targetArray: string[] = String(targets).split(',').filter((currency) => currency.trim() !== '');

    if (!base) {
        return res.status(400).json({ error: 'Параметр base обязателен' });
    }

    if (targetArray.length === 0) {
        console.log('Targets is empty, returning base structure: ', targetArray);
        return res.json({
            base: base,
            target: [],
        });
    }

    try {
        const sortedTargets: string = targetArray.sort().join(',');
        const cacheData: CacheObj | null = await DBController.getRatesCache({
            base_currency: String(base),
            targets: sortedTargets,
        });
        if (cacheData !== null) {
            console.log('cacheData is not null:\n', cacheData.data);
            res.send(cacheData.data);
            return;
        }
        console.log('cacheData is null');

        const data = await Parser.getRates(String(base), targetArray.sort());

        if (data) {
            console.log('Данные из get api/rates: ', data);
            await DBController.upsertRatesCache({
                base_currency: String(base),
                targets: sortedTargets,
                data: JSON.stringify(data),
            });
            res.send(data);
        } else {
            res.status(404).json({
                error: 'Не удалось найти данные для указанных валют',
            });
        }
    } catch (e) {
        console.error('Error in /api/rates:', e);
        res.status(500).json({ error: 'Не удалось получить курсы' });
    }
});

app.get('/api/user', async (req: RequestWithUserId, res) => {
    try {
        console.log('user_id (get /api/user): ', req.userId);
        if (req.userId !== undefined) {
            console.log('get /api/user: ', await DBController.getUser(req.userId));
            res.json(await DBController.getUser(req.userId));
        }
    } catch (error) {
        console.error(error);
    }
});

app.post('/api/user', async (req: RequestWithUserId, res) => {
    const { base_currency, favorites, targets, amount } = req.body;
    try {
        if (req.userId === undefined) {
            console.log("user_id is undefined");
            return;
        }
        await DBController.upsertUser({
            userId: req.userId,
            base_currency: base_currency,
            favorites: favorites,
            targets: targets,
            amount: amount,
        }).then((r) => {
            console.log('Успешно UPSERT. user_id: ', req.userId);
            console.log('Данные: ', r);
            res.json(r);
        });
    } catch (error) {
        console.error(error);
    }
});

app.listen(port, () => console.log('Сервер запущен: ', `http://localhost:${port}`));
