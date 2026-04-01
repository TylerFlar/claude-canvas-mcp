import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerUserTools(server: McpServer, api: CanvasAPI): void {
  server.tool(
    "get-profile",
    "Get the current user's Canvas profile (name, email, bio, avatar)",
    {},
    async () => {
      try {
        const profile = await api.get("/users/self/profile");
        return {
          content: [{ type: "text", text: JSON.stringify(profile, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get-user-settings",
    "Get the current user's Canvas notification and display settings",
    {},
    async () => {
      try {
        const settings = await api.get("/users/self/settings");
        return {
          content: [{ type: "text", text: JSON.stringify(settings, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get-avatars",
    "List available avatar options for the current user",
    {},
    async () => {
      try {
        const avatars = await api.getPaginated("/users/self/avatars");
        return {
          content: [{ type: "text", text: JSON.stringify(avatars, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get-activity-stream-summary",
    "Get summary of unread activity (submissions needing grading, new messages, etc.)",
    {},
    async () => {
      try {
        const summary = await api.get("/users/self/activity_stream/summary");
        return {
          content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );
}
