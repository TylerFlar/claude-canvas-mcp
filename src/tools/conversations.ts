import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerConversationTools(
  server: McpServer,
  api: CanvasAPI
): void {
  server.tool(
    "list-conversations",
    "List inbox conversations (messages between users)",
    {
      scope: z
        .enum(["unread", "starred", "archived", "sent"])
        .optional()
        .describe("Filter by conversation scope"),
      filter: z
        .array(z.string())
        .optional()
        .describe("Filter by course or group (e.g. ['course_12345'])"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.scope) params.scope = args.scope;
        if (args.filter) params.filter = args.filter;
        const conversations = await api.getPaginated(
          "/conversations",
          params
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(conversations, null, 2) },
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
    "get-conversation",
    "Get a specific conversation with all its messages",
    {
      conversation_id: z.string().describe("The conversation ID"),
      auto_mark_as_read: z
        .boolean()
        .optional()
        .describe("Automatically mark as read (default true)"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.auto_mark_as_read !== undefined)
          params.auto_mark_as_read = args.auto_mark_as_read.toString();
        const conversation = await api.get(
          `/conversations/${args.conversation_id}`,
          params
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(conversation, null, 2) },
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
    "send-conversation",
    "Send a new message/conversation to one or more recipients",
    {
      recipients: z
        .array(z.string())
        .describe("Recipient user IDs or 'course_12345' for entire course"),
      subject: z.string().describe("Message subject"),
      body: z.string().describe("Message body"),
      group_conversation: z
        .boolean()
        .optional()
        .describe("Send as a group conversation (all recipients in one thread)"),
      context_code: z
        .string()
        .optional()
        .describe("Course or group context (e.g. 'course_12345')"),
    },
    async (args) => {
      try {
        const payload: Record<string, unknown> = {
          recipients: args.recipients,
          subject: args.subject,
          body: args.body,
        };
        if (args.group_conversation !== undefined)
          payload.group_conversation = args.group_conversation;
        if (args.context_code) payload.context_code = args.context_code;
        const conversation = await api.post("/conversations", payload);
        return {
          content: [
            { type: "text", text: JSON.stringify(conversation, null, 2) },
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
    "get-unread-count",
    "Get the count of unread conversations for the current user",
    {},
    async () => {
      try {
        const count = await api.get("/conversations/unread_count");
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
}
