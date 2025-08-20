import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3001",
    withCredentials: true,
});

export default class ServerController {

    static async getCurrencies() {
        try {
            const res = await axios.get('http://localhost:3001/api/currencies');
            if (res) {
                console.log(res.data);
                return res.data;
            }
        } catch (error) {
            console.error(error);
        }
    }

    static async getRates(baseCurrency, targetCurrencies) {
        try {
            const targetsString = targetCurrencies.join(',');
            const params = new URLSearchParams({ base: baseCurrency, targets: targetsString });
            const url = `/api/rates?${params.toString()}`;

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
                console.log("Полученный пользователь: ", res.data);
                return res.data;
            }
        } catch (error) {
            console.error(error);
        }
    }

    static async upsertUser({base_currency, favorites, targets, amount}) {
        try {
            const res = await api.post('/api/user', {base_currency, favorites, targets, amount});

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