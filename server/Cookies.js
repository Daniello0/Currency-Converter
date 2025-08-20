import {v4 as uuidv4} from "uuid";
import DBController from "./DBController.js";

export default class Cookies {
    static assignUserIdAndAddUserToDB = async (req, res, next) => {
        if (!req.cookies.user_id) {
            const newUserId = uuidv4();
            res.cookie('user_id', newUserId, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                path: '/'
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