import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { client } from "../lib/openai.js";
import { qdrant, TAIWAN_SIX_CITIES, EMBEDDING_DIM } from "../lib/qdrant.js";

const CSV_PATH = "src/data/taiwan_six_cities.csv";
const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 100;

function rowToText(row) {
  return [
    row.city_name,
    row.city_name_en,
    row.region,
    row.geographic_feature,
    row.climate,
    row.main_industries,
    row.famous_attractions,
    row.local_cuisine,
    row.keywords,
    row.summary,
  ]
    .filter(Boolean)
    .join(" | ");
}

async function recreateCollection() {
  const exists = await qdrant.collectionExists(TAIWAN_SIX_CITIES);
  if (exists.exists) {
    await qdrant.deleteCollection(TAIWAN_SIX_CITIES);
  }
  await qdrant.createCollection(TAIWAN_SIX_CITIES, {
    vectors: { size: EMBEDDING_DIM, distance: "Cosine" },
  });
}

async function embedBatch(texts) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

async function main() {
  const csv = await readFile(CSV_PATH, "utf8");
  const rows = parse(csv, { columns: true, skip_empty_lines: true });
  console.log(`讀到 ${rows.length} 筆資料`);

  await recreateCollection();
  console.log(`已建立 collection: ${TAIWAN_SIX_CITIES}`);

  let processed = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const validBatch = batch.map((row, idx) => ({ row, text: rowToText(row), idx })).filter(({ text }) => text.trim());
    if (validBatch.length === 0) {
      processed += batch.length;
      continue;
    }
    const vectors = await embedBatch(validBatch.map(({ text }) => text));

    const points = validBatch.map(({ row, idx }, vecIdx) => ({
      id: i + idx,
      vector: vectors[vecIdx],
      payload: {
        city_id: row.city_id,
        city_name: row.city_name,
        city_name_en: row.city_name_en,
        region: row.region,
        established_year: row.established_year,
        population_2024: row.population_2024,
        area_km2: row.area_km2,
        districts: row.districts,
        mayor_2024: row.mayor_2024,
        political_party: row.political_party,
        capital_district: row.capital_district,
        geographic_feature: row.geographic_feature,
        climate: row.climate,
        avg_temp_celsius: row.avg_temp_celsius,
        annual_rainfall_mm: row.annual_rainfall_mm,
        main_industries: row.main_industries,
        famous_attractions: row.famous_attractions,
        local_cuisine: row.local_cuisine,
        transportation_hub: row.transportation_hub,
        universities: row.universities,
        gdp_contribution_percent: row.gdp_contribution_percent,
        keywords: row.keywords,
        summary: row.summary,
      },
    }));

    await qdrant.upsert(TAIWAN_SIX_CITIES, { wait: true, points });
    processed += batch.length;
    console.log(`進度：${processed} / ${rows.length}`);
  }

  console.log("完成！");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
