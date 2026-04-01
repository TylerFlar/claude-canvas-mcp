import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerGradeTools(server: McpServer, api: CanvasAPI): void {
  server.tool(
    "get-course-grades",
    "Get current grades for the authenticated user in a specific course (current score, final score, letter grade)",
    {
      course_id: z.string().describe("The Canvas course ID"),
    },
    async (args) => {
      try {
        const enrollments = await api.get(
          `/courses/${args.course_id}/enrollments`,
          {
            user_id: "self",
            include: ["current_points"],
          }
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

  server.tool(
    "get-all-grades",
    "Get grades across all courses for the current user (current and final scores per course)",
    {
      include_completed: z
        .boolean()
        .optional()
        .describe("Include completed/past courses"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {
          include: ["total_scores"],
          enrollment_state: args.include_completed ? undefined : "active",
        };
        const courses = await api.getPaginated("/courses", params);
        return {
          content: [{ type: "text", text: JSON.stringify(courses, null, 2) }],
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
    "get-effective-due-dates",
    "Get student-specific effective due dates for all assignments in a course",
    {
      course_id: z.string().describe("The Canvas course ID"),
    },
    async (args) => {
      try {
        const dueDates = await api.get(
          `/courses/${args.course_id}/effective_due_dates`
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(dueDates, null, 2) },
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
