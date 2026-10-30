import { Schema, model, Document, Types } from "mongoose";
import {
  TicketPriority,
  TicketStatus,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../config/constants";

export interface ITicket {
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicketDocument extends ITicket, Document<Types.ObjectId> {
  _id: Types.ObjectId;
}

const ticketSchema = new Schema<ITicketDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: TICKET_PRIORITIES,
      default: TicketPriority.MEDIUM,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: TicketStatus.OPEN,
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

// Compound indexes for query optimization
ticketSchema.index({ createdBy: 1, deletedAt: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, deletedAt: 1, createdAt: -1 });
ticketSchema.index({ status: 1, priority: 1, deletedAt: 1 });

// Unique index per user for active (non-deleted) tickets to prevent duplicates
ticketSchema.index(
  { createdBy: 1, title: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  }
);

export const Ticket = model<ITicketDocument>("Ticket", ticketSchema, "tickets");
