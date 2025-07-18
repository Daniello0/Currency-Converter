export class Flag {
    static getFlagEmoji = (currencyAbbreviation) => {
        if (!currencyAbbreviation || currencyAbbreviation.length < 2) return '🏳️';
        const codePoints = currencyAbbreviation.substring(0, 2).toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    };
}