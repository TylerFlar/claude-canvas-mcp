# Canvas MCP

An MCP (Model Context Protocol) server that connects Claude to any Canvas LMS instance. Provides 55 tools for managing courses, assignments, grades, discussions, files, and more.

## Features

- **Courses** - List, view details, settings, enrolled users, activity stream
- **Assignments** - List, view, create, update assignments with filtering by status
- **Submissions** - View submissions, submit assignments (text, URL, file), submission summaries
- **Grades** - View grades per course or across all courses, effective due dates
- **Announcements** - List announcements across courses with date filtering
- **Modules** - Browse modules and module items with content details
- **Pages** - List, view, and create wiki pages, view front page
- **Files** - Browse files/folders, get download URLs, read text file contents
- **Discussions** - List topics, view threaded entries, post replies, create topics
- **Calendar** - List, create, and delete calendar events
- **Conversations** - View inbox, read threads, send messages, unread count
- **Quizzes** - List quizzes, view details and questions
- **Enrollments** - List enrollments with grade data
- **Todo** - View todo items, counts, and upcoming events
- **User** - Profile, settings, avatars, activity stream summary

## Setup

### 1. Get a Canvas API Token

1. Log in to your Canvas instance
2. Go to **Account** > **Settings**
3. Scroll to **Approved Integrations**
4. Click **+ New Access Token**
5. Give it a name and generate the token

### 2. Build

```bash
npm install
npm run build
```

### 3. Configure Claude Code

Add to your Claude Code MCP config (`~/.claude.json` for global, or `.mcp.json` for project-level):

```json
{
  "mcpServers": {
    "canvas": {
      "command": "node",
      "args": ["/path/to/claude-canvas-mcp/dist/index.js"],
      "env": {
        "CANVAS_API_TOKEN": "your-token-here",
        "CANVAS_BASE_URL": "https://canvas.your-school.edu"
      }
    }
  }
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CANVAS_API_TOKEN` | Yes | Your Canvas API access token |
| `CANVAS_BASE_URL` | Yes | Your institution's Canvas URL (e.g. `https://canvas.ucsd.edu`) |

## Tools Reference

| Category | Tools | Count |
|----------|-------|-------|
| User | `get-profile`, `get-user-settings`, `get-avatars`, `get-activity-stream-summary` | 4 |
| Courses | `list-courses`, `get-course`, `get-course-settings`, `list-course-users`, `get-course-activity-stream` | 5 |
| Assignments | `list-assignments`, `get-assignment`, `create-assignment`, `update-assignment` | 4 |
| Submissions | `list-submissions`, `get-submission`, `submit-assignment`, `get-submission-summary`, `list-multiple-submissions` | 5 |
| Grades | `get-course-grades`, `get-all-grades`, `get-effective-due-dates` | 3 |
| Announcements | `list-announcements` | 1 |
| Calendar | `list-calendar-events`, `get-calendar-event`, `create-calendar-event`, `delete-calendar-event` | 4 |
| Modules | `list-modules`, `get-module`, `list-module-items`, `get-module-item` | 4 |
| Files | `list-course-files`, `get-file`, `get-file-content`, `list-course-folders`, `list-folder-contents` | 5 |
| Discussions | `list-discussions`, `get-discussion`, `get-discussion-entries`, `create-discussion-entry`, `create-discussion` | 5 |
| Pages | `list-pages`, `get-page`, `create-page`, `get-front-page` | 4 |
| Quizzes | `list-quizzes`, `get-quiz`, `list-quiz-questions` | 3 |
| Conversations | `list-conversations`, `get-conversation`, `send-conversation`, `get-unread-count` | 4 |
| Todo | `list-todo-items`, `get-todo-count`, `list-upcoming-events` | 3 |
| Enrollments | `list-enrollments` | 1 |
| **Total** | | **55** |

## Compatibility

Works with any Canvas LMS instance hosted by Instructure. The Canvas REST API is standardized across all institutions.

## License

MIT
