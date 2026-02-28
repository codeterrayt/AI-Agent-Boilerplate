import { z } from "zod";
import { tool_types } from "../const/const.js";

export default z.object({
    type: z.enum(Object.values(tool_types)).describe("The type of the output"),
    final_output: z.boolean().describe("if the goal is achieved then its true, else its false"),
    text_content: z.string().optional().nullable().describe("text content if type is text"),
    tool_call: z.object({
        tool_name: z.string().describe("The name of the tool"),
        params: z.array(z.string()).describe("The input for the tool")
    }).optional().nullable().describe("the params to call  the tool, if the type is tool_call")
});