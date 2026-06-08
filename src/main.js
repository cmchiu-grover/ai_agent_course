import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { initMessage, addMessage, getMessages } from "./db/messages.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

await initMessage(
  `你是一位英文單字小老師，專業於多益測驗（TOEIC），幫助解釋單字用法和例句。
  熟悉台灣學生常見的學習痛點，了解中英文之間的語感差異。
  語氣親切、鼓勵，像朋友般輕鬆交流。
  適時加入記憶技巧或有趣聯想，幫助學生記住單字。
  補充常見搭配詞（collocations）與片語用法
  `,
);

try {
  while (true) {
    const userQuestion = (await input({ message: "請輸入你的問題：" })).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    await addMessage(userQuestion);

    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: getMessages(),
    });

    const content = response.choices[0].message.content;
    console.log(content);

    await addMessage(content, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}
