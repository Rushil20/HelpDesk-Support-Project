import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Button,
  Typography,
  InputAdornment,
  Grid,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTickets } from "../hooks/useTickets";
import { useAuthStore } from "@/stores/auth.store";
import { useDebounce } from "@/hooks/useDebounce";
import { TicketPriority, TicketStatus } from "@/types/ticket.types";
import { UserRole } from "@/types/auth.types";
import { StatusBadge } from "@/components/status-badge/StatusBadge";
import { PriorityBadge } from "@/components/priority-badge/PriorityBadge";
import { PageHeader } from "@/components/page-header/PageHeader";
import { LoadingState } from "@/components/loading-state/LoadingState";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { formatDate } from "@/lib/utils";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";

export const TicketListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();

  const isAssignedToMeParam = searchParams.get("assigned") === "me";

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const debouncedSearch = useDebounce(search, 400);

  const queryParams = {
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch.trim() || undefined,
    status: statusFilter ? (statusFilter as TicketStatus) : undefined,
    priority: priorityFilter ? (priorityFilter as TicketPriority) : undefined,
    assignedTo: isAssignedToMeParam && user ? user._id : undefined,
  };

  const { tickets, pagination, isLoading, isFetching } = useTickets(queryParams);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setPage(0);
    if (isAssignedToMeParam) {
      setSearchParams({});
    }
  };

  const isFiltered = !!search || !!statusFilter || !!priorityFilter || isAssignedToMeParam;

  return (
    <Box>
      <PageHeader
        title={isAssignedToMeParam ? "My Assigned Tickets" : user?.role === UserRole.EMPLOYEE ? "My Support Tickets" : "Support Tickets"}
        subtitle="Browse, filter, and manage tickets in the queue"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/tickets/new")}
          >
            Create Ticket
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4} md={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by ticket title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={4} md={2.5}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.values(TicketStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <StatusBadge status={status} size="small" />
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6} sm={4} md={2.5}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Priority"
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  {Object.values(TicketPriority).map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PriorityBadge priority={priority} size="small" />
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={2} sx={{ display: "flex", gap: 1 }}>
                {isFiltered && (
                  <Button
                    size="small"
                    color="inherit"
                    onClick={handleResetFilters}
                    startIcon={<FilterListIcon />}
                    sx={{ width: "100%" }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        {isLoading ? (
          <LoadingState message="Loading ticket queue..." minHeight={300} />
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No tickets found"
            description={
              isFiltered
                ? "No tickets match your filter criteria. Try clearing some filters."
                : "You don't have any tickets yet. Create your first support request to get started."
            }
            actionText={isFiltered ? "Reset Filters" : "Create Ticket"}
            onAction={isFiltered ? handleResetFilters : () => navigate("/tickets/new")}
          />
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    {user?.role !== UserRole.EMPLOYEE && (
                      <TableCell sx={{ fontWeight: 600 }}>Created By</TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow
                      key={ticket._id}
                      hover
                      sx={{ cursor: "pointer", opacity: isFetching ? 0.6 : 1 }}
                      onClick={() => navigate(`/tickets/${ticket._id}`)}
                    >
                      <TableCell sx={{ fontWeight: 600, maxWidth: 300 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {ticket.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", maxWidth: 280 }}>
                          {ticket.description}
                        </Typography>
                      </TableCell>

                      {user?.role !== UserRole.EMPLOYEE && (
                        <TableCell>
                          <Typography variant="body2">
                            {ticket.createdBy?.username || "-"}
                          </Typography>
                        </TableCell>
                      )}

                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>

                      <TableCell>
                        {ticket.assignedTo ? (
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {ticket.assignedTo.username}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Unassigned
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
                        {formatDate(ticket.createdAt, "MMM dd, yyyy")}
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tickets/${ticket._id}`);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={pagination?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </>
        )}
      </Card>
    </Box>
  );
};

