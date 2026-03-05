import { supabase } from "./src/lib/supabase";
(async () => {
  const { data, error } = await supabase.from("products").select("id, name, reviews(rating)");
  console.log("PRODUCTS DATA:", JSON.stringify(data, null, 2));
  console.log("ERROR:", error);
  process.exit(0);
})();
