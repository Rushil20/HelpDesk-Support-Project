"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const ticket_service_1 = require("../services/ticket.service");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
class TicketController {
    static createTicket = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const ticket = await ticket_service_1.TicketService.createTicket(req.body, req.user);
        ApiResponse_1.ApiResponse.created(res, "Ticket created successfully", ticket);
    });
    static listTickets = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const query = req.query;
        const result = await ticket_service_1.TicketService.listTickets(query, req.user);
        ApiResponse_1.ApiResponse.success(res, "Tickets retrieved successfully", result);
    });
    static getTicketById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const ticket = await ticket_service_1.TicketService.getTicketById(req.params.id, req.user);
        ApiResponse_1.ApiResponse.success(res, "Ticket retrieved successfully", ticket);
    });
    static updateTicket = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const ticket = await ticket_service_1.TicketService.updateTicket(req.params.id, req.body, req.user);
        ApiResponse_1.ApiResponse.success(res, "Ticket updated successfully", ticket);
    });
    static deleteTicket = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await ticket_service_1.TicketService.deleteTicket(req.params.id, req.user);
        ApiResponse_1.ApiResponse.success(res, "Ticket deleted successfully");
    });
    static assignTicket = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const ticket = await ticket_service_1.TicketService.assignTicket(req.params.id, req.body, req.user);
        ApiResponse_1.ApiResponse.success(res, "Ticket assigned successfully", ticket);
    });
    static updateStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const ticket = await ticket_service_1.TicketService.updateStatus(req.params.id, req.body, req.user);
        ApiResponse_1.ApiResponse.success(res, "Ticket status updated successfully", ticket);
    });
    static updatePriority = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const ticket = await ticket_service_1.TicketService.updatePriority(req.params.id, req.body, req.user);
        ApiResponse_1.ApiResponse.success(res, "Ticket priority updated successfully", ticket);
    });
}
exports.TicketController = TicketController;
