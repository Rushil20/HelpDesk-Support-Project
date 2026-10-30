import { Schema, model, Document, Types } from "mongoose";
import { IAttachment } from "../types/common.types";

export interface IComment {
  ticketId: Types.ObjectId;
  authorId: Types.ObjectId;
  message?: string;
  attachments?: IAttachment[];
  isRead: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentDocument extends IComment, Document<Types.ObjectId> {
  _id: Types.ObjectId;
}

const attachmentSchema = new Schema(
  {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  {
    _id: true,
  }
);

const commentSchema = new Schema<ICommentDocument>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Conversation ordering index specified in requirements:
// commentSchema.index({ ticketId: 1, createdAt: 1, _id: 1 })
commentSchema.index({ ticketId: 1, createdAt: 1, _id: 1 });
commentSchema.index({ ticketId: 1, deletedAt: 1 });

export const Comment = model<ICommentDocument>("Comment", commentSchema, "comments");

