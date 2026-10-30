import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  TextField,
  MenuItem,
  Avatar,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useTicketDetail, useTickets } from "../hooks/useTickets";
import { useComments } from "@/features/conversations/hooks/useComments";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useAuthStore } from "@/stores/auth.store";
import { TicketStatus, TicketPriority } from "@/types/ticket.types";
import { UserRole } from "@/types/auth.types";
import { Attachment } from "@/types/comment.types";
import { StatusBadge } from "@/components/status-badge/StatusBadge";
import { PriorityBadge } from "@/components/priority-badge/PriorityBadge";
import { UserRoleBadge } from "@/components/common/UserRoleBadge";
import { ConversationMessage } from "@/features/conversations/components/ConversationMessage";
import { MessageComposer } from "@/features/conversations/components/MessageComposer";
import { ConfirmDialog } from "@/components/confirm-dialog/ConfirmDialog";
import { LoadingState } from "@/components/loading-state/LoadingState";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { formatDate, getInitials } from "@/lib/utils";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: ticket, isLoading: isTicketLoading, error: ticketError } = useTicketDetail(id);
  const { updateStatus, isUpdatingStatus, updatePriority, isUpdatingPriority, assignTicket, isAssigning, deleteTicket, isDeleting } = useTickets();
  const { comments, isLoading: isCommentsLoading, createComment, isCreating: isSendingComment, deleteComment } = useComments(id || "");

  // If Agent/Admin, fetch active agents for assignment dropdown
  const isAgentOrAdmin = user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN;
  const { users: agentsList } = useUsers(isAgentOrAdmin ? { role: UserRole.AGENT, limit: 100 } : undefined);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isTicketLoading) {
    return <LoadingState message="Loading ticket details..." minHeight={400} />;
  }

  if (ticketError || !ticket) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          title="Ticket Not Found"
          description="The ticket you are looking for does not exist or you do not have permission to view it."
          actionText="Back to Tickets"
          onAction={() => navigate("/tickets")}
        />
      </Box>
    );
  }

  const isOwner = ticket.createdBy._id === user?._id;
  const canDelete = isAgentOrAdmin || (isOwner && ticket.status === TicketStatus.OPEN);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      setActionError(null);
      await updateStatus({ id: ticket._id, status: newStatus });
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    try {
      setActionError(null);
      await updatePriority({ id: ticket._id, priority: newPriority });
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to update priority.");
    }
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    try {
      setActionError(null);
      await assignTicket({ id: ticket._id, assignedTo: newAssigneeId });
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to update assignment.");
    }
  };

  const handleSendMessage = async (message: string, attachments: Attachment[]) => {
    try {
      setActionError(null);
      await createComment({ message, attachments });
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to send message.");
    }
  };

  const handleDeleteTicket = async () => {
    try {
      await deleteTicket(ticket._id);
      navigate("/tickets");
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete ticket.");
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      {/* Back button and quick actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/tickets")}
          color="inherit"
          size="small"
        >
          Back to Tickets
        </Button>

        {canDelete && (
          <Button
            color="error"
            size="small"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setConfirmDeleteOpen(true)}
          >
            Delete Ticket
          </Button>
        )}
      </Box>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {/* Main Grid: Left side conversation & description; Right side properties */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Ticket Header Card */}
          <Card sx={{ mb: 3, overflow: "hidden" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {ticket.title}
                </Typography>
                <Box sx={{ flexShrink: 0 }}>
                  <StatusBadge status={ticket.status} />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Description Section with Text Wrapping */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.75,
                    display: "block",
                    mb: 1.25,
                  }}
                >
                  Description
                </Typography>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === "light" ? "grey.50" : "background.default",
                    border: "1px solid",
                    borderColor: "divider",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.primary",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      lineHeight: 1.65,
                    }}
                  >
                    {ticket.description}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Conversation Stream */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <ChatBubbleOutlineIcon color="primary" fontSize="small" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Conversation ({comments.length})
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {isCommentsLoading ? (
                <LoadingState message="Loading message history..." minHeight={150} />
              ) : comments.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No messages yet in this ticket. Post an update below.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                  {comments.map((comment) => (
                    <ConversationMessage
                      key={comment._id}
                      comment={comment}
                      onDelete={(commentId) => deleteComment(commentId)}
                    />
                  ))}
                </Box>
              )}

              {/* Message Composer */}
              <MessageComposer
                onSendMessage={handleSendMessage}
                isLoading={isSendingComment}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Sidebar: Properties & Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
                Ticket Properties
              </Typography>

              {/* Status Control */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.8 }}>
                  STATUS
                </Typography>
                {isAgentOrAdmin ? (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    disabled={isUpdatingStatus}
                  >
                    {Object.values(TicketStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        <StatusBadge status={status} size="small" />
                      </MenuItem>
                    ))}
                  </TextField>
                ) : isOwner && ticket.status !== TicketStatus.CLOSED ? (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <StatusBadge status={ticket.status} />
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => handleStatusChange(TicketStatus.RESOLVED)}
                      disabled={isUpdatingStatus}
                    >
                      Mark Resolved
                    </Button>
                  </Box>
                ) : (
                  <StatusBadge status={ticket.status} />
                )}
              </Box>

              {/* Priority Control */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.8 }}>
                  PRIORITY
                </Typography>
                {isAgentOrAdmin ? (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                    disabled={isUpdatingPriority}
                  >
                    {Object.values(TicketPriority).map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        <PriorityBadge priority={priority} size="small" />
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <PriorityBadge priority={ticket.priority} />
                )}
              </Box>

              {/* Assigned Agent Control */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.8 }}>
                  ASSIGNED AGENT
                </Typography>
                {isAgentOrAdmin ? (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={ticket.assignedTo?._id || ""}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    disabled={isAssigning}
                  >
                    <MenuItem value="">
                      <em>Unassigned</em>
                    </MenuItem>
                    {agentsList.map((agent) => (
                      <MenuItem key={agent._id} value={agent._id}>
                        {agent.username} ({agent.email})
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {ticket.assignedTo ? ticket.assignedTo.username : "Unassigned"}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Creator Info */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                  CREATED BY
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main", fontSize: "0.75rem" }}>
                    {getInitials(ticket.createdBy?.username)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {ticket.createdBy?.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {ticket.createdBy?.email}
                    </Typography>
                  </Box>
                  <UserRoleBadge role={ticket.createdBy?.role} size="small" />
                </Box>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Metadata Timestamps */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    Created:
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    {formatDate(ticket.createdAt)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated:
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    {formatDate(ticket.updatedAt)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Ticket"
        message="Are you sure you want to delete this ticket? This action will remove it from the active queue."
        confirmLabel="Delete Ticket"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleDeleteTicket}
        onClose={() => setConfirmDeleteOpen(false)}
      />
    </Box>
  );
};
