"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../config/constants");
const ticketSchema = new mongoose_1.Schema({
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
        enum: constants_1.TICKET_PRIORITIES,
        default: constants_1.TicketPriority.MEDIUM,
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: constants_1.TICKET_STATUSES,
        default: constants_1.TicketStatus.OPEN,
        required: true,
        index: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// Compound indexes for query optimization
ticketSchema.index({ createdBy: 1, deletedAt: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, deletedAt: 1, createdAt: -1 });
ticketSchema.index({ status: 1, priority: 1, deletedAt: 1 });
// Unique index per user for active (non-deleted) tickets to prevent duplicates
ticketSchema.index({ createdBy: 1, title: 1 }, {
    unique: true,
    partialFilterExpression: { deletedAt: null },
});
exports.Ticket = (0, mongoose_1.model)("Ticket", ticketSchema, "tickets");
