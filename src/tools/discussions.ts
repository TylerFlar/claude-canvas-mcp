import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerDiscussionTools(
  server: McpServer,
  api: CanvasAPI
): void {
  server.tool(
    "list-discussions",
    "List discussion topics in a course",
    {
      course_id: z.string().describe("The Canvas course ID"),
      order_by: z
        .enum(["position", "recent_activity", "title"])
        .optional()
        .describe("Sort order"),
      search_term: z.string().optional().describe("Search by title/body"),
      scope: z
        .enum(["locked", "unlocked", "pinned", "unpinned"])
        .optional()
        .describe("Filter by scope"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.order_by) params.order_by = args.order_by;
        if (args.search_term) params.search_term = args.search_term;
        if (args.scope) params.scope = args.scope;
        const discussions = await api.getPaginated(
          `/courses/${args.course_id}/discussion_topics`,
          params
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(discussions, null, 2) },
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

  server.tool(
    "get-discussion",
    "Get a specific discussion topic with its full message",
    {
      course_id: z.string().describe("The Canvas course ID"),
      topic_id: z.string().describe("The discussion topic ID"),
    },
    async (args) => {
      try {
        const topic = await api.get(
          `/courses/${args.course_id}/discussion_topics/${args.topic_id}`
        );
        return {
          content: [{ type: "text", text: JSON.stringify(topic, null, 2) }],
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
    "get-discussion-entries",
    "Get all entries/replies in a discussion topic (full threaded view)",
    {
      course_id: z.string().describe("The Canvas course ID"),
      topic_id: z.string().describe("The discussion topic ID"),
    },
    async (args) => {
      try {
        const view = await api.get(
          `/courses/${args.course_id}/discussion_topics/${args.topic_id}/view`
        );
        return {
          content: [{ type: "text", text: JSON.stringify(view, null, 2) }],
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
    "create-discussion-entry",
    "Post a new reply/entry to a discussion topic",
    {
      course_id: z.string().describe("The Canvas course ID"),
      topic_id: z.string().describe("The discussion topic ID"),
      message: z.string().describe("The reply message (HTML supported)"),
    },
    async (args) => {
      try {
        const entry = await api.post(
          `/courses/${args.course_id}/discussion_topics/${args.topic_id}/entries`,
          { message: args.message }
        );
        return {
          content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
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
    "create-discussion",
    "Create a new discussion topic in a course",
    {
      course_id: z.string().describe("The Canvas course ID"),
      title: z.string().describe("Discussion title"),
      message: z
        .string()
        .optional()
        .describe("Initial post content (HTML supported)"),
      discussion_type: z
        .enum(["side_comment", "threaded"])
        .optional()
        .describe("Discussion type"),
      published: z.boolean().optional().describe("Publish immediately"),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = { title: args.title };
        if (args.message) body.message = args.message;
        if (args.discussion_type) body.discussion_type = args.discussion_type;
        if (args.published !== undefined) body.published = args.published;
        const topic = await api.post(
          `/courses/${args.course_id}/discussion_topics`,
          body
        );
        return {
          content: [{ type: "text", text: JSON.stringify(topic, null, 2) }],
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
