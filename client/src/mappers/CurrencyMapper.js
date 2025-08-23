import Currency from '../models/Currency.ts';

export function mapApiDataToCurrencies(apiDataArray) {
    if (!Array.isArray(apiDataArray)) {
        console.error('Ошибка маппинга: на вход ожидался массив.');
        return [];
    }

    return apiDataArray
        .map((apiObject) => Currency.fromApiObject(apiObject))
        .filter(Boolean);
}
