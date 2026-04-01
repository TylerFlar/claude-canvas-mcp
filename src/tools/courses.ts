import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerCourseTools(server: McpServer, api: CanvasAPI): void {
  server.tool(
    "list-courses",
    "List all courses for the current user. Returns course names, IDs, and enrollment info.",
    {
      enrollment_type: z
        .enum(["teacher", "student", "ta", "observer", "designer"])
        .optional()
        .describe("Filter by enrollment role"),
      enrollment_state: z
        .enum(["active", "invited", "completed"])
        .optional()
        .describe("Filter by enrollment state (default: active)"),
      include: z
        .array(
          z.enum([
            "total_scores",
            "current_grading_period_scores",
            "term",
            "course_image",
            "favorites",
          ])
        )
        .optional()
        .describe("Additional data to include"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.enrollment_type) params.enrollment_type = args.enrollment_type;
        if (args.enrollment_state)
          params["enrollment_state"] = args.enrollment_state;
        if (args.include) params.include = args.include;
        const courses = await api.getPaginated("/courses", params);
        return {
          content: [{ type: "text", text: JSON.stringify(courses, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get-course",
    "Get details for a specific course by ID",
    {
      course_id: z.string().describe("The Canvas course ID"),
      include: z
        .array(z.string())
        .optional()
        .describe("Additional data to include (e.g. 'total_scores', 'syllabus_body', 'term')"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.include) params.include = args.include;
        const course = await api.get(`/courses/${args.course_id}`, params);
        return {
          content: [{ type: "text", text: JSON.stringify(course, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get-course-settings",
    "Get settings for a specific course (grading, features, etc.)",
    {
      course_id: z.string().describe("The Canvas course ID"),
    },
    async (args) => {
      try {
        const settings = await api.get(`/courses/${args.course_id}/settings`);
        return {
          content: [{ type: "text", text: JSON.stringify(settings, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "list-course-users",
    "List users enrolled in a course (students, teachers, TAs)",
    {
      course_id: z.string().describe("The Canvas course ID"),
      enrollment_type: z
        .array(z.string())
        .optional()
        .describe("Filter by role (e.g. 'student', 'teacher')"),
      search_term: z.string().optional().describe("Search users by name or email"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.enrollment_type) params.enrollment_type = args.enrollment_type;
        if (args.search_term) params.search_term = args.search_term;
        const users = await api.getPaginated(
          `/courses/${args.course_id}/users`,
          params
        );
        return {
          content: [{ type: "text", text: JSON.stringify(users, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get-course-activity-stream",
    "Get recent activity stream for a course (new posts, submissions, announcements)",
    {
      course_id: z.string().describe("The Canvas course ID"),
    },
    async (args) => {
      try {
        const stream = await api.getPaginated(
          `/courses/${args.course_id}/activity_stream`
        );
        return {
          content: [{ type: "text", text: JSON.stringify(stream, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );
}
