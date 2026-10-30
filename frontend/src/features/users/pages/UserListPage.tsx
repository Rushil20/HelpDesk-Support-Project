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
  IconButton,
  Typography,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Paper,
  Divider,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useUsers } from "../hooks/useUsers";
import { useAuthStore } from "@/stores/auth.store";
import { useDebounce } from "@/hooks/useDebounce";
import { User, UserRole, UserStatus } from "@/types/auth.types";
import { UserRoleBadge } from "@/components/common/UserRoleBadge";
import { UserStatusBadge } from "@/components/common/UserStatusBadge";
import { PageHeader } from "@/components/page-header/PageHeader";
import { LoadingState } from "@/components/loading-state/LoadingState";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { ConfirmDialog } from "@/components/confirm-dialog/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/axios";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import BlockIcon from "@mui/icons-material/Block";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import KeyIcon from "@mui/icons-material/Key";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Can only contain letters, numbers, hyphens, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([UserRole.EMPLOYEE, UserRole.AGENT]),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export const UserListPage: React.FC = () => {
  const { user: currentAdmin } = useAuthStore();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const debouncedSearch = useDebounce(search, 400);

  const {
    users,
    pagination,
    isLoading,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    deactivateUser,
    isDeactivating,
    changeUserRole,
    isChangingRole,
  } = useUsers({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch.trim() || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
  });

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<User | null>(null);
  const [deactivateTargetUser, setDeactivateTargetUser] = useState<User | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // View Credentials / Summary Modal after Creation
  const [createdCredentials, setCreatedCredentials] = useState<{
    username: string;
    email: string;
    password: string;
    role: UserRole;
  } | null>(null);
  const [showSummaryPassword, setShowSummaryPassword] = useState(true);

  // Reset Password Modal States
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(true);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    setValue: setCreateValue,
    formState: { errors: createErrors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: UserRole.EMPLOYEE,
    },
  });

  const generateRandomPassword = () => {
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercase = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "!@#$%^&*";
    const all = uppercase + lowercase + numbers + symbols;

    let pwd = "";
    pwd += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    pwd += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pwd += symbols.charAt(Math.floor(Math.random() * symbols.length));
    for (let i = 4; i < 12; i++) {
      pwd += all.charAt(Math.floor(Math.random() * all.length));
    }
    return pwd;
  };

  const handleCopyText = (text: string, label: string = "Password") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const onOpenCreateDialog = () => {
    resetCreateForm();
    setShowCreatePassword(false);
    setDialogError(null);
    setCreateDialogOpen(true);
  };

  const onSubmitCreate = async (data: CreateUserFormData) => {
    try {
      setDialogError(null);
      await createUser(data);
      setCreateDialogOpen(false);
      // Open credentials summary dialog so admin can view and copy the plain-text password
      setCreatedCredentials({
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      setShowSummaryPassword(true);
    } catch (err) {
      setDialogError(getApiErrorMessage(err, "Failed to create user."));
    }
  };

  const handleOpenResetPassword = (targetUser: User) => {
    setResetPasswordUser(targetUser);
    setResetNewPassword(generateRandomPassword());
    setShowResetPassword(true);
    setResetSuccessMessage(null);
    setResetError(null);
  };

  const handleConfirmResetPassword = async () => {
    if (!resetPasswordUser) return;
    if (resetNewPassword.trim().length < 8) {
      setResetError("Password must be at least 8 characters");
      return;
    }

    try {
      setResetError(null);
      await updateUser({
        id: resetPasswordUser._id,
        data: { password: resetNewPassword.trim() },
      });
      setResetSuccessMessage(`Password successfully updated for ${resetPasswordUser.username}!`);
      toast.success("User password reset successfully");
    } catch (err) {
      setResetError(getApiErrorMessage(err, "Failed to reset password."));
    }
  };

  const handleRoleChangeConfirm = async () => {
    if (!roleChangeUser) return;
    try {
      setDialogError(null);
      const nextRole =
        roleChangeUser.role === UserRole.EMPLOYEE ? UserRole.AGENT : UserRole.EMPLOYEE;
      await changeUserRole({ id: roleChangeUser._id, role: nextRole });
      setRoleChangeUser(null);
    } catch (err) {
      setDialogError(getApiErrorMessage(err, "Failed to change user role."));
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTargetUser) return;
    try {
      setDialogError(null);
      await deactivateUser(deactivateTargetUser._id);
      setDeactivateTargetUser(null);
    } catch (err) {
      setDialogError(getApiErrorMessage(err, "Failed to deactivate user."));
    }
  };

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle="Manage company users, promote employees, and control platform access"
        action={
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={onOpenCreateDialog}
          >
            Create User
          </Button>
        }
      />

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          {/* Filters Row */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by username or email..."
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
            <Grid item xs={6} sm={3} md={2.5}>
              <TextField
                fullWidth
                select
                size="small"
                label="Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value={UserRole.EMPLOYEE}>Employee</MenuItem>
                <MenuItem value={UserRole.AGENT}>Support Agent</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Administrator</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={2.5}>
              <TextField
                fullWidth
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value={UserStatus.ACTIVE}>Active</MenuItem>
                <MenuItem value={UserStatus.INACTIVE}>Inactive</MenuItem>
              </TextField>
            </Grid>
            {(search || roleFilter || statusFilter) && (
              <Grid item xs={12} sm="auto">
                <Button
                  color="inherit"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("");
                    setStatusFilter("");
                    setPage(0);
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>

        {/* Data Table */}
        {isLoading ? (
          <LoadingState message="Loading users list..." />
        ) : users.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description="No users matched your search criteria."
          />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email Address</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => {
                    const isSelf = u._id === currentAdmin?._id;
                    const isAdmin = u.role === UserRole.ADMIN;
                    const canChangeRole = !isSelf && !isAdmin;
                    const canResetPassword = !isSelf && !isAdmin;
                    const canDeactivate = !isSelf && u.status === UserStatus.ACTIVE;

                    return (
                      <TableRow key={u._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {u.username} {isSelf && "(You)"}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <UserRoleBadge role={u.role} />
                        </TableCell>
                        <TableCell>
                          <UserStatusBadge status={u.status} />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
                          {formatDate(u.createdAt, "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            {canChangeRole && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                startIcon={<SwapHorizIcon fontSize="small" />}
                                onClick={() => setRoleChangeUser(u)}
                              >
                                {u.role === UserRole.EMPLOYEE ? "Make Agent" : "Make Employee"}
                              </Button>
                            )}

                            {canResetPassword && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="info"
                                startIcon={<KeyIcon fontSize="small" />}
                                onClick={() => handleOpenResetPassword(u)}
                              >
                                Reset Password
                              </Button>
                            )}

                            {canDeactivate && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<BlockIcon fontSize="small" />}
                                onClick={() => setDeactivateTargetUser(u)}
                              >
                                Deactivate
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={pagination?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Card>

      {/* Create User Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => !isCreating && setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Create New User</DialogTitle>
        <DialogContent dividers>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}

          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Controller
              name="username"
              control={createControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="Username"
                  error={!!createErrors.username}
                  helperText={createErrors.username?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={createControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  error={!!createErrors.email}
                  helperText={createErrors.email?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={createControl}
              render={({ field }) => (
                <Box sx={{ mt: 2, mb: 1 }}>
                  <TextField
                    {...field}
                    required
                    fullWidth
                    type={showCreatePassword ? "text" : "password"}
                    label="Initial Password"
                    error={!!createErrors.password}
                    helperText={createErrors.password?.message || "Minimum 8 characters"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title={showCreatePassword ? "Hide password" : "View password"}>
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowCreatePassword(!showCreatePassword)}
                              edge="end"
                              size="small"
                            >
                              {showCreatePassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
                    <Button
                      size="small"
                      startIcon={<AutoFixHighIcon fontSize="small" />}
                      onClick={() => {
                        const randomPwd = generateRandomPassword();
                        setCreateValue("password", randomPwd, { shouldValidate: true });
                        setShowCreatePassword(true);
                      }}
                    >
                      Generate Strong Password
                    </Button>
                  </Box>
                </Box>
              )}
            />

            <Controller
              name="role"
              control={createControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  margin="normal"
                  required
                  fullWidth
                  label="Assigned Role"
                  error={!!createErrors.role}
                  helperText={createErrors.role?.message}
                >
                  <MenuItem value={UserRole.EMPLOYEE}>Employee</MenuItem>
                  <MenuItem value={UserRole.AGENT}>Support Agent</MenuItem>
                </TextField>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateDialogOpen(false)} color="inherit" disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateSubmit(onSubmitCreate)}
            variant="contained"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Post-Creation Credentials Summary Dialog with View Password Option */}
      <Dialog
        open={!!createdCredentials}
        onClose={() => setCreatedCredentials(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircleOutlineIcon color="success" /> User Created Successfully
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            The account has been created. Please review and securely copy these initial credentials to provide to the user:
          </Typography>

          <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "background.default" }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Username:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {createdCredentials?.username}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Email:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {createdCredentials?.email}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Role:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                {createdCredentials && <UserRoleBadge role={createdCredentials.role} />}
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
              </Grid>

              <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Initial Password:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      bgcolor: "action.hover",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      letterSpacing: showSummaryPassword ? "normal" : 2,
                    }}
                  >
                    {showSummaryPassword
                      ? createdCredentials?.password
                      : "••••••••••••"}
                  </Typography>

                  <Tooltip title={showSummaryPassword ? "Hide password" : "View password"}>
                    <IconButton
                      size="small"
                      onClick={() => setShowSummaryPassword(!showSummaryPassword)}
                    >
                      {showSummaryPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Copy password">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => createdCredentials && handleCopyText(createdCredentials.password, "Password")}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              if (createdCredentials) {
                const text = `Helpdesk Credentials:\nUsername: ${createdCredentials.username}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
                handleCopyText(text, "Account credentials");
              }
            }}
          >
            Copy All Credentials
          </Button>
          <Button variant="contained" onClick={() => setCreatedCredentials(null)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog with View Password Option */}
      <Dialog
        open={!!resetPasswordUser}
        onClose={() => !isUpdating && setResetPasswordUser(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <KeyIcon color="primary" /> Reset User Password
        </DialogTitle>
        <DialogContent dividers>
          {resetError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {resetError}
            </Alert>
          )}

          {resetSuccessMessage ? (
            <Box sx={{ py: 1 }}>
              <Alert severity="success" sx={{ mb: 2.5 }}>
                {resetSuccessMessage}
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                New credentials for <strong>{resetPasswordUser?.username}</strong> ({resetPasswordUser?.email}):
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Password:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      px: 1,
                      py: 0.5,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                    }}
                  >
                    {showResetPassword ? resetNewPassword : "••••••••••••"}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    title={showResetPassword ? "Hide password" : "View password"}
                  >
                    {showResetPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopyText(resetNewPassword, "New Password")}
                >
                  Copy
                </Button>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter or generate a new password for <strong>{resetPasswordUser?.username}</strong> ({resetPasswordUser?.email}):
              </Typography>

              <TextField
                fullWidth
                required
                margin="normal"
                label="New Password"
                type={showResetPassword ? "text" : "password"}
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                helperText="Minimum 8 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={showResetPassword ? "Hide password" : "View password"}>
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowResetPassword(!showResetPassword)}
                          edge="end"
                          size="small"
                        >
                          {showResetPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button
                  size="small"
                  startIcon={<AutoFixHighIcon fontSize="small" />}
                  onClick={() => {
                    setResetNewPassword(generateRandomPassword());
                    setShowResetPassword(true);
                  }}
                >
                  Generate Strong Password
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          {resetSuccessMessage ? (
            <Button variant="contained" onClick={() => setResetPasswordUser(null)}>
              Close
            </Button>
          ) : (
            <>
              <Button onClick={() => setResetPasswordUser(null)} color="inherit" disabled={isUpdating}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmResetPassword}
                disabled={isUpdating || !resetNewPassword.trim()}
              >
                {isUpdating ? "Updating..." : "Update Password"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Role Change Confirmation Dialog */}
      <ConfirmDialog
        open={!!roleChangeUser}
        title="Change User Role"
        message={`Are you sure you want to change '${roleChangeUser?.username}' from ${
          roleChangeUser?.role === UserRole.EMPLOYEE ? "Employee to Support Agent" : "Support Agent to Employee"
        }?`}
        confirmLabel="Confirm Role Change"
        confirmColor="primary"
        isLoading={isChangingRole}
        onConfirm={handleRoleChangeConfirm}
        onClose={() => setRoleChangeUser(null)}
      />

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        open={!!deactivateTargetUser}
        title="Deactivate User"
        message={`Are you sure you want to deactivate '${deactivateTargetUser?.username}'? They will no longer be able to log in.`}
        confirmLabel="Deactivate User"
        confirmColor="error"
        isLoading={isDeactivating}
        onConfirm={handleDeactivateConfirm}
        onClose={() => setDeactivateTargetUser(null)}
      />
    </Box>
  );
};
