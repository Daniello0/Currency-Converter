export default class Converter {

    convertFromCurrencyToBYN(currencyList, currencyAbbreviation) {
        currencyList.forEach(currency => {
            if (currency.abbreviation === currencyAbbreviation) {
                return +currency.officialRate / +currency.scale;
            }
        })
    }
}