import Parser from "../Model/Parser.js";
import { assert } from 'chai';

describe("Parser", function () {

    it('получение массива данных', () => {
        let parser;
        parser = new Parser();
        let data;
        data = parser.parseRatesToArray();
        assert.isNotNull(data);
    });

    it('отображение массива полученных данных', () => {
        getAndShowRates();
    });
});

async function getAndShowRates() {
    const parser = new Parser();
    console.log("Создан экземпляр парсера. Вызываем метод...");

    const ratesArray = await parser.parseRatesToArray();

    if (ratesArray) {
        console.log("УСПЕХ! Данные получены.");
        console.log("Тип данных:", typeof ratesArray);
        console.log("Это массив?", Array.isArray(ratesArray));
        console.log("Количество элементов:", ratesArray.length);
        console.log("Первый элемент:", ratesArray[0]);
        console.log("Все данные:", ratesArray);
    } else {
        console.error("ОШИБКА! Не удалось получить данные.");
    }
}