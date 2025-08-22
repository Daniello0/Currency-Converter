import express, { json } from 'express';
import Parser from './Parser.js';
import cors from 'cors';
import Cookies from './Cookies.js';
import cookieParser from 'cookie-parser';
import DBController from './DBController.js';

const app = express();
const port = 3001;

app.use(json());
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);

app.use(cookieParser());
app.use(Cookies.assignUserIdAndAddUserToDB);

app.get('/api/allCurrencyInfo', async (req, res) => {
    try {
        res.send(await Parser.getAllCurrencyInfo());
    } catch (error) {
        console.error(error);
    }
});

app.get('/api/currencies', async (req, res) => {
    try {
        res.json(await Parser.getCurrenciesArray());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Не удалось получить список валют' });
    }
});

app.get('/api/rates', async (req, res) => {
    const { base, amount } = req.query;
    const targets = req.query.targets || '';
    console.log('targets: ', targets);

    const targetArray = targets.split(',').filter((currency) => currency.trim() !== '');

    if (!base) {
        return res.status(400).json({ error: 'Параметр base обязателен' });
    }

    if (targetArray.length === 0) {
        console.log('Targets is empty, returning base structure: ', targetArray);
        return res.json({
            base: base,
            amount: parseFloat(amount) || 0,
            target: [],
        });
    }

    try {
        const data = await Parser.getRates(base, targetArray, amount);
        if (data) {
            console.log('Данные из get api/rates: ', data);
            res.send(data);
        } else {
            res.status(404).json({ error: 'Не удалось найти данные для указанных валют' });
        }
    } catch (e) {
        console.error('Error in /api/rates:', e);
        res.status(500).json({ error: 'Не удалось получить курсы' });
    }
});

app.get('/api/user', async (req, res) => {
    try {
        console.log('user_id (get /api/user): ', req.userId);
        console.log('get /api/user: ', await DBController.getUser(req.userId));
        res.json(await DBController.getUser(req.userId));
    } catch (error) {
        console.error(error);
    }
});

app.post('/api/user', async (req, res) => {
    const { base_currency, favorites, targets, amount } = req.body;
    try {
        await DBController.upsertUser({
            userId: req.userId,
            base_currency: base_currency,
            favorites: favorites,
            targets: targets,
            amount: amount,
        }).then((r) => {
            console.log('Успешно UPSERT. user_id: ', req.userId);
            console.log('Данные: ', r);
        });
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
    }
});

app.listen(port, () => console.log('Сервер запущен: ', `http://localhost:${port}`));
