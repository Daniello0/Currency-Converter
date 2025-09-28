import { Request, Router } from 'express';
import DBController from '../DBController.js';

type RequestWithUserId = Request & {
    userId?: string;
}

export const getUser = Router();
getUser.get('/api/user', async (req: RequestWithUserId, res) => {
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

