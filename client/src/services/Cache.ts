type CacheObj = {
    data: object;
    expires: number;
}

export default class Cache {
    static saveRequestCache = (key: string, dataToSave: object) => {
        //В данном контексте key - набор входных данных в body (при post-запросе) или ссылка (при get-запросе),
        // Или, если параметров нет - уникальный ключ для этого запроса

        const fiveMinutesInMs: number = 5 * 60 * 1000;
        const objToSave: CacheObj = {
            data: dataToSave,
            expires: Date.now() + fiveMinutesInMs,
        };
        localStorage.setItem(key, JSON.stringify(objToSave));
    };

    static cleanRequestCache = () => {
        Object.keys(localStorage).forEach((key: string) => {
            try {
                const itemStr: string | null = localStorage.getItem(key);
                if (!itemStr) return;
                const item: CacheObj = JSON.parse(itemStr);

                if (item && item.expires && Date.now() > item.expires) {
                    console.log(`Удаление просроченного кэша по ключу: ${key}`);
                    localStorage.removeItem(key);
                }
            } catch (error) {
                console.error(error);
            }
        });
    };

    static getRequestCacheData = (key: string) => {
        const itemStr: string | null = localStorage.getItem(key);

        if (!itemStr) {
            return null;
        }

        try {
            const item: CacheObj = JSON.parse(itemStr);

            if (Date.now() > item.expires) {
                localStorage.removeItem(key);
                return null;
            }

            return item.data;
        } catch (error) {
            console.error(error);
            localStorage.removeItem(key);
            return null;
        }
    };
}
