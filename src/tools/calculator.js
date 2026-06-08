import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

function useCalculator({ expression }) {
  if (!/^[\d\s+\-*/().]+$/.test(expression)) {
    return { error: `不合法的運算式：${expression}` };
  }
  try {
    const result = Function(`"use strict"; return (${expression})`)();
    if (!isFinite(result)) return { error: "除數不能為零" };
    return { result };
  } catch {
    return { error: `無法解析的運算式：${expression}` };
  }
}

const calculatorTool = defineTool({
  name: "calculate",
  description: "計算機，計算數學運算式",
  fn: useCalculator,
  parameters: z.object({
    expression: z.string().describe('數學運算式（字串），如 "10 + 5 * 2"'),
  }),
});

export { calculatorTool };
