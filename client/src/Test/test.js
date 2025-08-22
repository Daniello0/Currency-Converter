import { assert } from 'chai';
import { before } from 'mocha';

import Parser from '../services/Parser.js';
import Converter from '../services/Converter.js';
import { mapApiDataToCurrencies } from '../mappers/CurrencyMapper.js';
import ServerController from '../services/ServerController.js';

describe('Класс Parser', function () {
    it('должен получать не null массив данных из API', async () => {
        const parser = new Parser();

        const data = await parser.parseRatesToArray();

        assert.isNotNull(data, 'Результат не должен быть null');
        assert.isArray(data, 'Результат должен быть массивом');
    });
});

const parser = new Parser();
let currencyList;

describe('Класс Converter', () => {
    before(async function () {
        console.log('Начало функции buttonShowCurrencyRatesOnClick()');

        const apiArray = await parser.parseRatesToArray();
        console.log(apiArray);
        if (apiArray) {
            currencyList = mapApiDataToCurrencies(apiArray);
            console.log(currencyList);
        } else {
            console.error('Не удалось получить данные из API');
        }

        console.log('Конец функции buttonShowCurrencyRatesOnClick()');
    });

    it('должен правильно конвертировать из BRL в BYN с учетом scale', () => {
        const converter = new Converter();

        const result = converter.convertFromCurrencyToBYN(currencyList, 'BRL');

        const expectedValue = 0.53914;
        assert.closeTo(result, expectedValue, 0.00001, 'Конвертация BRL некорректна');
    });

    it('должен правильно конвертировать из VND в BYN с учетом scale', () => {
        const converter = new Converter();

        const result = converter.convertFromCurrencyToBYN(currencyList, 'VND');

        const expectedValue = 0.000113159;
        assert.closeTo(result, expectedValue, 0.0000001, 'Конвертация VND некорректна');
    });
});

describe('Test user', () => {
    it('Test get user', async () => {
        const user = await ServerController.getUser();
        if (user) {
            console.log(user);
        }
    });
});

describe('Test get rates', () => {
    it('Test get rates', async () => {
        const rates = await ServerController.getRates('USD', 5, ['BYN', 'EUR', 'RUB']);
        if (rates) {
            console.log(rates);
        }
    });
});
