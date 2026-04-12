#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CanvasAPI } from "./canvas-api.js";

import { registerUserTools } from "./tools/user.js";
import { registerCourseTools } from "./tools/courses.js";
import { registerAssignmentTools } from "./tools/assignments.js";
import { registerSubmissionTools } from "./tools/submissions.js";
import { registerGradeTools } from "./tools/grades.js";
import { registerTodoTools } from "./tools/todo.js";
import { registerAnnouncementTools } from "./tools/announcements.js";
import { registerModuleTools } from "./tools/modules.js";
import { registerPageTools } from "./tools/pages.js";
import { registerFileTools } from "./tools/files.js";
import { registerDiscussionTools } from "./tools/discussions.js";
import { registerCalendarTools } from "./tools/calendar.js";
import { registerConversationTools } from "./tools/conversations.js";
import { registerQuizTools } from "./tools/quizzes.js";
import { registerEnrollmentTools } from "./tools/enrollments.js";

const token = process.env.CANVAS_API_TOKEN;
if (!token) {
  console.error(
    "Error: CANVAS_API_TOKEN environment variable is required.\n" +
      "Generate one at: Your Canvas URL > Account > Settings > New Access Token"
  );
  process.exit(1);
}

const baseUrl = process.env.CANVAS_BASE_URL;
if (!baseUrl) {
  console.error(
    "Error: CANVAS_BASE_URL environment variable is required.\n" +
      "Set it to your institution's Canvas URL (e.g. https://canvas.ucsd.edu)"
  );
  process.exit(1);
}

const api = new CanvasAPI(baseUrl, token);

const server = new McpServer({
  name: "canvas-mcp",
  version: "1.0.0",
});

// Register all tool modules
registerUserTools(server, api);
registerCourseTools(server, api);
registerAssignmentTools(server, api);
registerSubmissionTools(server, api);
registerGradeTools(server, api);
registerTodoTools(server, api);
registerAnnouncementTools(server, api);
registerModuleTools(server, api);
registerPageTools(server, api);
registerFileTools(server, api);
registerDiscussionTools(server, api);
registerCalendarTools(server, api);
registerConversationTools(server, api);
registerQuizTools(server, api);
registerEnrollmentTools(server, api);

if (process.env.MCP_TRANSPORT === "http") {
  const { default: express } = await import("express");
  const { StreamableHTTPServerTransport } = await import(
    "@modelcontextprotocol/sdk/server/streamableHttp.js"
  );
  const crypto = await import("crypto");

  const app = express();
  app.use(express.json());

  const transports = new Map<string, StreamableHTTPServerTransport>();

  app.all("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (req.method === "GET") {
      const transport = transports.get(sessionId!);
      if (!transport) { res.status(404).send("Session not found"); return; }
      await transport.handleRequest(req, res);
    } else if (req.method === "POST") {
      if (!sessionId) {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          onsessioninitialized: (id) => { transports.set(id, transport); },
        });
        transport.onclose = () => {
          if (transport.sessionId) transports.delete(transport.sessionId);
        };
        await server.connect(transport);
        await transport.handleRequest(req, res);
      } else {
        const transport = transports.get(sessionId);
        if (!transport) { res.status(404).send("Session not found"); return; }
        await transport.handleRequest(req, res);
      }
    } else if (req.method === "DELETE") {
      const transport = transports.get(sessionId!);
      if (transport) { await transport.close(); transports.delete(sessionId!); }
      res.status(200).send();
    } else {
      res.status(405).send("Method not allowed");
    }
  });

  const PORT = parseInt(process.env.MCP_PORT || "3100");
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MCP server listening on http://0.0.0.0:${PORT}/mcp`);
  });
} else {
  const { StdioServerTransport } = await import(
    "@modelcontextprotocol/sdk/server/stdio.js"
  );
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
