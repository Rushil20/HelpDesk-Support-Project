import { Request, Response } from "express";
import { TicketService } from "../services/ticket.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ListTicketsQuery } from "../validators/ticket.validator";

export class TicketController {
  static createTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const ticket = await TicketService.createTicket(req.body, req.user!);
    ApiResponse.created(res, "Ticket created successfully", ticket);
  });

  static listTickets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListTicketsQuery;
    const result = await TicketService.listTickets(query, req.user!);
    ApiResponse.success(res, "Tickets retrieved successfully", result);
  });

  static getTicketById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const ticket = await TicketService.getTicketById(req.params.id as string, req.user!);
    ApiResponse.success(res, "Ticket retrieved successfully", ticket);
  });

  static updateTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const ticket = await TicketService.updateTicket(
      req.params.id as string,
      req.body,
      req.user!
    );
    ApiResponse.success(res, "Ticket updated successfully", ticket);
  });

  static deleteTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await TicketService.deleteTicket(req.params.id as string, req.user!);
    ApiResponse.success(res, "Ticket deleted successfully");
  });

  static assignTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const ticket = await TicketService.assignTicket(
      req.params.id as string,
      req.body,
      req.user!
    );
    ApiResponse.success(res, "Ticket assigned successfully", ticket);
  });

  static updateStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const ticket = await TicketService.updateStatus(
      req.params.id as string,
      req.body,
      req.user!
    );
    ApiResponse.success(res, "Ticket status updated successfully", ticket);
  });

  static updatePriority = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const ticket = await TicketService.updatePriority(
      req.params.id as string,
      req.body,
      req.user!
    );
    ApiResponse.success(res, "Ticket priority updated successfully", ticket);
  });
}

