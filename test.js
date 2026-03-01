import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const lines = envFile.split('\n');
let url = '', key = '';
for (const line of lines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

async function run() {
    const res = await fetch(`${url}/rest/v1/products?select=*&limit=1`, {
        headers: {
            apikey: key,
            Authorization: `Bearer ${key}`
        }
    });
    const data = await res.json();
    console.log("PRODUCT COLUMNS:");
    if (data.length > 0) {
        console.log(Object.keys(data[0]));
    } else {
        console.log("No products");
    }
}
run();
