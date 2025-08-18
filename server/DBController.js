import { createClient } from '@supabase/supabase-js'
import Supabase from "./Supabase.js";
const supabaseUrl = Supabase.SUPABASE_URL;
const supabaseKey = Supabase.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey)

export default class DBController {
    static async getUsers() {
        let { data: users, error } = await supabase
            .from('users')
            .select('*')

        if (error) {
            console.error(error);
            return null;
        }

        return users;
    }
}

DBController.getUsers().then(r => console.log(r));