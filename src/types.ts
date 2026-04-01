import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CanvasAPI } from "./canvas-api.js";

export type RegisterTools = (server: McpServer, api: CanvasAPI) => void;

export interface CanvasUser {
  id: number;
  name: string;
  sortable_name: string;
  short_name: string;
  login_id: string;
  email: string;
  avatar_url: string;
  bio?: string;
  primary_email?: string;
  time_zone?: string;
  locale?: string;
}

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  enrollment_term_id: number;
  start_at: string | null;
  end_at: string | null;
  workflow_state: string;
  default_view: string;
  syllabus_body?: string;
  enrollments?: CanvasEnrollment[];
  total_students?: number;
  term?: { id: number; name: string; start_at: string; end_at: string };
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description: string | null;
  due_at: string | null;
  lock_at: string | null;
  unlock_at: string | null;
  points_possible: number;
  grading_type: string;
  submission_types: string[];
  html_url: string;
  course_id: number;
  published: boolean;
  has_submitted_submissions: boolean;
  submission?: CanvasSubmission;
}

export interface CanvasSubmission {
  id: number;
  assignment_id: number;
  user_id: number;
  submitted_at: string | null;
  score: number | null;
  grade: string | null;
  workflow_state: string;
  late: boolean;
  missing: boolean;
  excused: boolean;
  submission_type: string | null;
  body: string | null;
  url: string | null;
  preview_url: string;
  submission_comments?: CanvasSubmissionComment[];
}

export interface CanvasSubmissionComment {
  id: number;
  author_id: number;
  author_name: string;
  comment: string;
  created_at: string;
}

export interface CanvasModule {
  id: number;
  name: string;
  position: number;
  unlock_at: string | null;
  require_sequential_progress: boolean;
  items_count: number;
  items_url: string;
  state?: string;
  items?: CanvasModuleItem[];
}

export interface CanvasModuleItem {
  id: number;
  title: string;
  type: string;
  content_id: number;
  html_url: string;
  url: string;
  position: number;
  indent: number;
}

export interface CanvasFile {
  id: number;
  display_name: string;
  filename: string;
  url: string;
  size: number;
  content_type: string;
  created_at: string;
  updated_at: string;
  folder_id: number;
}

export interface CanvasFolder {
  id: number;
  name: string;
  full_name: string;
  files_count: number;
  folders_count: number;
  parent_folder_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CanvasDiscussionTopic {
  id: number;
  title: string;
  message: string | null;
  posted_at: string;
  author: { id: number; display_name: string };
  discussion_type: string;
  published: boolean;
  locked: boolean;
  pinned: boolean;
  html_url: string;
}

export interface CanvasPage {
  page_id: number;
  url: string;
  title: string;
  body: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  front_page: boolean;
}

export interface CanvasQuiz {
  id: number;
  title: string;
  description: string | null;
  quiz_type: string;
  time_limit: number | null;
  question_count: number;
  points_possible: number;
  due_at: string | null;
  lock_at: string | null;
  unlock_at: string | null;
  published: boolean;
  html_url: string;
}

export interface CanvasConversation {
  id: number;
  subject: string;
  workflow_state: string;
  last_message: string;
  last_message_at: string;
  message_count: number;
  participants: { id: number; name: string }[];
  messages?: CanvasMessage[];
}

export interface CanvasMessage {
  id: number;
  created_at: string;
  body: string;
  author_id: number;
}

export interface CanvasCalendarEvent {
  id: number;
  title: string;
  start_at: string;
  end_at: string;
  description: string | null;
  context_code: string;
  location_name: string | null;
  workflow_state: string;
  html_url: string;
}

export interface CanvasEnrollment {
  id: number;
  course_id: number;
  user_id: number;
  type: string;
  enrollment_state: string;
  grades?: CanvasGrades;
  user?: CanvasUser;
}

export interface CanvasGrades {
  current_score: number | null;
  final_score: number | null;
  current_grade: string | null;
  final_grade: string | null;
}

export interface CanvasTodoItem {
  type: string;
  assignment?: CanvasAssignment;
  context_type: string;
  course_id: number;
  html_url: string;
  needs_grading_count?: number;
}

export interface CanvasAnnouncement {
  id: number;
  title: string;
  message: string;
  posted_at: string;
  context_code: string;
  author: { id: number; display_name: string };
  html_url: string;
}
