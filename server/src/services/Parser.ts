type PlainAllCurrenciesObject = {
    Cur_Abbreviation: string;
    Cur_Scale: number;
    Cur_OfficialRate: number;
    Cur_Name: string;
}

type TargetObject = {
    abbreviation: string;
    amount: number;
    name: string;
}

type RateObject = {
    base: string,
    targets : {
        abbreviation: string,
        amount: number,
        name: string,
    }[]
}

export default class Parser {
    private static round(value: number, digits = 4) {
        return Number(Number(value).toFixed(digits));
    }

    private static isPlainCurrenciesArray(data: unknown): data is PlainAllCurrenciesObject[] {
        return Array.isArray(data) &&
            data.every(
                (item) =>
                    item &&
                    typeof item === 'object' &&
                    'Cur_Abbreviation' in item &&
                    typeof (item).Cur_Abbreviation === 'string'
            );
    }

    static async getCurrenciesArray(): Promise<string[]> {
        const API_URL = 'https://api.nbrb.by/exrates/rates?periodicity=0';
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        const data: unknown = await response.json();
        if (!this.isPlainCurrenciesArray(data)) {
            throw new Error('Неверный формат данных от API');
        }
        return data.map((item) => item.Cur_Abbreviation);
    }


    static async getRates(baseCurrency: string, targetCurrencies: string[]): Promise<RateObject | undefined> {
        const API_URL = 'https://api.nbrb.by/exrates/rates?periodicity=0';
        const response = await fetch(API_URL);
        if (response.ok) {
            const data: unknown = await response.json();

            if (!this.isPlainCurrenciesArray(data)) {
                throw new Error('Неверный формат данных от API');
            }

            data.push({
                Cur_Abbreviation: 'BYN',
                Cur_Scale: 1,
                Cur_OfficialRate: 1,
                Cur_Name: 'Белорусский рубль',
            })

            let rates: { base: string; targets: TargetObject[] } = {
                base: baseCurrency,
                targets: [],
            };

            let baseObject: PlainAllCurrenciesObject | undefined = data.find((rate: PlainAllCurrenciesObject) => {
                return rate.Cur_Abbreviation === baseCurrency;
            });

            if (!baseObject) {
                throw new Error(`Неизвестная базовая валюта: ${baseCurrency}`);
            }

            const oneBaseCurrency: number =
                baseObject.Cur_OfficialRate / baseObject.Cur_Scale;

            for (let currency of targetCurrencies) {
                let currencyObject: PlainAllCurrenciesObject | undefined = data.find((rate: PlainAllCurrenciesObject) => {
                    return rate.Cur_Abbreviation === currency;
                });

                if (!currencyObject) {
                    throw new Error("currencyObject не определен");
                }

                if (currency === 'BYN') {
                    currencyObject = {
                        Cur_Abbreviation: 'BYN',
                        Cur_Scale: 1,
                        Cur_OfficialRate: 1,
                        Cur_Name: 'Белорусский рубль',
                    };
                }

                const oneCurrencyObject: number =
                    currencyObject.Cur_OfficialRate / currencyObject.Cur_Scale;
                const abbreviation = currencyObject.Cur_Abbreviation;
                const name = currencyObject.Cur_Name;
                const obj = {} as TargetObject;
                obj.amount = this.round(oneBaseCurrency / oneCurrencyObject);
                obj.abbreviation = abbreviation;
                obj.name = name;
                rates.targets.push(obj);
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
