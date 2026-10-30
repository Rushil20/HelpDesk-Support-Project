"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../config/constants");
const password_1 = require("../utils/password");
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: constants_1.USER_ROLES,
        default: constants_1.UserRole.EMPLOYEE,
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: constants_1.USER_STATUSES,
        default: constants_1.UserStatus.ACTIVE,
        required: true,
        index: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) {
        return;
    }
    // Avoid re-hashing if already an Argon2 hash
    if (this.password.startsWith("$argon2id$") || this.password.startsWith("$argon2i$")) {
        return;
    }
    this.password = await (0, password_1.hashPassword)(this.password);
});
userSchema.methods.toSanitized = function () {
    const userObj = this.toObject();
    delete userObj.password;
    return userObj;
};
exports.User = (0, mongoose_1.model)("User", userSchema, "users");
