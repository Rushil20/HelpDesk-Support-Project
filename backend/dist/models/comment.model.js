"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const attachmentSchema = new mongoose_1.Schema({
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
}, {
    _id: true,
});
const commentSchema = new mongoose_1.Schema({
    ticketId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true,
        index: true,
    },
    authorId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    versionKey: false,
});
// Conversation ordering index specified in requirements:
// commentSchema.index({ ticketId: 1, createdAt: 1, _id: 1 })
commentSchema.index({ ticketId: 1, createdAt: 1, _id: 1 });
commentSchema.index({ ticketId: 1, deletedAt: 1 });
exports.Comment = (0, mongoose_1.model)("Comment", commentSchema, "comments");
