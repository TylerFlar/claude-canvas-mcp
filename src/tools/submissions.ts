import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerSubmissionTools(
  server: McpServer,
  api: CanvasAPI
): void {
  server.tool(
    "list-submissions",
    "List all submissions for a specific assignment",
    {
      course_id: z.string().describe("The Canvas course ID"),
      assignment_id: z.string().describe("The assignment ID"),
      include: z
        .array(z.enum(["submission_comments", "rubric_assessment", "user"]))
        .optional()
        .describe("Additional data to include"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.include) params.include = args.include;
        const submissions = await api.getPaginated(
          `/courses/${args.course_id}/assignments/${args.assignment_id}/submissions`,
          params
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(submissions, null, 2) },
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
    "get-submission",
    "Get a specific user's submission for an assignment (defaults to current user)",
    {
      course_id: z.string().describe("The Canvas course ID"),
      assignment_id: z.string().describe("The assignment ID"),
      user_id: z
        .string()
        .default("self")
        .describe("User ID (defaults to 'self' for current user)"),
      include: z
        .array(z.string())
        .optional()
        .describe("Additional data to include (e.g. 'submission_comments', 'rubric_assessment')"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.include) params.include = args.include;
        const submission = await api.get(
          `/courses/${args.course_id}/assignments/${args.assignment_id}/submissions/${args.user_id}`,
          params
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(submission, null, 2) },
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
    "submit-assignment",
    "Submit an assignment (text entry, URL, or file upload reference)",
    {
      course_id: z.string().describe("The Canvas course ID"),
      assignment_id: z.string().describe("The assignment ID"),
      submission_type: z
        .enum(["online_text_entry", "online_url", "online_upload"])
        .describe("Type of submission"),
      body: z
        .string()
        .optional()
        .describe("Text content (for online_text_entry)"),
      url: z
        .string()
        .optional()
        .describe("URL to submit (for online_url)"),
      file_ids: z
        .array(z.number())
        .optional()
        .describe("File IDs to attach (for online_upload, files must be uploaded first)"),
    },
    async (args) => {
      try {
        const submission: Record<string, unknown> = {
          submission_type: args.submission_type,
        };
        if (args.body) submission.body = args.body;
        if (args.url) submission.url = args.url;
        if (args.file_ids) submission.file_ids = args.file_ids;

        const result = await api.post(
          `/courses/${args.course_id}/assignments/${args.assignment_id}/submissions`,
          { submission }
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

  server.tool(
    "get-submission-summary",
    "Get graded/ungraded/not-submitted counts for an assignment",
    {
      course_id: z.string().describe("The Canvas course ID"),
      assignment_id: z.string().describe("The assignment ID"),
    },
    async (args) => {
      try {
        const summary = await api.get(
          `/courses/${args.course_id}/assignments/${args.assignment_id}/submission_summary`
        );
        return {
          content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
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
    "list-multiple-submissions",
    "List submissions across multiple assignments for students in a course",
    {
      course_id: z.string().describe("The Canvas course ID"),
      student_ids: z
        .array(z.string())
        .optional()
        .describe("Filter by student IDs (use 'all' for all students)"),
      assignment_ids: z
        .array(z.string())
        .optional()
        .describe("Filter by assignment IDs"),
      grouped: z
        .boolean()
        .optional()
        .describe("Group submissions by student"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.student_ids) params.student_ids = args.student_ids;
        if (args.assignment_ids) params.assignment_ids = args.assignment_ids;
        if (args.grouped !== undefined)
          params.grouped = args.grouped.toString();
        const submissions = await api.getPaginated(
          `/courses/${args.course_id}/students/submissions`,
          params
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(submissions, null, 2) },
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
