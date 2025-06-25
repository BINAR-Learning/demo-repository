import { createTool } from "@mastra/core/tools";Add commentMore actions
import { z } from "zod";

export const getCurrentDateTool = createTool({
  id: "Get Current Date Tool",
  description: "Get the current date",
  inputSchema: z.object({}),
  execute: async () => {
    return new Date().toISOString().split("T")[0];
  },
});