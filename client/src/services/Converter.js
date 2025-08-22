export default class Converter {
    static convertBetweenCurrencies(amount, from, to, currencyList) {
        const fromRateData = currencyList.find((r) => r.abbreviation === from);
        const toRateData = currencyList.find((r) => r.abbreviation === to);

        if (!fromRateData || !toRateData) return 0;

        const amountInByn = (amount * fromRateData.officialRate) / fromRateData.scale;

        // конечная стоимость
        return (amountInByn * toRateData.scale) / toRateData.officialRate;
    }
}
