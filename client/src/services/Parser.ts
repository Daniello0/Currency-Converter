const URL = 'https://api.nbrb.by/exrates/rates?periodicity=0';

export default class Parser {
    async parseRatesToArray() {
        try {
            const response: Response = await fetch(URL);
            if (!response.ok) {
                console.error('Ошибка соединения');
            }
            return await response.json();
        } catch (error) {
            console.error('Ошибка парсинга ', error);
            return null;
        }
    }
}
