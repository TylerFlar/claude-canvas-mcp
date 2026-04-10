# canvas-mcp

MCP server that integrates with Canvas LMS via the official REST API, exposing 55 tools for Claude Code and Claude Desktop.

## Architecture

The server runs over **stdio** transport using `@modelcontextprotocol/sdk`. It authenticates against any Canvas LMS instance using a user-generated API token (Bearer auth). Internally, a `CanvasAPI` class wraps the Canvas REST API (`/api/v1`) with built-in rate limiting (~100 req/min) and automatic cursor-based pagination. Each tool module registers Zod-validated MCP tools that delegate to the API client.

## Prerequisites

- Node.js >= 18 (uses native `fetch()`)
- A Canvas LMS account with an API access token

## Setup

### 1. Install & Build

```bash
npm install
npm run build
```

### 2. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CANVAS_API_TOKEN` | Yes | Canvas API access token. Generate at: Canvas > Account > Settings > New Access Token |
| `CANVAS_BASE_URL` | Yes | Your institution's Canvas URL (e.g. `https://canvas.ucsd.edu`, `https://canvas.instructure.com`) |

### 3. MCP Client Configuration

**Claude Code** (`~/.claude.json` global or `.mcp.json` project-level):

```json
{
  "mcpServers": {
    "canvas": {
      "command": "node",
      "args": ["/absolute/path/to/claude-canvas-mcp/dist/index.js"],
      "env": {
        "CANVAS_API_TOKEN": "your-token-here",
        "CANVAS_BASE_URL": "https://canvas.your-school.edu"
      }
    }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "canvas": {
      "command": "node",
      "args": ["/absolute/path/to/claude-canvas-mcp/dist/index.js"],
      "env": {
        "CANVAS_API_TOKEN": "your-token-here",
        "CANVAS_BASE_URL": "https://canvas.your-school.edu"
      }
    }
  }
}
```

## Tools Reference

### User (4 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `get-profile` | — | Get the current user's Canvas profile (name, email, bio, avatar) |
| `get-user-settings` | — | Get the current user's Canvas notification and display settings |
| `get-avatars` | — | List available avatar options for the current user |
| `get-activity-stream-summary` | — | Get summary of unread activity (submissions needing grading, new messages, etc.) |

### Courses (5 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-courses` | `enrollment_type?: "teacher"\|"student"\|"ta"\|"observer"\|"designer"`, `enrollment_state?: "active"\|"invited"\|"completed"`, `include?: ("total_scores"\|"current_grading_period_scores"\|"term"\|"course_image"\|"favorites")[]` | List all courses for the current user |
| `get-course` | `course_id: string`, `include?: string[]` | Get details for a specific course by ID |
| `get-course-settings` | `course_id: string` | Get settings for a specific course (grading, features, etc.) |
| `list-course-users` | `course_id: string`, `enrollment_type?: string[]`, `search_term?: string` | List users enrolled in a course (students, teachers, TAs) |
| `get-course-activity-stream` | `course_id: string` | Get recent activity stream for a course |

### Assignments (4 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-assignments` | `course_id: string`, `search_term?: string`, `bucket?: "past"\|"overdue"\|"undated"\|"ungraded"\|"unsubmitted"\|"upcoming"\|"future"`, `order_by?: "position"\|"name"\|"due_at"`, `include?: ("submission"\|"score_statistics")[]` | List assignments for a course with optional filtering |
| `get-assignment` | `course_id: string`, `assignment_id: string`, `include?: string[]` | Get full details for a specific assignment |
| `create-assignment` | `course_id: string`, `name: string`, `description?: string`, `due_at?: string`, `points_possible?: number`, `submission_types?: string[]`, `published?: boolean` | Create a new assignment in a course |
| `update-assignment` | `course_id: string`, `assignment_id: string`, `name?: string`, `description?: string`, `due_at?: string`, `points_possible?: number`, `published?: boolean` | Update an existing assignment |

### Submissions (5 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-submissions` | `course_id: string`, `assignment_id: string`, `include?: ("submission_comments"\|"rubric_assessment"\|"user")[]` | List all submissions for a specific assignment |
| `get-submission` | `course_id: string`, `assignment_id: string`, `user_id?: string` (default: `"self"`), `include?: string[]` | Get a specific user's submission for an assignment |
| `submit-assignment` | `course_id: string`, `assignment_id: string`, `submission_type: "online_text_entry"\|"online_url"\|"online_upload"`, `body?: string`, `url?: string`, `file_ids?: number[]` | Submit an assignment (text entry, URL, or file upload) |
| `get-submission-summary` | `course_id: string`, `assignment_id: string` | Get graded/ungraded/not-submitted counts for an assignment |
| `list-multiple-submissions` | `course_id: string`, `student_ids?: string[]`, `assignment_ids?: string[]`, `grouped?: boolean` | List submissions across multiple assignments |

### Grades (3 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `get-course-grades` | `course_id: string` | Get current grades for the authenticated user in a specific course |
| `get-all-grades` | `include_completed?: boolean` | Get grades across all courses for the current user |
| `get-effective-due-dates` | `course_id: string` | Get student-specific effective due dates for all assignments in a course |

