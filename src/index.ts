#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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

const transport = new StdioServerTransport();
await server.connect(transport);
