import { QdrantClient } from "@qdrant/js-client-rest";
import { QDRANT_URL, QDRANT_API_KEY } from "../config.js";
import { client } from "./openai.js";

export const qdrant = new QdrantClient({
  url: QDRANT_URL,
  ...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY }),
});

export const TAIWAN_SIX_CITIES = "taiwan_six_cities";
export const EMBEDDING_DIM = 1536;
export const EMBEDDING_MODEL = "text-embedding-3-small";

export async function embed(text) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

export async function searchCity(query, limit = 3) {
  const vector = await embed(query);

  const results = await qdrant.search(TAIWAN_SIX_CITIES, {
    vector,
    limit,
    with_payload: true,
  });

  return results.map((r) => ({
    score: r.score,
    city_id: r.payload.city_id,
    city_name: r.payload.city_name,
    city_name_en: r.payload.city_name_en,
    region: r.payload.region,
    population_2024: r.payload.population_2024,
    mayor_2024: r.payload.mayor_2024,
    famous_attractions: r.payload.famous_attractions,
    local_cuisine: r.payload.local_cuisine,
    main_industries: r.payload.main_industries,
    summary: r.payload.summary,
  }));
}
