# @tasque/canvas-mcp

MCP server for Canvas LMS via the official REST API.

## Tools

| Tool | Description |
|------|-------------|
| `get-profile` | Get current user's Canvas profile |
| `get-user-settings` | Get current user's notification and display settings |
| `get-avatars` | List available avatar options |
| `get-activity-stream-summary` | Get summary of unread activity |
| `list-courses` | List all courses for current user |
| `get-course` | Get details for a specific course |
| `get-course-settings` | Get settings for a specific course |
| `list-course-users` | List users enrolled in a course |
| `get-course-activity-stream` | Get recent activity stream for a course |
| `list-assignments` | List assignments for a course |
| `get-assignment` | Get full details for a specific assignment |
| `create-assignment` | Create a new assignment |
| `update-assignment` | Update an existing assignment |
| `list-submissions` | List all submissions for an assignment |
| `get-submission` | Get a specific user's submission |
| `submit-assignment` | Submit an assignment |
| `get-submission-summary` | Get graded/ungraded/not-submitted counts |
| `list-multiple-submissions` | List submissions across multiple assignments |
| `get-course-grades` | Get current grades for a course |
| `get-all-grades` | Get grades across all courses |
| `get-effective-due-dates` | Get student-specific effective due dates |
| `list-announcements` | List announcements for courses |
| `list-modules` | List all modules in a course |
| `get-module` | Get details for a specific module |
| `list-module-items` | List all items within a module |
| `get-module-item` | Get details for a specific module item |
| `list-pages` | List wiki pages in a course |
| `get-page` | Get full content of a wiki page |
| `create-page` | Create a new wiki page |
| `get-front-page` | Get the front page of a course |
| `list-course-files` | List files in a course |
| `get-file` | Get metadata and download URL for a file |
| `get-file-content` | Get text content of a file |
| `list-course-folders` | List all folders in a course |
| `list-folder-contents` | List files inside a folder |
| `list-discussions` | List discussion topics in a course |
| `get-discussion` | Get a specific discussion topic |
| `get-discussion-entries` | Get all entries in a discussion |
| `create-discussion-entry` | Post a reply to a discussion |
| `create-discussion` | Create a new discussion topic |
| `list-calendar-events` | List calendar events and assignments |
| `get-calendar-event` | Get details for a calendar event |
| `create-calendar-event` | Create a new calendar event |
| `delete-calendar-event` | Delete a calendar event |
| `list-conversations` | List inbox conversations |
| `get-conversation` | Get a conversation with all messages |
| `send-conversation` | Send a new message/conversation |
| `get-unread-count` | Get count of unread conversations |
| `list-quizzes` | List quizzes in a course |
| `get-quiz` | Get details for a specific quiz |
| `list-quiz-questions` | List questions in a quiz |
| `list-enrollments` | List enrollments for a course |
| `list-todo-items` | List todo items needing action |
| `get-todo-count` | Get count of todo items and unread messages |
| `list-upcoming-events` | List upcoming assignments and events |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CANVAS_API_TOKEN` | Yes | Canvas API access token |
| `CANVAS_BASE_URL` | Yes | Institution Canvas URL (e.g. `https://canvas.ucsd.edu`) |

## Auth Setup

Generate an API token at: Canvas > Account > Settings > New Access Token. Set both environment variables before starting the server.

## Development

```bash
npm install
npm run build
npm start        # stdio mode
```
