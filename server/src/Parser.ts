type RateParsed = {
    Cur_Abbreviation: string;
    Cur_Scale: number;
    Cur_OfficialRate: number;
    Cur_Name: string;
}

type RateObject = {
    amount: number;
    abbreviation: string;
    name: string;
}

export default class Parser {
    static round(value: number, digits = 4) {
        return Number(Number(value).toFixed(digits));
    }

    static async getCurrenciesArray() {
        const API_URL = 'https://api.nbrb.by/exrates/rates?periodicity=0';
        const response = await fetch(API_URL);
        if (response.ok) {
            const json = await response.json();
            let abbreviations: string[] = [];
            for (const item of json) {
                abbreviations.push(item.Cur_Abbreviation);
            }
            return abbreviations;
        }
    }

    static async getRates(baseCurrency: string, targetCurrencies: string[]) {
        const API_URL = 'https://api.nbrb.by/exrates/rates?periodicity=0';
        const response = await fetch(API_URL);
        if (response.ok) {
            const json = await response.json();

            let rates: {base: string; target: RateObject[]} = {
                base: baseCurrency,
                target: [],
            };

            let baseObject = json.find((rate: RateParsed) => {
                return rate.Cur_Abbreviation === baseCurrency;
            });

            if (baseCurrency === 'BYN') {
                baseObject = {
                    Cur_Abbreviation: 'BYN',
                    Cur_Scale: 1,
                    Cur_OfficialRate: 1,
                    Cur_Name: 'Белорусский рубль',
                };
            }

            const oneBaseCurrency = baseObject.Cur_OfficialRate / baseObject.Cur_Scale;

            for (let currency of targetCurrencies) {
                let currencyObject: RateParsed = json.find((rate: RateParsed) => {
                    return rate.Cur_Abbreviation === currency;
                });

                if (currency === 'BYN') {
                    currencyObject = {
                        Cur_Abbreviation: 'BYN',
                        Cur_Scale: 1,
                        Cur_OfficialRate: 1,
                        Cur_Name: 'Белорусский рубль',
                    };
                }

                const oneCurrencyObject =
                    currencyObject.Cur_OfficialRate / currencyObject.Cur_Scale;
                const abbreviation = currencyObject.Cur_Abbreviation;
                const name = currencyObject.Cur_Name;
                const obj = {} as RateObject;
                obj.amount = this.round(oneBaseCurrency / oneCurrencyObject);
                obj.abbreviation = abbreviation;
                obj.name = name;
                rates.target.push(obj);
            }

            return rates;
        }
    }

    static async getAllCurrencyInfo() {
        const API_URL = 'https://api.nbrb.by/exrates/rates?periodicity=0';
        const response = await fetch(API_URL);
        if (response.ok) {
            return await response.json();
        }
    }
}
