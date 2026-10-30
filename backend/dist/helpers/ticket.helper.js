"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canUserCommentOnTicket = exports.canUserAssignTicket = exports.canUserModifyTicket = exports.canUserViewTicket = void 0;
const constants_1 = require("../config/constants");
const canUserViewTicket = (user, ticket) => {
    if (user.role === constants_1.UserRole.ADMIN || user.role === constants_1.UserRole.AGENT) {
        return true;
    }
    // Employee can only view their own ticket
    return ticket.createdBy.toString() === user._id.toString();
};
exports.canUserViewTicket = canUserViewTicket;
const canUserModifyTicket = (user, ticket) => {
    if (user.role === constants_1.UserRole.ADMIN || user.role === constants_1.UserRole.AGENT) {
        return true;
    }
    // Employee can only modify their own open ticket
    return (ticket.createdBy.toString() === user._id.toString() &&
        ticket.status === constants_1.TicketStatus.OPEN);
};
exports.canUserModifyTicket = canUserModifyTicket;
const canUserAssignTicket = (user) => {
    return user.role === constants_1.UserRole.ADMIN || user.role === constants_1.UserRole.AGENT;
};
exports.canUserAssignTicket = canUserAssignTicket;
const canUserCommentOnTicket = (user, ticket) => {
    if (user.role === constants_1.UserRole.ADMIN || user.role === constants_1.UserRole.AGENT) {
        return true;
    }
    return ticket.createdBy.toString() === user._id.toString();
};
exports.canUserCommentOnTicket = canUserCommentOnTicket;
