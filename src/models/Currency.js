export default class Currency {

    #name = "";
    #scale = 0;
    #abbreviation = "";
    #officialRate = 0.0;
    #updateDate = null;

    constructor({ name, scale, abbreviation, officialRate, updateDate }) {
        this.#name = name || "";
        this.#scale = scale || 0;
        this.#abbreviation = abbreviation || "";
        this.#officialRate = officialRate || 0.0;
        this.#updateDate = updateDate || null;
    }

    static fromApiObject(apiObject) {
        if (!apiObject) {
            return null;
        }

        return new Currency({
            name: apiObject.Cur_Name,
            scale: apiObject.Cur_Scale,
            abbreviation: apiObject.Cur_Abbreviation,
            officialRate: apiObject.Cur_OfficialRate,
            updateDate: new Date(apiObject.Date)
        });
    }

    get name() { return this.#name; }
    get scale() { return this.#scale; }
    get abbreviation() { return this.#abbreviation; }
    get officialRate() { return this.#officialRate; }
    get updateDate() { return this.#updateDate; }

    toString() {
        return `${this.#scale} ${this.#name} (${this.#abbreviation}) = ${this.#officialRate}`;
    }
}