import { zodTextFormat } from "openai/helpers/zod";
import functionMapping from "./src/tools/tools.js";
import outputSchema from "./src/schemas/schemas.js";
import { SYSTEM_PROMPT, roles, tool_types } from "./src/const/const.js";
import client from "./src/clients/openai.client.js";

export async function run(query = '') {
    const messages = [
        { role: roles.SYSTEM, content: SYSTEM_PROMPT }
    ]
    messages.push({ role: roles.USER, content: query })
    while (true) {
        console.log('user says', query)
        let result = await client.responses.parse({
            model: "gpt-5-nano",
            text: {
                format: zodTextFormat(outputSchema, 'output')
            },
            input: messages
        })
        console.log('agent says', result.output_parsed)
        console.log('total input tokens used', result.usage.input_tokens)
        console.log('total output tokens used', result.usage.output_tokens)
        console.log('total tokens used', result.usage.total_tokens)

        messages.push({ role: roles.ASSISTANT, content: result.output_text })

        if (result.output_parsed.type == tool_types.TOOL_CALL) {
            try {
                const { tool_call: { tool_name, params } } = result.output_parsed;
                const tool_output = await functionMapping[tool_name](...params);
                console.log('tool result', tool_output)
                messages.push({
                        role: roles.DEVELOPER, content: JSON.stringify({
                            tool_name,
                            params,
                            tool_output
                        })
                    })
                } catch (error) {
                    console.error('tool error', error)
                    messages.push({
                        role: roles.DEVELOPER, content: JSON.stringify({
                            tool_name: result.output_parsed.tool_call.tool_name,
                            params: result.output_parsed.tool_call.params,
                            tool_output: JSON.stringify(error)
                        })
                    })
                }
        } else if (result.output_parsed.type == tool_types.TEXT && result.output_parsed.text_content) {
            messages.push({ role: roles.ASSISTANT, content: result.output_parsed.text_content })
            console.log('agent says', result.output_parsed.text_content)
        } else {
            console.log("breaking..")
            break;
        }
        if (result.output_parsed.final_output) {
            console.log("breaking..final output")
            break;
        }
    }

}

run('create a folder todo and create todo webapp neomorphoism and run it using python -m http.server 8000')