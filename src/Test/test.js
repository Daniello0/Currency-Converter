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
        let parser;
        parser = new Parser();
        parser.parseRatesToArray().then(r => console.log(r));
        console.log("End");
    });
});