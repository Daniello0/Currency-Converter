import { Request, Router } from 'express';
import DBController from '../DBController.js';

type RequestWithUserId = Request & {
    userId?: string;
}

export const postUser = Router();
postUser.post('/api/user', async (req: RequestWithUserId, res) => {
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