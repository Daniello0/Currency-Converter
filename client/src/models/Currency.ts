type apiObject = {
    Cur_Name: string;
    Cur_Scale: number;
    Cur_Abbreviation: string;
    Cur_OfficialRate: number;
    Date: string;
};

type constructorParams = {
    name: string;
    scale: number;
    abbreviation: string;
    officialRate: number;
    updateDate: Date;
};

export default class Currency {
    name: string = '';
    scale: number = 0;
    abbreviation: string = '';
    officialRate: number = 0.0;
    updateDate: string;

    constructor({
        name,
        scale,
        abbreviation,
        officialRate,
        updateDate,
    }: constructorParams) {
        this.name = name || '';
        this.scale = scale || 0;
        this.abbreviation = abbreviation || '';
        this.officialRate = officialRate || 0.0;
        this.updateDate = new Date(updateDate).toLocaleDateString() || '';
    }

    static fromApiObject(apiObject: apiObject) {
        if (!apiObject) {
            return new Currency({
                name: '',
                scale: 0,
                abbreviation: '',
                officialRate: 0,
                updateDate: new Date(),
            });
        }

        return new Currency({
            name: apiObject.Cur_Name,
            scale: apiObject.Cur_Scale,
            abbreviation: apiObject.Cur_Abbreviation,
            officialRate: apiObject.Cur_OfficialRate,
            updateDate: new Date(apiObject.Date),
        });
    }
}
