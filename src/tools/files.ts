import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerFileTools(server: McpServer, api: CanvasAPI): void {
  server.tool(
    "list-course-files",
    "List files in a course, optionally filtered by name or type",
    {
      course_id: z.string().describe("The Canvas course ID"),
      search_term: z.string().optional().describe("Search files by name"),
      content_types: z
        .array(z.string())
        .optional()
        .describe("Filter by MIME type (e.g. 'application/pdf')"),
      sort: z
        .enum(["name", "size", "created_at", "updated_at"])
        .optional()
        .describe("Sort order"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.search_term) params.search_term = args.search_term;
        if (args.content_types) params.content_types = args.content_types;
        if (args.sort) params.sort = args.sort;
        const files = await api.getPaginated(
          `/courses/${args.course_id}/files`,
          params
        );
        return {
          content: [{ type: "text", text: JSON.stringify(files, null, 2) }],
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
    "get-file",
    "Get metadata and download URL for a specific file",
    {
      file_id: z.string().describe("The file ID"),
    },
    async (args) => {
      try {
        const file = await api.get(`/files/${args.file_id}`);
        return {
          content: [{ type: "text", text: JSON.stringify(file, null, 2) }],
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
    "get-file-content",
    "Get the text content of a file (for text-based files like .txt, .py, .js, .csv, etc.). Returns the raw file content.",
    {
      file_id: z.string().describe("The file ID"),
    },
    async (args) => {
      try {
        const file = await api.get<{ url: string; content_type: string; display_name: string }>(
          `/files/${args.file_id}`
        );
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.status}`);
        }
        const content = await response.text();
        // Truncate very large files
        const maxLength = 50000;
        const truncated = content.length > maxLength;
        return {
          content: [
            {
              type: "text",
              text: truncated
                ? `${content.substring(0, maxLength)}\n\n--- TRUNCATED (${content.length} total characters) ---`
                : content,
            },
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
    "list-course-folders",
    "List all folders in a course",
    {
      course_id: z.string().describe("The Canvas course ID"),
    },
    async (args) => {
      try {
        const folders = await api.getPaginated(
          `/courses/${args.course_id}/folders`
        );
        return {
          content: [{ type: "text", text: JSON.stringify(folders, null, 2) }],
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
    "list-folder-contents",
    "List files inside a specific folder",
    {
      folder_id: z.string().describe("The folder ID"),
    },
    async (args) => {
      try {
        const files = await api.getPaginated(
          `/folders/${args.folder_id}/files`
        );
        return {
          content: [{ type: "text", text: JSON.stringify(files, null, 2) }],
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
