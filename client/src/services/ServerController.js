import axios from "axios";

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
            const url = `http://localhost:3001/api/rates?${params.toString()}`;

            const res = await fetch(url, { method: 'GET' });

            if (!res.ok) {
                const text = await res.text().catch(() => '');
                console.error(text);
            }

            const data = await res.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error(error);
        }
    }

    static async getUser() {
        try {
            const res = await axios.get('http://localhost:3001/api/user');
            if (res) {
                console.log(res.data);
                return res.data;
            }
        } catch (error) {
            console.error(error);
        }
    }

    static async upsertUser({base_currency, favorites, targets}) {
        try {
            const res = await axios.post('http://localhost:3001/api/user', {base_currency, favorites, targets});

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
            const res = await axios.get('http://localhost:3001/api/allCurrencyInfo');
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