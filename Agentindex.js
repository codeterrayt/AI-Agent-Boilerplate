import express from "express";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { exec } from "node:child_process";
import { promisify } from "node:util";


// This manually creates the promise version
const execAsync = promisify(exec);

const app = express();
app.use(express.json());

const commandLineTool = tool({
    name: "command_line",
    description: "this tool can execute comamnds",
    parameters: z.object({
        command: z.string().describe("The command to execute"),
    }),
    async execute({ command }) {
        try {
            const { stdout, stderr } = await execAsync(command);
            // Return a combined string or just stdout so the agent can "see" it
            return stdout || stderr || "Command executed successfully with no output.";
        } catch (error) {
            return `Error executing command: ${error.message}`;
        }
    }
})

const openai = new Agent({
    name: "OpenClaw",
    instructions: "you have access to command line, you can build anything as user requests, you can use any tools to build the project, you can create folder, files run command its a windows system you can use command_line tool to execute commands",
    tools: [commandLineTool],
    model: "gpt-5-nano"
});

app.post("/", async (req, res) => {
    const { message } = req.body;
    const result = await run(openai, message);
    return res.json(result);
});

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});
