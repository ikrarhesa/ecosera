import { supabase } from './src/lib/supabase'

async function run() {
    const { data: cats } = await supabase.from('categories').select('*')
    console.log("CATEGORIES:")
    console.dir(cats, { depth: null })

    const { data: pc } = await supabase.from('product_categories').select('*').limit(5)
    console.log("PRODUCT_CATEGORIES:")
    console.dir(pc, { depth: null })
}
run()
