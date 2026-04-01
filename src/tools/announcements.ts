import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerAnnouncementTools(
  server: McpServer,
  api: CanvasAPI
): void {
  server.tool(
    "list-announcements",
    "List announcements for one or more courses. Context codes are in the format 'course_12345'.",
    {
      context_codes: z
        .array(z.string())
        .describe("Course context codes (e.g. ['course_12345'])"),
      start_date: z
        .string()
        .optional()
        .describe("Only return announcements posted after this date (ISO 8601)"),
      end_date: z
        .string()
        .optional()
        .describe("Only return announcements posted before this date (ISO 8601)"),
      active_only: z
        .boolean()
        .optional()
        .describe("Only return active announcements"),
      latest_only: z
        .boolean()
        .optional()
        .describe("Only return the latest announcement per course"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {
          context_codes: args.context_codes,
        };
        if (args.start_date) params.start_date = args.start_date;
        if (args.end_date) params.end_date = args.end_date;
        if (args.active_only !== undefined)
          params.active_only = args.active_only.toString();
        if (args.latest_only !== undefined)
          params.latest_only = args.latest_only.toString();
        const announcements = await api.getPaginated(
          "/announcements",
          params
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(announcements, null, 2) },
          ],
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
