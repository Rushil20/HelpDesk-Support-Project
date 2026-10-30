import { UserRole } from "./auth.types";

export interface Attachment {
  _id?: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  uploadedAt?: string;
}

export interface CommentAuthor {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface Comment {
  _id: string;
  ticketId: string;
  authorId: CommentAuthor;
  message?: string;
  attachments: Attachment[];
  isRead: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDTO {
  message?: string;
  attachments?: Attachment[];
}

export interface UpdateCommentDTO {
  message?: string;
  attachments?: Attachment[];
}

