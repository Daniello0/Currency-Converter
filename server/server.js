import express, {json} from 'express';
import Parser from "./Parser.js";
import cors from 'cors';
import Cookies from "./Cookies.js";
import cookieParser from 'cookie-parser';
import DBController from "./DBController.js";

const app = express();
const port = 3001;

app.use(json());
app.use(cors());

app.use(cookieParser());
app.use(Cookies.assignUserId);

app.get('/api/allCurrencyInfo', async (req, res) => {
    try {
        res.send(await Parser.getAllCurrencyInfo());
    } catch (error) {
        console.error(error)
    }
})

app.get('/api/currencies', async (req, res) => {
    try {
        res.json(await Parser.getCurrenciesArray());
    } catch (e) {
        res.status(500).json({error: 'Не удалось получить список валют'});
    }
});

app.get('/api/rates', async (req, res) => {
    const { base } = req.query;
    const { targets } = req.query;
    const targetArray = targets.split(',');

    if (!base || targetArray.length === 0) {
        return res.status(400).json({ error: 'Параметры base и target обязательны' });
    }

    try {
        const data = await Parser.getRates(base, targetArray);
        if (data) {
            res.send(data);
        }
    } catch (e) {
        res.status(500).json({ error: 'Не удалось получить курсы' });
    }
});

app.get('/api/user', async (req, res) => {
    try{
        res.json(DBController.getUser(req.userId));
    } catch (error) {
        console.error(error)
    }
});

app.post('/api/user', async (req, res) => {
    const {base_currency, favorites, targets} = req.body;
    try {
        await DBController.upsertUser({
            userId: req.userId,
            base_currency: base_currency,
            favorites: favorites,
            targets: targets
        }).then(r => console.log("Успешно upsertUser: ", r));
    } catch (error) {
        console.error(error)
    }
})

app.listen(port, () => console.log('Сервер запущен: ', `http://localhost:${port}`));