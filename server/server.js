import express, {json} from 'express';
import Parser from "./Parser.js";
import cors from 'cors';
import Cookies from "./Cookies.js";
import cookieParser from 'cookie-parser';

const app = express();
const port = 3001;

app.use(json());
app.use(cors());

app.use(cookieParser());
app.use(Cookies.assignUserId);

app.get('/api/currencies', async (req, res) => {
    try {
        res.json(await Parser.getCurrenciesArray());
    } catch (e) {
        res.status(500).json({error: 'Не удалось получить список валют'});
    }
});

app.get('/api/rates', async (req, res) => {
    const { base } = req.query;
    const { target } = req.query;
    const targets =
        Array.isArray(target) ? target
            : typeof target === 'string' ? target.split(',').map(s => s.trim()).filter(Boolean)
                : [];

    if (!base || targets.length === 0) {
        return res.status(400).json({ error: 'Параметры base и target обязательны' });
    }

    try {
        const data = await Parser.getRates(base, targets);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: 'Не удалось получить курсы' });
    }
});

app.get('/api/user', (req, res) => {
    console.log(req.userId);
    res.json({ userId: req.userId });
});

/*const params = new URLSearchParams({ base: 'USD' });
['BYN', 'EUR', 'RUB', 'PLN', 'CNY'].forEach(t => params.append('target', t));

fetch(`http://localhost:3001/api/rates?${params.toString()}`)
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);*/

app.listen(port, () => console.log('Сервер запущен: ', `http://localhost:${port}`));