# AI Agent Boilerplate (API + WebSockets + Tool Calling)

A minimal, **production-shaped** AI Agent starter built with:

- **Express** REST API
- **Socket.IO** for real-time agent step streaming
- **OpenAI Responses API** with **structured output** (Zod)
- **Tool calling** out of the box (`executeCommand`, `createFile`)
- Clean separation: `server` (transport) vs `agent` (reasoning loop) vs `tools` (capabilities)

## What this repo is

This project exposes an agent that:

- Accepts a user `query`
- Runs an agent loop (`ai.js`) that outputs either:
  - normal text, or
  - a tool call request (e.g. run a command / create a file)
- Streams each step over WebSockets (`agent_step`)

## Features

- **Agent loop** with deterministic structured outputs via Zod
- **WebSocket streaming** of intermediate steps
- **Tool calling** mapping from model output to real functions
- **Easy extension**
  - add tools in `src/tools/tools.js`
  - change prompt in `src/const/const.js`
  - change output contract in `src/schemas/schemas.js`
  - add more routes in `src/routes/routes.routes.js`

## Project structure

```
.
├── server.js                 # Express + Socket.IO server (transport)
├── ai.js                     # Agent loop (OpenAI Responses API + tool dispatch)
├── src/
│   ├── routes/
│   │   └── routes.routes.js  # REST endpoints
│   ├── clients/
│   │   └── openai.client.js  # OpenAI SDK client
│   ├── tools/
│   │   └── tools.js          # Tool implementations (executeCommand/createFile)
│   ├── schemas/
│   │   └── schemas.js        # Zod schema for structured agent output
│   └── const/
│       └── const.js          # System prompt + role/type constants
├── .env.example              # Environment variable template
└── package.json
```

## Requirements

- **Node.js** (recent version recommended)
- **pnpm** (recommended) or any package manager that can install dependencies
- An **OpenAI API key**

## Environment variables

Create a `.env` file in the repo root (you can copy from `.env.example`).

Required:

- **`OPENAI_API_KEY`**

Optional:

- **`PORT`** (default: `3000`)

Example:

```bash
PORT=3000
OPENAI_API_KEY=YOUR_KEY_HERE
```

## Install

```bash
pnpm install
```

## Run (dev)

```bash
pnpm dev
```

This runs:

- `node --env-file=.env server.js`

Server defaults to:

- HTTP: `http://localhost:3000`
- WebSocket: `ws://localhost:3000` (Socket.IO)

## API

### `GET /`

Health check.

Response:

- `Hello World!`

### `POST /run`

Starts an agent run and streams step updates to a specific Socket.IO connection.

Body:

```json
{
  "query": "your instruction",
  "socketId": "<socket.id from Socket.IO connection>"
}
```

Notes:

- **`socketId` is required**. If missing, the server returns `400`.
- The HTTP response returns whatever `run()` returns (currently `undefined`), but the **authoritative output is streamed via WebSockets**.

## WebSockets (Socket.IO)

### Connection

When a client connects, the server logs the Socket.IO `socket.id`. You must send that id to `POST /run` so the server knows where to emit updates.

### Events

- **`agent_step`**: emitted to your `socketId` with intermediate steps.

Step payload shape (from `ai.js`):

- `{ type: 'agent_response', data: <parsed structured output> }`
- `{ type: 'tool_call', data: { tool_name, params } }`
- `{ type: 'tool_result', data: { tool_name, tool_output } }`
- `{ type: 'tool_error', data: { tool_name, error } }`
- `{ type: 'text', data: <string> }`
- `{ type: 'final_output', data: <parsed structured output> }`

## Example client usage

### 1) Connect to Socket.IO and capture `socketId`

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("socketId:", socket.id);
});

socket.on("agent_step", (step) => {
  console.log("agent_step:", step);
});
```

### 2) Start a run via REST

```js
const res = await fetch("http://localhost:3000/run", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: "Create a file hello.txt with the text Hello",
    socketId: socket.id
  })
});

console.log("HTTP response:", await res.json().catch(() => null));
```

## Tool calling

Tools are implemented in:

- `src/tools/tools.js`

Currently available:

- **`executeCommand(cmd: string)`**
  - Runs `cmd` on the host machine via `execSync`
- **`createFile(file_name: string, file_content: string)`**
  - Writes a file using `fs.writeFileSync`

How tool calling works:

- The model returns a structured object matching `src/schemas/schemas.js`
- If `type === 'tool_call'`, `ai.js` extracts:
  - `tool_call.tool_name`
  - `tool_call.params` (array of strings)
- Then it executes:
  - `functionMapping[tool_name](...params)`

### Security warning (important)

This boilerplate can execute shell commands and write files. If you expose this server publicly, add at least:

- Authentication/authorization
- Tool allow-lists + validation
- Sandboxing / restricted execution
- Rate limiting and auditing

## Extending the boilerplate

### Add a new tool

1. Add the function in `src/tools/tools.js`.
2. Export it in the default export map.
3. Update the system prompt in `src/const/const.js` so the model knows the tool exists.

### Change the agent output contract

- Update `src/schemas/schemas.js` (Zod schema)
- Keep `ai.js` in sync if you change field names/types

### Change the model

- `ai.js` currently uses `model: "gpt-5-nano"`

## Troubleshooting

- **`OPENAI_API_KEY` missing**
  - Ensure `.env` exists and contains `OPENAI_API_KEY=...`
- **No streaming updates**
  - Confirm the client is connected and you’re sending the correct `socketId` to `POST /run`

---

## Status

- README created and aligned with the current codebase structure and behavior.

## License
MIT