import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerTodoTools(server: McpServer, api: CanvasAPI): void {
  server.tool(
    "list-todo-items",
    "List the current user's todo items (assignments needing submission or grading)",
    {},
    async () => {
      try {
        const todos = await api.getPaginated("/users/self/todo");
        return {
          content: [{ type: "text", text: JSON.stringify(todos, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error: ${(error as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get-todo-count",
    "Get the count of todo items and unread messages for the current user",
    {},
    async () => {
      try {
        const count = await api.get("/users/self/todo_item_count");
        return {
          content: [{ type: "text", text: JSON.stringify(count, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error: ${(error as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "list-upcoming-events",
    "List upcoming assignments and calendar events for the current user",
    {},
    async () => {
      try {
        const events = await api.getPaginated("/users/self/upcoming_events");
        return {
          content: [{ type: "text", text: JSON.stringify(events, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error: ${(error as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
