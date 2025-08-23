export default class Flag {
    static getFlagEmoji = (currencyAbbreviation: string) => {
        if (!currencyAbbreviation || currencyAbbreviation.length < 2) return '🏳️';
        const codePoints: number[] = currencyAbbreviation
            .substring(0, 2)
            .toUpperCase()
            .split('')
            .map((char: string) => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    };
}
