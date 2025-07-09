import Currency from '../Model/Currency'; // Предположим, Currency лежит в папке models

/**
 * Преобразует массив "сырых" данных о курсах из API
 * в массив чистых, типизированных объектов Currency.
 * @param {Array<object>} apiDataArray - Массив данных, полученный от nbrb.by.
 * @returns {Array<Currency>} Массив экземпляров класса Currency.
 */
export function mapApiDataToCurrencies(apiDataArray) {
    // Проверка, что на вход пришел действительно массив
    if (!Array.isArray(apiDataArray)) {
        console.error("Ошибка маппинга: на вход ожидался массив.");
        return []; // Возвращаем пустой массив, чтобы приложение не упало
    }

    return apiDataArray
        .map(apiObject => Currency.fromApiObject(apiObject))
        .filter(currency => currency !== null);
}