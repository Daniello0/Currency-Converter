export class Flag {
    static getFlagEmoji = (currencyCode) => {
        if (!currencyCode || currencyCode.length < 2) return '🏳️';
        const codePoints = currencyCode.substring(0, 2).toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    };
}