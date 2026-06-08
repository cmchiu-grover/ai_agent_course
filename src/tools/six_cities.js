import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";
import { searchCity } from "../lib/qdrant.js";

async function search({ query, limit = 5 }) {
  return await searchCity(query, limit);
}

export const sixCitiesTool = defineTool({
  name: "search_six_cities",
  description:
    "當使用者詢問台灣六都（台北、新北、桃園、台中、台南、高雄）的相關資訊時，必須呼叫此工具。" +
    "可查詢各城市的地理位置、人口、市長、氣候、知名景點、在地美食、主要產業、交通與大學等資料。",
  fn: search,
  parameters: z.object({
    query: z
      .string()
      .describe(
        "語意搜尋關鍵字，使用繁體中文，例如：「有哪些海岸景點」、「適合吃小吃的城市」、「科技產業重鎮」",
      ),
    limit: z.number().default(3).describe("回傳筆數上限，預設 3"),
  }),
});
