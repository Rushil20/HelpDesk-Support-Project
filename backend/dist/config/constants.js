"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TICKET_STATUSES = exports.TICKET_PRIORITIES = exports.USER_STATUSES = exports.USER_ROLES = exports.TicketStatus = exports.TicketPriority = exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["EMPLOYEE"] = "employee";
    UserRole["AGENT"] = "agent";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var TicketPriority;
(function (TicketPriority) {
    TicketPriority["LOW"] = "low";
    TicketPriority["MEDIUM"] = "medium";
    TicketPriority["HIGH"] = "high";
})(TicketPriority || (exports.TicketPriority = TicketPriority = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["OPEN"] = "open";
    TicketStatus["IN_PROGRESS"] = "in_progress";
    TicketStatus["RESOLVED"] = "resolved";
    TicketStatus["CLOSED"] = "closed";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
exports.USER_ROLES = Object.values(UserRole);
exports.USER_STATUSES = Object.values(UserStatus);
exports.TICKET_PRIORITIES = Object.values(TicketPriority);
exports.TICKET_STATUSES = Object.values(TicketStatus);
