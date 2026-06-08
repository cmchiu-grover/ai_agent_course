import { input } from "@inquirer/prompts";
import { searchCity } from "./lib/qdrant.js";
import { spinner } from "./utils/spinner.js";

try {
  while (true) {
    const query = (await input({ message: "請輸入要詢問的六都內容：" })).trim();

    if (query === "") continue;
    if (query.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    const spin = spinner("搜尋中...").start();
    const results = await searchCity(query, 3);
    spin.stop();

    for (const [i, r] of results.entries()) {
      console.log(`\n${i + 1}. ${r.city_name} (${r.city_name_en})　${r.region}`);
      console.log(`   分數：${r.score.toFixed(3)}`);
      console.log(`   市長：${r.mayor_2024}　人口：${r.population_2024?.toLocaleString()}`);
      console.log(`   景點：${r.famous_attractions}`);
      console.log(`   美食：${r.local_cuisine}`);
      console.log(`   簡介：${r.summary}`);
    }
    console.log();
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}
