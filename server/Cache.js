import mcache from 'memory-cache';

export default class Cache {
    static assignMemoryCache = (durationInSeconds) => {
        return (req, res, next) => {
            const key = req.url;
            console.log("URL для кеша: ", req.url);
            const cachedBody = mcache.get(key);

            if (cachedBody) {
                res.send(cachedBody);
            } else {
                res.sendResponse = res.send;
                res.send = (body) => {
                    mcache.put(key, body, durationInSeconds * 1000);
                    res.sendResponse(body)
                };
                next();
            }
        }
    }
}