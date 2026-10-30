import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Alert,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTickets } from "../hooks/useTickets";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useAuthStore } from "@/stores/auth.store";
import { TicketPriority } from "@/types/ticket.types";
import { UserRole } from "@/types/auth.types";
import { PageHeader } from "@/components/page-header/PageHeader";
import { getApiErrorMessage } from "@/lib/axios";

const ticketFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be between 5 and 120 characters")
    .max(120, "Title must be between 5 and 120 characters"),
  description: z.string().min(1, "Description is required"),
  priority: z.nativeEnum(TicketPriority),
  createdBy: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

export const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createTicket, isCreating } = useTickets();

  // If Agent or Admin, allow selecting which employee this ticket is created for
  const isAgentOrAdmin = user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN;
  const { users: employeesList, isLoading: isEmployeesLoading } = useUsers(
    isAgentOrAdmin ? { role: UserRole.EMPLOYEE, limit: 100 } : undefined
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: TicketPriority.MEDIUM,
      createdBy: "",
    },
  });

  const onSubmit = async (data: TicketFormData) => {
    try {
      setErrorMessage(null);

      if (isAgentOrAdmin && !data.createdBy) {
        setErrorMessage("Please select the employee for whom this ticket is being created.");
        return;
      }

      const payload = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        ...(isAgentOrAdmin && data.createdBy ? { createdBy: data.createdBy } : {}),
      };

      const newTicket = await createTicket(payload);
      navigate(`/tickets/${newTicket._id}`);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to create ticket."));
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <PageHeader
        title="Create New Ticket"
        subtitle="Submit a support ticket with detailed information"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Tickets", path: "/tickets" },
          { label: "New Ticket" },
        ]}
      />

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={3}>
              {/* Creator Selection for Agents/Admins */}
              {isAgentOrAdmin && (
                <Grid item xs={12}>
                  <Controller
                    name="createdBy"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        required
                        fullWidth
                        label="Ticket Owner (Employee)"
                        helperText="Required: Select the employee for whom you are creating this ticket."
                        disabled={isEmployeesLoading}
                      >
                        <MenuItem value="" disabled>
                          <em>-- Select an Employee --</em>
                        </MenuItem>
                        {employeesList.map((emp) => (
                          <MenuItem key={emp._id} value={emp._id}>
                            {emp.username} ({emp.email})
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
              )}

              {/* Title */}
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      fullWidth
                      label="Ticket Title / Subject"
                      placeholder="e.g. Unable to connect to company VPN"
                      error={!!errors.title}
                      helperText={errors.title?.message || "Brief summary between 5 and 120 characters"}
                    />
                  )}
                />
              </Grid>

              {/* Priority */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      required
                      fullWidth
                      label="Priority"
                      error={!!errors.priority}
                      helperText={errors.priority?.message}
                    >
                      <MenuItem value={TicketPriority.LOW}>Low</MenuItem>
                      <MenuItem value={TicketPriority.MEDIUM}>Medium</MenuItem>
                      <MenuItem value={TicketPriority.HIGH}>High</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      fullWidth
                      multiline
                      rows={5}
                      label="Detailed Description"
                      placeholder="Please explain the issue in detail, including steps to reproduce, error messages, and context..."
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}>
                <Button
                  color="inherit"
                  onClick={() => navigate("/tickets")}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isCreating}
                >
                  {isCreating ? "Submitting Ticket..." : "Submit Ticket"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
