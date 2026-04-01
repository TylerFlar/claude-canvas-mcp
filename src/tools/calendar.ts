import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerCalendarTools(
  server: McpServer,
  api: CanvasAPI
): void {
  server.tool(
    "list-calendar-events",
    "List calendar events and/or assignments in a date range",
    {
      type: z
        .enum(["event", "assignment"])
        .optional()
        .describe("Filter by event type"),
      start_date: z
        .string()
        .optional()
        .describe("Start date (ISO 8601, e.g. '2025-01-01')"),
      end_date: z
        .string()
        .optional()
        .describe("End date (ISO 8601)"),
      context_codes: z
        .array(z.string())
        .optional()
        .describe("Filter by context (e.g. ['course_12345', 'user_self'])"),
      undated: z
        .boolean()
        .optional()
        .describe("Return only undated events"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.type) params.type = args.type;
        if (args.start_date) params.start_date = args.start_date;
        if (args.end_date) params.end_date = args.end_date;
        if (args.context_codes) params.context_codes = args.context_codes;
        if (args.undated !== undefined) params.undated = args.undated.toString();
        const events = await api.getPaginated("/calendar_events", params);
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

  server.tool(
    "get-calendar-event",
    "Get details for a specific calendar event",
    {
      event_id: z.string().describe("The calendar event ID"),
    },
    async (args) => {
      try {
        const event = await api.get(`/calendar_events/${args.event_id}`);
        return {
          content: [{ type: "text", text: JSON.stringify(event, null, 2) }],
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
    "create-calendar-event",
    "Create a new calendar event",
    {
      title: z.string().describe("Event title"),
      start_at: z.string().describe("Start time (ISO 8601)"),
      end_at: z.string().describe("End time (ISO 8601)"),
      description: z.string().optional().describe("Event description"),
      context_code: z
        .string()
        .describe("Context code (e.g. 'course_12345' or 'user_self')"),
      location_name: z.string().optional().describe("Location name"),
    },
    async (args) => {
      try {
        const calendar_event: Record<string, unknown> = {
          title: args.title,
          start_at: args.start_at,
          end_at: args.end_at,
          context_code: args.context_code,
        };
        if (args.description) calendar_event.description = args.description;
        if (args.location_name)
          calendar_event.location_name = args.location_name;
        const event = await api.post("/calendar_events", { calendar_event });
        return {
          content: [{ type: "text", text: JSON.stringify(event, null, 2) }],
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
    "delete-calendar-event",
    "Delete a calendar event",
    {
      event_id: z.string().describe("The calendar event ID"),
      cancel_reason: z
        .string()
        .optional()
        .describe("Reason for cancellation"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.cancel_reason) params.cancel_reason = args.cancel_reason;
        const result = await api.delete(
          `/calendar_events/${args.event_id}`,
          params
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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
