import { supabase } from "./src/lib/supabase";
(async () => {
  const { data, error } = await supabase.from("reviews").select("product_id, rating");
  console.log("REVIEWS DATA:");
  console.log(data);
  console.log("REVIEWS ERROR:");
  console.log(error);
  process.exit(0);
})();