### Announcements (1 tool)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-announcements` | `context_codes: string[]`, `start_date?: string`, `end_date?: string`, `active_only?: boolean`, `latest_only?: boolean` | List announcements for one or more courses. Context codes format: `course_12345` |

### Modules (4 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-modules` | `course_id: string`, `include?: ("items"\|"content_details")[]`, `search_term?: string` | List all modules in a course with optional item details |
| `get-module` | `course_id: string`, `module_id: string`, `include?: string[]` | Get details for a specific module |
| `list-module-items` | `course_id: string`, `module_id: string`, `include?: ("content_details")[]` | List all items within a module |
| `get-module-item` | `course_id: string`, `module_id: string`, `item_id: string` | Get details for a specific module item |

### Pages (4 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-pages` | `course_id: string`, `search_term?: string`, `sort?: "title"\|"created_at"\|"updated_at"`, `published?: boolean` | List wiki pages in a course |
| `get-page` | `course_id: string`, `page_url_or_id: string` | Get the full content of a specific wiki page |
| `create-page` | `course_id: string`, `title: string`, `body?: string`, `published?: boolean` | Create a new wiki page in a course |
| `get-front-page` | `course_id: string` | Get the front/home page of a course |

### Files (5 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-course-files` | `course_id: string`, `search_term?: string`, `content_types?: string[]`, `sort?: "name"\|"size"\|"created_at"\|"updated_at"` | List files in a course |
| `get-file` | `file_id: string` | Get metadata and download URL for a specific file |
| `get-file-content` | `file_id: string` | Get the text content of a file (for text-based files like .txt, .py, .csv) |
| `list-course-folders` | `course_id: string` | List all folders in a course |
| `list-folder-contents` | `folder_id: string` | List files inside a specific folder |

### Discussions (5 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-discussions` | `course_id: string`, `order_by?: "position"\|"recent_activity"\|"title"`, `search_term?: string`, `scope?: "locked"\|"unlocked"\|"pinned"\|"unpinned"` | List discussion topics in a course |
| `get-discussion` | `course_id: string`, `topic_id: string` | Get a specific discussion topic with its full message |
| `get-discussion-entries` | `course_id: string`, `topic_id: string` | Get all entries/replies in a discussion topic |
| `create-discussion-entry` | `course_id: string`, `topic_id: string`, `message: string` | Post a new reply to a discussion topic |
| `create-discussion` | `course_id: string`, `title: string`, `message?: string`, `discussion_type?: "side_comment"\|"threaded"`, `published?: boolean` | Create a new discussion topic |

### Calendar (4 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-calendar-events` | `type?: "event"\|"assignment"`, `start_date?: string`, `end_date?: string`, `context_codes?: string[]`, `undated?: boolean` | List calendar events and/or assignments in a date range |
| `get-calendar-event` | `event_id: string` | Get details for a specific calendar event |
| `create-calendar-event` | `title: string`, `start_at: string`, `end_at: string`, `context_code: string`, `description?: string`, `location_name?: string` | Create a new calendar event |
| `delete-calendar-event` | `event_id: string`, `cancel_reason?: string` | Delete a calendar event |

### Conversations (4 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-conversations` | `scope?: "unread"\|"starred"\|"archived"\|"sent"`, `filter?: string[]` | List inbox conversations |
| `get-conversation` | `conversation_id: string`, `auto_mark_as_read?: boolean` | Get a specific conversation with all its messages |
| `send-conversation` | `recipients: string[]`, `subject: string`, `body: string`, `group_conversation?: boolean`, `context_code?: string` | Send a new message/conversation |
| `get-unread-count` | — | Get the count of unread conversations |

### Quizzes (3 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-quizzes` | `course_id: string`, `search_term?: string` | List quizzes in a course |
| `get-quiz` | `course_id: string`, `quiz_id: string` | Get details for a specific quiz |
| `list-quiz-questions` | `course_id: string`, `quiz_id: string` | List questions in a quiz (if allowed) |

### Enrollments (1 tool)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-enrollments` | `course_id: string`, `user_id?: string`, `type?: string[]`, `state?: ("active"\|"invited"\|"completed"\|"inactive")[]`, `include?: ("current_points"\|"avatar_url")[]` | List enrollments for a course with optional grade data |

### Todo (3 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `list-todo-items` | — | List the current user's todo items (assignments needing submission or grading) |
| `get-todo-count` | — | Get the count of todo items and unread messages |
| `list-upcoming-events` | — | List upcoming assignments and calendar events |

## Internal API Layer

### `CanvasAPI`

- **Purpose**: Wraps the Canvas REST API (`/api/v1`) with auth, rate limiting, and pagination
- **Auth flow**: Bearer token in `Authorization` header on every request. Token is provided via `CANVAS_API_TOKEN` env var at startup; no refresh/rotation logic.
- **Key methods**:
  - `get<T>(path, params?)` — GET request
  - `post<T>(path, body)` — POST request
  - `put<T>(path, body)` — PUT request
  - `delete<T>(path, params?)` — DELETE request
  - `getPaginated<T>(path, params?, maxPages=10)` — Auto-follows `Link` header pagination (default max 10 pages)
