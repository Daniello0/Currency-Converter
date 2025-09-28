import { v4 as uuidv4 } from 'uuid';
import {Request, Response, NextFunction} from 'express';
import DBController from './DBController.js';

type RequestWithUserId = Request & {
    userId?: string;
};

export default class Cookies {
    static assignUserIdAndAddUserToDB = async (req: RequestWithUserId, res: Response, next: NextFunction) => {
        if (!req.cookies.user_id) {
            const newUserId: string = uuidv4();
            res.cookie('user_id', newUserId, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                path: '/',
            });
            req.userId = newUserId;
            await DBController.upsertUser({
                userId: newUserId,
            });
        } else {
            req.userId = req.cookies.user_id;
        }
        next();
    };
}
