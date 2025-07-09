const URL = "https://api.nbrb.by/exrates/rates?periodicity=0"; // Использую ваш URL из примера

export default class Parser {
    async parseRatesToArray() {
        try {
            const response = await fetch(URL);
            if (!response.ok) {
                console.log("Network connection error")
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Parse error ", error);
            return null;
        }
    }
}