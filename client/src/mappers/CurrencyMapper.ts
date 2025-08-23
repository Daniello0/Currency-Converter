import Currency from '../models/Currency.ts';

type ApiObject = {
    Cur_Name: string;
    Cur_Scale: number;
    Cur_Abbreviation: string;
    Cur_OfficialRate: number;
    Date: string;
};

export function mapApiDataToCurrencies(apiDataArray: ApiObject[]) {
    if (!Array.isArray(apiDataArray)) {
        console.error('Ошибка маппинга: на вход ожидался массив.');
        return [];
    }

    return apiDataArray
        .map((apiObject: ApiObject) => Currency.fromApiObject(apiObject))
        .filter(Boolean);
}