- **Rate limiting**: 600ms minimum interval between requests (~100 req/min) via internal throttle
- **Error handling**: Parses Canvas error responses (JSON `errors` or `message` fields), throws `Error` with formatted message including HTTP status and endpoint. No custom error types or retry logic.

## Data Models

Key TypeScript interfaces from `src/types.ts`:

```typescript
interface CanvasUser {
  id: number; name: string; sortable_name: string; short_name: string;
  login_id: string; email: string; avatar_url: string; bio?: string;
  primary_email?: string; time_zone?: string; locale?: string;
}

interface CanvasCourse {
  id: number; name: string; course_code: string; enrollment_term_id: number;
  start_at: string | null; end_at: string | null; workflow_state: string;
  default_view: string; syllabus_body?: string; enrollments?: CanvasEnrollment[];
  total_students?: number; term?: { id: number; name: string; start_at: string; end_at: string };
}

interface CanvasAssignment {
  id: number; name: string; description: string | null; due_at: string | null;
  lock_at: string | null; unlock_at: string | null; points_possible: number;
  grading_type: string; submission_types: string[]; html_url: string;
  course_id: number; published: boolean; has_submitted_submissions: boolean;
  submission?: CanvasSubmission;
}

interface CanvasSubmission {
  id: number; assignment_id: number; user_id: number; submitted_at: string | null;
  score: number | null; grade: string | null; workflow_state: string;
  late: boolean; missing: boolean; excused: boolean; submission_type: string | null;
  body: string | null; url: string | null; preview_url: string;
  submission_comments?: CanvasSubmissionComment[];
}

interface CanvasEnrollment {
  id: number; course_id: number; user_id: number; type: string;
  enrollment_state: string; grades?: CanvasGrades; user?: CanvasUser;
}

interface CanvasGrades {
  current_score: number | null; final_score: number | null;
  current_grade: string | null; final_grade: string | null;
}

interface CanvasModule { id: number; name: string; position: number; unlock_at: string | null; require_sequential_progress: boolean; items_count: number; items_url: string; state?: string; items?: CanvasModuleItem[]; }
interface CanvasModuleItem { id: number; title: string; type: string; content_id: number; html_url: string; url: string; position: number; indent: number; }
interface CanvasFile { id: number; display_name: string; filename: string; url: string; size: number; content_type: string; created_at: string; updated_at: string; folder_id: number; }
interface CanvasFolder { id: number; name: string; full_name: string; files_count: number; folders_count: number; parent_folder_id: number | null; created_at: string; updated_at: string; }
interface CanvasDiscussionTopic { id: number; title: string; message: string | null; posted_at: string; author: { id: number; display_name: string }; discussion_type: string; published: boolean; locked: boolean; pinned: boolean; html_url: string; }
interface CanvasPage { page_id: number; url: string; title: string; body: string | null; published: boolean; created_at: string; updated_at: string; front_page: boolean; }
interface CanvasQuiz { id: number; title: string; description: string | null; quiz_type: string; time_limit: number | null; question_count: number; points_possible: number; due_at: string | null; lock_at: string | null; unlock_at: string | null; published: boolean; html_url: string; }
interface CanvasConversation { id: number; subject: string; workflow_state: string; last_message: string; last_message_at: string; message_count: number; participants: { id: number; name: string }[]; messages?: CanvasMessage[]; }
interface CanvasMessage { id: number; created_at: string; body: string; author_id: number; }
interface CanvasCalendarEvent { id: number; title: string; start_at: string; end_at: string; description: string | null; context_code: string; location_name: string | null; workflow_state: string; html_url: string; }
interface CanvasSubmissionComment { id: number; author_id: number; author_name: string; comment: string; created_at: string; }
interface CanvasTodoItem { type: string; assignment?: CanvasAssignment; context_type: string; course_id: number; html_url: string; needs_grading_count?: number; }
interface CanvasAnnouncement { id: number; title: string; message: string; posted_at: string; context_code: string; author: { id: number; display_name: string }; html_url: string; }
```

## Development

```bash
npm run dev    # Watch mode (tsc --watch)
npm run build  # Production build (tsc)
npm start      # Run built server (node dist/index.js)
```

## Security Considerations

- **Token storage**: The Canvas API token is passed via environment variable; it is not persisted or logged by the server. Treat it like a password — it grants full API access scoped to the user who generated it.
- **Data access**: The server can access anything the token owner can access in Canvas: grades, submissions, messages, files, user profiles, etc.
- **Rate limiting**: Built-in 600ms throttle between requests. Canvas also enforces server-side rate limits; exceeding them returns HTTP 403.
- **No TOS risk**: Uses the official, documented Canvas REST API with user-generated tokens — no scraping, no unofficial endpoints.

## License

MIT
