import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerEnrollmentTools(
  server: McpServer,
  api: CanvasAPI
): void {
  server.tool(
    "list-enrollments",
    "List enrollments for a course (students, teachers, TAs) with optional grade data",
    {
      course_id: z.string().describe("The Canvas course ID"),
      user_id: z
        .string()
        .optional()
        .describe("Filter by user ID (use 'self' for current user)"),
      type: z
        .array(z.string())
        .optional()
        .describe("Filter by enrollment type (e.g. 'StudentEnrollment', 'TeacherEnrollment')"),
      state: z
        .array(
          z.enum(["active", "invited", "completed", "inactive"])
        )
        .optional()
        .describe("Filter by enrollment state"),
      include: z
        .array(z.enum(["current_points", "avatar_url"]))
        .optional()
        .describe("Include grade points or avatar URLs"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.user_id) params.user_id = args.user_id;
        if (args.type) params.type = args.type;
        if (args.state) params.state = args.state;
        if (args.include) params.include = args.include;
        const enrollments = await api.getPaginated(
          `/courses/${args.course_id}/enrollments`,
          params
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(enrollments, null, 2) },
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
