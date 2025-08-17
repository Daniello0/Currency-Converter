import Currency from '../models/Currency.js';

export function mapApiDataToCurrencies(apiDataArray) {
    if (!Array.isArray(apiDataArray)) {
        console.error("Ошибка маппинга: на вход ожидался массив.");
        return [];
    }

    return apiDataArray
        .map(apiObject => Currency.fromApiObject(apiObject))
        .filter(Boolean);
}