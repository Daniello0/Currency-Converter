import { createClient } from '@supabase/supabase-js'
import Supabase from "./Supabase.js";
const supabaseUrl = Supabase.SUPABASE_URL;
const supabaseKey = Supabase.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey)

export default class DBController {
    static async getUser(user_id) {
        let {data, error} = await supabase
        .from('users')
        .select('*')
        .eq('id', user_id)
        .single();

        if (error) {
            console.error(error);
        }

        return data;
    }

    static async updateUser({ userId, base_currency = "USD", favorites, targets }) {
        if (!userId) {
            throw new Error('userId обязателен для обновления пользователя');
        }

        const payload = {};
        if (base_currency !== undefined) payload.base_currency = base_currency;
        if (favorites !== undefined) payload.favorites = favorites;
        if (targets !== undefined) payload.targets = targets;

        const {data, error } = await supabase
            .from('users')
            .update(payload)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data
    }

    static async createUser({userId, base_currency = "USD", favorites, targets}) {
        const {data, error } = await supabase
            .from('users')
            .insert({
                id: userId,
                base_currency: base_currency,
                favorites: favorites,
                targets: targets
            })
            .select();

        if (error) {
            console.error(error);
        }

        return data
    }

    static async upsertUser({userId, base_currency, favorites, targets}) {
        if (!userId) {
            throw new Error('userId обязателен для обновления или создания пользователя');
        }

        const payload = {};
        payload.id = userId;
        if (base_currency !== undefined) payload.base_currency = base_currency;
        if (favorites !== undefined) payload.favorites = favorites;
        if (targets !== undefined) payload.targets = targets;

        const {data, error } = await supabase
            .from('users')
            .upsert(payload)
            .select();

        if (error) {
            console.error(error);
        }

        return data;
    }
}

await DBController.upsertUser({
    userId: '12345',
}).then(r => console.log(r));