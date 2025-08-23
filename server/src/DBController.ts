import { createClient } from '@supabase/supabase-js';
import Supabase from './Supabase.ts';


const supabaseUrl: string = Supabase.SUPABASE_URL;
const supabaseKey: string = Supabase.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

type UserUpsert = {
    id: string;
    base_currency?: string;
    favorites?: string;
    targets?: string;
    amount?: number;
};

type UpsertUserFunc = {
    userId: string;
    user?: UserUpsert
    base_currency?: string;
    favorites?: string;
    targets?: string;
    amount?: number;
}

type UpsertCache = {
    base_currency: string;
    targets: string;
    data: string;
}


export default class DBController {
    static async getUser(user_id: string) {
        let { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user_id)
            .single();

        if (error) {
            console.error(error);
        }

        return data;
    }

    static async upsertUser({ userId, base_currency, favorites, targets, amount }: UpsertUserFunc) {
        if (!userId) {
            throw new Error('userId обязателен для обновления или создания пользователя');
        }

        const payload: UserUpsert = {id: userId};
        if (base_currency !== undefined) payload.base_currency = base_currency;
        if (favorites !== undefined) payload.favorites = favorites;
        if (targets !== undefined) payload.targets = targets;
        if (amount !== undefined) payload.amount = amount;

        const { data, error } = await supabase
            .from('users')
            .upsert(payload)
            .select()
            .single();

        if (error) {
            console.error(error.message);
        }

        return data;
    }

    static async getRatesCache({ base_currency, targets }: {base_currency: string, targets: string}) {
        const { data, error } = await supabase
            .from('cache')
            .select('base_currency, targets, data')
            .eq('base_currency', base_currency)
            .eq('targets', targets)
            .single();

        if (error) {
            console.log('Не удалось получить данные getRatesCache');
            return null;
        }
        return data;
    }

    static async upsertRatesCache({ base_currency, targets, data }: UpsertCache) {
        const payload = {} as UpsertCache;
        if (base_currency !== undefined) payload.base_currency = base_currency;
        if (targets !== undefined) payload.targets = targets;
        if (data !== undefined) payload.data = data;
        const { error } = await supabase.from('cache').upsert(payload);
        if (error) {
            console.error(error);
        }
    }
}
