import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export const formatDate = (dateStr?: string | Date | null, formatPattern = "MMM dd, yyyy HH:mm"): string => {
  if (!dateStr) return "-";
  const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  if (!isValid(date)) return "-";
  return format(date, formatPattern);
};

export const formatRelativeTime = (dateStr?: string | Date | null): string => {
  if (!dateStr) return "-";
  const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  if (!isValid(date)) return "-";
  return formatDistanceToNow(date, { addSuffix: true });
};

export const getInitials = (name?: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i] || "B"}`;
};

