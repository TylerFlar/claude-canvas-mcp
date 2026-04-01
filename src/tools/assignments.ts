import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerAssignmentTools(
  server: McpServer,
  api: CanvasAPI
): void {
  server.tool(
    "list-assignments",
    "List assignments for a course, optionally filtered by status (past, overdue, upcoming, etc.)",
    {
      course_id: z.string().describe("The Canvas course ID"),
      search_term: z.string().optional().describe("Search assignments by name"),
      bucket: z
        .enum([
          "past",
          "overdue",
          "undated",
          "ungraded",
          "unsubmitted",
          "upcoming",
          "future",
        ])
        .optional()
        .describe("Filter by assignment status bucket"),
      order_by: z
        .enum(["position", "name", "due_at"])
        .optional()
        .describe("Sort order"),
      include: z
        .array(z.enum(["submission", "score_statistics"]))
        .optional()
        .describe("Include submission data or score statistics"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.search_term) params.search_term = args.search_term;
        if (args.bucket) params.bucket = args.bucket;
        if (args.order_by) params.order_by = args.order_by;
        if (args.include) params.include = args.include;
        const assignments = await api.getPaginated(
          `/courses/${args.course_id}/assignments`,
          params
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(assignments, null, 2) },
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
    "get-assignment",
    "Get full details for a specific assignment (description, due date, points, rubric)",
    {
      course_id: z.string().describe("The Canvas course ID"),
      assignment_id: z.string().describe("The assignment ID"),
      include: z
        .array(z.string())
        .optional()
        .describe("Include additional data (e.g. 'submission', 'score_statistics')"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.include) params.include = args.include;
        const assignment = await api.get(
          `/courses/${args.course_id}/assignments/${args.assignment_id}`,
          params
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(assignment, null, 2) },
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
    "create-assignment",
    "Create a new assignment in a course",
    {
      course_id: z.string().describe("The Canvas course ID"),
      name: z.string().describe("Assignment name"),
      description: z.string().optional().describe("Assignment description (HTML supported)"),
      due_at: z.string().optional().describe("Due date (ISO 8601 format)"),
      points_possible: z.number().optional().describe("Maximum points"),
      submission_types: z
        .array(z.string())
        .optional()
        .describe("Allowed submission types (e.g. 'online_text_entry', 'online_upload')"),
      published: z.boolean().optional().describe("Whether to publish immediately"),
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {
          assignment: {
            name: args.name,
            ...(args.description && { description: args.description }),
            ...(args.due_at && { due_at: args.due_at }),
            ...(args.points_possible !== undefined && {
              points_possible: args.points_possible,
            }),
            ...(args.submission_types && {
              submission_types: args.submission_types,
            }),
            ...(args.published !== undefined && { published: args.published }),
          },
        };
        const assignment = await api.post(
          `/courses/${args.course_id}/assignments`,
          body
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(assignment, null, 2) },
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
    "update-assignment",
    "Update an existing assignment's name, description, due date, points, or published status",
    {
      course_id: z.string().describe("The Canvas course ID"),
      assignment_id: z.string().describe("The assignment ID"),
      name: z.string().optional().describe("New assignment name"),
      description: z.string().optional().describe("New description"),
      due_at: z.string().optional().describe("New due date (ISO 8601)"),
      points_possible: z.number().optional().describe("New max points"),
      published: z.boolean().optional().describe("Publish or unpublish"),
    },
    async (args) => {
      try {
        const assignment: Record<string, unknown> = {};
        if (args.name) assignment.name = args.name;
        if (args.description) assignment.description = args.description;
        if (args.due_at) assignment.due_at = args.due_at;
        if (args.points_possible !== undefined)
          assignment.points_possible = args.points_possible;
        if (args.published !== undefined) assignment.published = args.published;

        const result = await api.put(
          `/courses/${args.course_id}/assignments/${args.assignment_id}`,
          { assignment }
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
