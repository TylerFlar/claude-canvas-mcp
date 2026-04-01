import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerModuleTools(server: McpServer, api: CanvasAPI): void {
  server.tool(
    "list-modules",
    "List all modules in a course with optional item details",
    {
      course_id: z.string().describe("The Canvas course ID"),
      include: z
        .array(z.enum(["items", "content_details"]))
        .optional()
        .describe("Include module items and/or content details inline"),
      search_term: z.string().optional().describe("Search modules by name"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.include) params.include = args.include;
        if (args.search_term) params.search_term = args.search_term;
        const modules = await api.getPaginated(
          `/courses/${args.course_id}/modules`,
          params
        );
        return {
          content: [{ type: "text", text: JSON.stringify(modules, null, 2) }],
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
    "get-module",
    "Get details for a specific module in a course",
    {
      course_id: z.string().describe("The Canvas course ID"),
      module_id: z.string().describe("The module ID"),
      include: z
        .array(z.string())
        .optional()
        .describe("Additional data to include (e.g. 'items', 'content_details')"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.include) params.include = args.include;
        const mod = await api.get(
          `/courses/${args.course_id}/modules/${args.module_id}`,
          params
        );
        return {
          content: [{ type: "text", text: JSON.stringify(mod, null, 2) }],
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
    "list-module-items",
    "List all items (assignments, pages, files, etc.) within a module",
    {
      course_id: z.string().describe("The Canvas course ID"),
      module_id: z.string().describe("The module ID"),
      include: z
        .array(z.enum(["content_details"]))
        .optional()
        .describe("Include content details (due dates, points, etc.)"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.include) params.include = args.include;
        const items = await api.getPaginated(
          `/courses/${args.course_id}/modules/${args.module_id}/items`,
          params
        );
        return {
          content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
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
    "get-module-item",
    "Get details for a specific item within a module",
    {
      course_id: z.string().describe("The Canvas course ID"),
      module_id: z.string().describe("The module ID"),
      item_id: z.string().describe("The module item ID"),
    },
    async (args) => {
      try {
        const item = await api.get(
          `/courses/${args.course_id}/modules/${args.module_id}/items/${args.item_id}`
        );
        return {
          content: [{ type: "text", text: JSON.stringify(item, null, 2) }],
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
