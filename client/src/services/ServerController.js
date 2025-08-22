import axios from 'axios';
import Cache from "./Cache.js";

const api = axios.create({
    baseURL: 'http://localhost:3001',
    withCredentials: true,
});

export default class ServerController {
    static async getCurrencies() {
        try {
            const cache_key = '__cache__/api/currencies'
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

    static async getRates(baseCurrency, amount, targetCurrencies) {
        try {
            const targetsString = targetCurrencies.join(',');
            const params = new URLSearchParams({ base: baseCurrency, amount: amount, targets: targetsString });
            const url = `/api/rates?${params.toString()}`;
            const cache_key = '__cache__' + url;

            const requestCache = Cache.getRequestCacheData(cache_key);
            if (requestCache) {
                return requestCache;
            }

            const res = await api.get(url);

            if (!res) {
                const text = await res.data.catch(() => '');
                console.error(text);
            }

            const data = await res.data;
            console.log(data);
            return data;
        } catch (error) {
            console.error(error);
        }
    }

    static async getUser() {
        try {
            const res = await api.get('/api/user');
            if (res) {
                console.log('Полученный пользователь: ', res.data);
                return res.data;
            }
        } catch (error) {
            console.error(error);
        }
    }

    static async upsertUser({ base_currency, favorites, targets, amount }) {
        try {
            const res = await api.post('/api/user', { base_currency, favorites, targets, amount });

            if (res) {
                console.log(res.data);
                return res.data;
            }
        } catch (error) {
            console.error(error);
        }
    }

    static async getAllCurrencyInfo() {
        try {
            const res = await api.get('/api/allCurrencyInfo');
            if (res) {
                console.log(res.data);
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
