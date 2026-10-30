import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  Button,
  Chip,
  Paper,
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { Attachment } from "@/types/comment.types";
import { formatFileSize } from "@/lib/utils";

interface MessageComposerProps {
  onSendMessage: (message: string, attachments: Attachment[]) => Promise<void>;
  isLoading?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  isLoading = false,
}) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => {
      // In production with object storage, file would be uploaded to S3 / storage bucket
      // Here we create standard attachment metadata compatible with future S3 integration
      return {
        fileName: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
        originalName: file.name,
        fileUrl: URL.createObjectURL(file), // Local previewable blob or storage URL
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed && attachments.length === 0) return;

    await onSendMessage(trimmed, attachments);
    setMessage("");
    setAttachments([]);
  };

  const canSubmit = (message.trim().length > 0 || attachments.length > 0) && !isLoading;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: "background.paper",
      }}
    >
      {/* Pending Attachments List */}
      {attachments.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
          {attachments.map((att, idx) => (
            <Chip
              key={idx}
              label={`${att.originalName} (${formatFileSize(att.size)})`}
              onDelete={() => handleRemoveAttachment(idx)}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}

      {/* Input row */}
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Write a message... (Press Enter to send, Shift+Enter for new line)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: "0.9375rem" },
          }}
        />

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          multiple
          onChange={handleFileChange}
        />

        <Tooltip title="Attach Files">
          <IconButton
            size="small"
            color="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <AttachFileIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          size="small"
          endIcon={<SendIcon fontSize="small" />}
          disabled={!canSubmit}
          onClick={handleSubmit}
          sx={{ px: 2, py: 0.8, borderRadius: 2 }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

