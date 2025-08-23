import type { NextFunction, Request, Response } from 'express';
import mcache from 'memory-cache';

export default class Cache {
    static assignMemoryCache = (durationInSeconds: number) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const key = req.url;
            const cachedBody = mcache.get(key);

            if (cachedBody) {
                res.send(cachedBody);
            } else {

                const originalSend: Response['send'] = res.send.bind(res);
                const originalJson: Response['json'] = res.json.bind(res);

                res.send = ((body?: unknown) => {
                    mcache.put(key, body, durationInSeconds * 1000);
                    return originalSend(body);
                }) as Response['send'];

                res.json = ((body?: unknown) => {
                    mcache.put(key, body, durationInSeconds * 1000);
                    return originalJson(body as unknown);
                }) as Response['json'];

                next();
            }
        };
    };
}
