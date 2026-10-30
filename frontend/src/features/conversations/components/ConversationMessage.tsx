import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Link,
  Tooltip,
} from "@mui/material";
import { Comment, Attachment } from "@/types/comment.types";
import { UserRole } from "@/types/auth.types";
import { useAuthStore } from "@/stores/auth.store";
import { formatDate, getInitials, formatFileSize } from "@/lib/utils";
import { UserRoleBadge } from "@/components/common/UserRoleBadge";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";

interface ConversationMessageProps {
  comment: Comment;
  onDelete?: (commentId: string) => void;
}

export const ConversationMessage: React.FC<ConversationMessageProps> = ({
  comment,
  onDelete,
}) => {
  const { user } = useAuthStore();

  const isAuthor = comment.authorId._id === user?._id;
  const canDelete = isAuthor || user?.role === UserRole.ADMIN;

  const renderAttachment = (att: Attachment, idx: number) => {
    const isImage = att.mimeType.startsWith("image/");

    return (
      <Paper
        key={att._id || idx}
        variant="outlined"
        sx={{
          p: 1.5,
          mt: 1,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          maxWidth: 360,
          backgroundColor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          {isImage ? (
            <ImageIcon color="primary" fontSize="small" />
          ) : (
            <InsertDriveFileIcon color="action" fontSize="small" />
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {att.originalName || att.fileName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(att.size)}
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Download / Open file">
          <IconButton
            size="small"
            component={Link}
            href={att.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isAuthor ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: 1.5,
        mb: 2.5,
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          bgcolor: isAuthor ? "primary.main" : "secondary.main",
          fontSize: "0.8125rem",
          fontWeight: 600,
        }}
      >
        {getInitials(comment.authorId.username)}
      </Avatar>

      <Box sx={{ maxWidth: { xs: "85%", sm: "75%" } }}>
        {/* Header: Username, role badge, timestamp */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 0.5,
            flexDirection: isAuthor ? "row-reverse" : "row",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {comment.authorId.username}
          </Typography>
          <UserRoleBadge role={comment.authorId.role} size="small" />
          <Typography variant="caption" color="text.secondary">
            {formatDate(comment.createdAt, "MMM dd, HH:mm")}
          </Typography>

          {canDelete && onDelete && (
            <Tooltip title="Delete Message">
              <IconButton
                size="small"
                onClick={() => onDelete(comment._id)}
                sx={{ opacity: 0.6, "&:hover": { opacity: 1, color: "error.main" } }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Message Bubble */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            borderTopLeftRadius: isAuthor ? 12 : 2,
            borderTopRightRadius: isAuthor ? 2 : 12,
            backgroundColor: (theme) =>
              isAuthor
                ? theme.palette.mode === "light"
                  ? "#eff6ff"
                  : "#1e3a5f"
                : theme.palette.mode === "light"
                  ? "#f1f5f9"
                  : "#1e293b",
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {comment.message && (
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontSize: "0.9375rem",
              }}
            >
              {comment.message}
            </Typography>
          )}

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <Box sx={{ mt: comment.message ? 1.5 : 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                <AttachFileIcon fontSize="small" sx={{ color: "text.secondary", transform: "rotate(45deg)" }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Attachments ({comment.attachments.length})
                </Typography>
              </Box>
              {comment.attachments.map((att, idx) => renderAttachment(att, idx))}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};
