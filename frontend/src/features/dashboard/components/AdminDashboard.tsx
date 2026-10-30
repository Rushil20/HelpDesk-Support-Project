import React from "react";
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTickets } from "@/features/tickets/hooks/useTickets";
import { useUsers } from "@/features/users/hooks/useUsers";
import { TicketPriority, TicketStatus } from "@/types/ticket.types";
import { UserRole, UserStatus } from "@/types/auth.types";
import { StatCard } from "./StatCard";
import { StatusBadge } from "@/components/status-badge/StatusBadge";
import { PriorityBadge } from "@/components/priority-badge/PriorityBadge";
import { UserRoleBadge } from "@/components/common/UserRoleBadge";
import { formatDate } from "@/lib/utils";
import PeopleIcon from "@mui/icons-material/People";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AdjustIcon from "@mui/icons-material/Adjust";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { LoadingState } from "@/components/loading-state/LoadingState";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, isLoading: isTicketsLoading } = useTickets({ limit: 100 });
  const { users, isLoading: isUsersLoading } = useUsers({ limit: 100 });

  if (isTicketsLoading || isUsersLoading) {
    return <LoadingState message="Aggregating admin metrics..." />;
  }

  const totalUsers = users.length;
  const activeStaff = users.filter(
    (u) => (u.role === UserRole.AGENT || u.role === UserRole.ADMIN) && u.status === UserStatus.ACTIVE
  ).length;

  const totalTickets = tickets.length;
  const openIssues = tickets.filter((t) => t.status === TicketStatus.OPEN).length;

  // Recharts Data for Status Distribution
  const statusData = [
    { name: "Open", count: tickets.filter((t) => t.status === TicketStatus.OPEN).length, color: "#0284c7" },
    { name: "In Progress", count: tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length, color: "#f59e0b" },
    { name: "Resolved", count: tickets.filter((t) => t.status === TicketStatus.RESOLVED).length, color: "#10b981" },
    { name: "Closed", count: tickets.filter((t) => t.status === TicketStatus.CLOSED).length, color: "#64748b" },
  ];

  // Recharts Data for Priority Distribution
  const priorityData = [
    { name: "High", count: tickets.filter((t) => t.priority === TicketPriority.HIGH).length, color: "#ef4444" },
    { name: "Medium", count: tickets.filter((t) => t.priority === TicketPriority.MEDIUM).length, color: "#3b82f6" },
    { name: "Low", count: tickets.filter((t) => t.priority === TicketPriority.LOW).length, color: "#94a3b8" },
  ];

  const recentTickets = [...tickets].slice(0, 5);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          System Administration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of company users, support queues, and resolution performance.
        </Typography>
      </Box>

      {/* Top Level Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Agents & Staff"
            value={activeStaff}
            icon={<SupportAgentIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tickets"
            value={totalTickets}
            icon={<ConfirmationNumberIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open Tickets"
            value={openIssues}
            icon={<AdjustIcon />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Visual Analytics Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Status Distribution Bar Chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: 320 }}>
            <CardContent sx={{ height: "100%", p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Ticket Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority Distribution Pie Chart */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: 320 }}>
            <CardContent sx={{ height: "100%", p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Priority Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity Table */}
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Recent Tickets System-Wide
            </Typography>
            <Button size="small" onClick={() => navigate("/tickets")}>
              Manage All Tickets
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Creator</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTickets.map((ticket) => (
                  <TableRow key={ticket._id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/tickets/${ticket._id}`)}>
                    <TableCell sx={{ fontWeight: 500 }}>{ticket.title}</TableCell>
                    <TableCell>{ticket.createdBy?.username || "-"}</TableCell>
                    <TableCell>
                      {ticket.createdBy && <UserRoleBadge role={ticket.createdBy.role} size="small" />}
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={ticket.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>{ticket.assignedTo?.username || "Unassigned"}</TableCell>
                    <TableCell>{formatDate(ticket.createdAt, "MMM dd, yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

