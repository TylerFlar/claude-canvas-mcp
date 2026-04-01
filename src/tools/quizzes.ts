import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "../canvas-api.js";

export function registerQuizTools(server: McpServer, api: CanvasAPI): void {
  server.tool(
    "list-quizzes",
    "List quizzes in a course",
    {
      course_id: z.string().describe("The Canvas course ID"),
      search_term: z.string().optional().describe("Search quizzes by title"),
    },
    async (args) => {
      try {
        const params: Record<string, string | string[] | undefined> = {};
        if (args.search_term) params.search_term = args.search_term;
        const quizzes = await api.getPaginated(
          `/courses/${args.course_id}/quizzes`,
          params
        );
        return {
          content: [{ type: "text", text: JSON.stringify(quizzes, null, 2) }],
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
    "get-quiz",
    "Get details for a specific quiz (description, time limit, question count, points)",
    {
      course_id: z.string().describe("The Canvas course ID"),
      quiz_id: z.string().describe("The quiz ID"),
    },
    async (args) => {
      try {
        const quiz = await api.get(
          `/courses/${args.course_id}/quizzes/${args.quiz_id}`
        );
        return {
          content: [{ type: "text", text: JSON.stringify(quiz, null, 2) }],
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
    "list-quiz-questions",
    "List questions in a quiz (only available if quiz allows viewing questions)",
    {
      course_id: z.string().describe("The Canvas course ID"),
      quiz_id: z.string().describe("The quiz ID"),
    },
    async (args) => {
      try {
        const questions = await api.getPaginated(
          `/courses/${args.course_id}/quizzes/${args.quiz_id}/questions`
        );
        return {
          content: [
            { type: "text", text: JSON.stringify(questions, null, 2) },
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
