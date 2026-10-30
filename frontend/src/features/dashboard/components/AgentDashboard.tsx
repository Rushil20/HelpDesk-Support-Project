import React from "react";
import { Grid, Box, Button, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTickets } from "@/features/tickets/hooks/useTickets";
import { useAuthStore } from "@/stores/auth.store";
import { TicketPriority, TicketStatus } from "@/types/ticket.types";
import { StatCard } from "./StatCard";
import { StatusBadge } from "@/components/status-badge/StatusBadge";
import { PriorityBadge } from "@/components/priority-badge/PriorityBadge";
import { formatDate } from "@/lib/utils";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import AddIcon from "@mui/icons-material/Add";
import { LoadingState } from "@/components/loading-state/LoadingState";
import { EmptyState } from "@/components/empty-state/EmptyState";

export const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tickets, isLoading } = useTickets({ limit: 100 });

  if (isLoading) {
    return <LoadingState message="Loading agent dashboard..." />;
  }

  const totalTickets = tickets.length;
  const assignedToMe = tickets.filter((t) => t.assignedTo?._id === user?._id).length;
  const unassigned = tickets.filter((t) => !t.assignedTo && t.status !== TicketStatus.CLOSED).length;
  const highPriority = tickets.filter(
    (t) => t.priority === TicketPriority.HIGH && t.status !== TicketStatus.RESOLVED && t.status !== TicketStatus.CLOSED
  ).length;

  const urgentQueue = tickets
    .filter((t) => t.status !== TicketStatus.CLOSED && t.status !== TicketStatus.RESOLVED)
    .slice(0, 6);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Support Agent Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage incoming requests, triage issues, and resolve tickets.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/tickets/new")}
        >
          New Ticket (On Behalf)
        </Button>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tickets"
            value={totalTickets}
            icon={<ConfirmationNumberIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assigned to Me"
            value={assignedToMe}
            icon={<AssignmentIndIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unassigned Queue"
            value={unassigned}
            icon={<HelpOutlineIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="High Priority Active"
            value={highPriority}
            icon={<PriorityHighIcon />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Urgent Ticket Queue */}
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Active Tickets Awaiting Resolution
            </Typography>
            <Button size="small" onClick={() => navigate("/tickets")}>
              View All Queue
            </Button>
          </Box>

          {urgentQueue.length === 0 ? (
            <EmptyState
              title="All caught up!"
              description="There are currently no open tickets requiring immediate attention."
            />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created By</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {urgentQueue.map((ticket) => (
                    <TableRow key={ticket._id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/tickets/${ticket._id}`)}>
                      <TableCell sx={{ fontWeight: 500 }}>{ticket.title}</TableCell>
                      <TableCell>{ticket.createdBy?.username || "-"}</TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell>
                        {ticket.assignedTo ? (
                          <Typography variant="body2" sx={{ fontWeight: ticket.assignedTo._id === user?._id ? 600 : 400 }}>
                            {ticket.assignedTo.username} {ticket.assignedTo._id === user?._id && "(You)"}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                            Unassigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(ticket.createdAt, "MMM dd, yyyy")}</TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); navigate(`/tickets/${ticket._id}`); }}>
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

