import axios, { AxiosInstance } from 'axios';
import Cache from './Cache.ts';

const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3001',
    withCredentials: true,
});

type RatesData = {
    base: string;
    target: {
        abbreviation: string;
        amount: number;
        name: string;
    }[];
}

type UpsertUserFunc = {
    base_currency?: string;
    favorites?: string;
    targets?: string;
    amount?: number;
}

export default class ServerController {
    static async getRates(baseCurrency: string, targetCurrencies: string[]): Promise<RatesData> {
        try {
            const targetsString: string = targetCurrencies.sort().join(',');
            const params = new URLSearchParams({
                base: baseCurrency,
                targets: targetsString,
            });
            const url = `/api/rates?${params.toString()}`;
            const cache_key: string = '__cache__' + url;

            const requestCache = Cache.getRequestCacheData(cache_key);
            if (requestCache) {
                return requestCache;
            }

            const res = await api.get(url);

            if (res) {
                const data: RatesData = await res.data;
                console.log(data);
                Cache.saveRequestCache(cache_key, data);
                return data;
            }

            const text: string = await res.data.catch(() => '');
            console.error(text);
        } catch (error) {
            console.error(error);
        }
    }

    static async getCurrencies() {
        try {
            const cache_key = '__cache__/api/currencies';
            const requestCache = Cache.getRequestCacheData(cache_key);

            if (requestCache) {
                return requestCache;
            }

            const res = await api.get('/api/currencies');
            if (res) {
                console.log(res.data);
                Cache.saveRequestCache(cache_key, res.data);
                return res.data;
            }
        } catch (error) {
            console.error(error);
        }
    }

    static async getUser() {
        try {
            const cache_key = '__cache__/api/user';
            const requestCache: object = Cache.getRequestCacheData(cache_key);

            if (requestCache) {
                return requestCache;
            }

            const res = await api.get('/api/user');
            if (res) {
                console.log('Полученный пользователь: ', await res.data);
                Cache.saveRequestCache(cache_key, await res.data);
                return await res.data;
            }
        } catch (error) {
            console.error(error);
        }
    }

    static async upsertUser({ base_currency, favorites, targets, amount } : UpsertUserFunc) {
        try {
            const cache_key = '__cache__/api/user';
            const res = await api.post('/api/user', {
                base_currency,
                favorites,
                targets,
                amount,
            });

            if (res) {
                console.log(res.data);
                Cache.saveRequestCache(cache_key, await res.data);
                return await res.data;
            }
        } catch (error) {
            console.error(error);
        }
    }

    static async getAllCurrencyInfo() {
        try {
            const cache_key = '__cache__/api/allCurrencyInfo';
            const requestCache: object = Cache.getRequestCacheData(cache_key);

            if (requestCache) {
                return requestCache;
            }

            const res = await api.get('/api/allCurrencyInfo');
            if (res) {
                console.log(res.data);
                Cache.saveRequestCache(cache_key, res.data);
                return res.data;
            }
        } catch (error) {
            console.error(error);
        }
    }
}

// await ServerController.getRates("USD", ["BYN", "EUR", "RUB"]);
// await ServerController.getCurrencies();
// await ServerController.getAllCurrencyInfo();
