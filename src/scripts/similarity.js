import { client } from "../lib/openai.js";

const EMBEDDING_MODEL = "text-embedding-3-small";

const SENTENCES = [
  ["我喜歡貓", "貓咪很可愛", "我養了一隻貓"],
  ["今天天氣很好", "我要去買菜", "電腦壞了"],
  [
    "台中是台灣的新興城市",
    "火影忍者是 JUMP 的一代經典",
    "Never gonna give you up, never gonna let you down",
  ],
];

async function embedAll(texts) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

async function main() {
  for (const [groupIdx, group] of SENTENCES.entries()) {
    console.log(`\n=== 第 ${groupIdx + 1} 組 ===`);
    group.forEach((s, i) => console.log(`  [${i}] ${s}`));
    console.log();

    const vectors = await embedAll(group);

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const score = cosineSimilarity(vectors[i], vectors[j]);
        console.log(`  [${i}] vs [${j}]  相似度：${score.toFixed(4)}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
