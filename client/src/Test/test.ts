import { assert } from 'chai';
import Parser from '../services/Parser.ts';

// eslint-disable-next-line no-undef
describe('Класс Parser', function () {
    // eslint-disable-next-line no-undef
    it('должен получать не null массив данных из API', async () => {
        const parser = new Parser();

        const data = await parser.parseRatesToArray();

        assert.isNotNull(data, 'Результат не должен быть null');
        assert.isArray(data, 'Результат должен быть массивом');
    });
});
