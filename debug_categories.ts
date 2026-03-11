
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://umdkhnlegqxzceowehxc.supabase.co";
const supabaseKey = "sb_publishable_R2kByLJB55pLypcD4Zp0JQ_I4qZdq8e";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log("Checking product_categories table directly...");

    const { data, error, count } = await supabase
        .from("product_categories")
        .select("*", { count: 'exact' })
        .limit(10);

    if (error) {
        console.error("Error fetching product_categories:", error.message);
    } else {
        console.log(`Direct fetch result (first 10): ${JSON.stringify(data)}`);
        console.log(`Total rows visible to anon: ${count}`);
    }

    console.log("\nChecking categories table again to be sure...");
    const { count: catCount } = await supabase
        .from("categories")
        .select("*", { count: 'exact', head: true });
    console.log(`Total categories visible to anon: ${catCount}`);
}

debug();
