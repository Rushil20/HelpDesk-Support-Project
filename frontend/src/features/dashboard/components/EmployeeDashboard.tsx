import React from "react";
import { Grid, Box, Button, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTickets } from "@/features/tickets/hooks/useTickets";
import { TicketStatus } from "@/types/ticket.types";
import { StatCard } from "./StatCard";
import { StatusBadge } from "@/components/status-badge/StatusBadge";
import { PriorityBadge } from "@/components/priority-badge/PriorityBadge";
import { formatDate } from "@/lib/utils";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AdjustIcon from "@mui/icons-material/Adjust";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import { LoadingState } from "@/components/loading-state/LoadingState";
import { EmptyState } from "@/components/empty-state/EmptyState";

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, isLoading } = useTickets({ limit: 50 });

  if (isLoading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === TicketStatus.OPEN).length;
  const inProgressTickets = tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length;
  const resolvedTickets = tickets.filter((t) => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length;

  const recentTickets = [...tickets].slice(0, 5);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Employee Helpdesk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your support requests and get help from the support team.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/tickets/new")}
        >
          Create Ticket
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
            title="Open Tickets"
            value={openTickets}
            icon={<AdjustIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={inProgressTickets}
            icon={<AutorenewIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved / Closed"
            value={resolvedTickets}
            icon={<CheckCircleOutlineIcon />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Recent Tickets Table */}
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Recent Tickets
            </Typography>
            <Button size="small" onClick={() => navigate("/tickets")}>
              View All
            </Button>
          </Box>

          {recentTickets.length === 0 ? (
            <EmptyState
              title="No tickets created yet"
              description="Need assistance? Create a ticket and our support agents will help you."
              actionText="Create Support Ticket"
              onAction={() => navigate("/tickets/new")}
            />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTickets.map((ticket) => (
                    <TableRow key={ticket._id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/tickets/${ticket._id}`)}>
                      <TableCell sx={{ fontWeight: 500 }}>{ticket.title}</TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell>
                        {ticket.assignedTo ? ticket.assignedTo.username : (
                          <Typography variant="caption" color="text.secondary">Unassigned</Typography>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(ticket.createdAt, "MMM dd, yyyy")}</TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); navigate(`/tickets/${ticket._id}`); }}>
                          Details
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

