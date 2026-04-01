import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerPageTools(server: McpServer, api: CanvasAPI): void {
  server.tool(
    "list-pages",
    "List wiki pages in a course",
    {
      course_id: z.string().describe("The Canvas course ID"),
      search_term: z.string().optional().describe("Search pages by title"),
      sort: z
        .enum(["title", "created_at", "updated_at"])
        .optional()
        .describe("Sort order"),
      published: z.boolean().optional().describe("Filter by published status"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.search_term) params.search_term = args.search_term;
        if (args.sort) params.sort = args.sort;
        if (args.published !== undefined)
          params.published = args.published.toString();
        const pages = await api.getPaginated(
          `/courses/${args.course_id}/pages`,
          params
        );
        return {
          content: [{ type: "text", text: JSON.stringify(pages, null, 2) }],
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
    "get-page",
    "Get the full content of a specific wiki page",
    {
      course_id: z.string().describe("The Canvas course ID"),
      page_url_or_id: z
        .string()
        .describe("The page URL slug or numeric ID"),
    },
    async (args) => {
      try {
        const page = await api.get(
          `/courses/${args.course_id}/pages/${args.page_url_or_id}`
        );
        return {
          content: [{ type: "text", text: JSON.stringify(page, null, 2) }],
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
    "create-page",
    "Create a new wiki page in a course",
    {
      course_id: z.string().describe("The Canvas course ID"),
      title: z.string().describe("Page title"),
      body: z.string().optional().describe("Page content (HTML supported)"),
      published: z.boolean().optional().describe("Publish immediately"),
    },
    async (args) => {
      try {
        const wiki_page: Record<string, unknown> = { title: args.title };
        if (args.body) wiki_page.body = args.body;
        if (args.published !== undefined) wiki_page.published = args.published;
        const page = await api.post(
          `/courses/${args.course_id}/pages`,
          { wiki_page }
        );
        return {
          content: [{ type: "text", text: JSON.stringify(page, null, 2) }],
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
    "get-front-page",
    "Get the front/home page of a course",
    {
      course_id: z.string().describe("The Canvas course ID"),
    },
    async (args) => {
      try {
        const page = await api.get(
          `/courses/${args.course_id}/front_page`
        );
        return {
          content: [{ type: "text", text: JSON.stringify(page, null, 2) }],
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
