"use client";

import { useEffect, useState, useCallback } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import {
  useGetAuditLogsService,
  AuditLogEntry,
} from "@/services/api/services/audit";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const actionColors: Record<string, "success" | "warning" | "error" | "info"> = {
  "auth.login": "info",
  "gift-card.purchased": "success",
  "gift-card.generated": "success",
  "gift-card.redeemed": "warning",
  "gift-card.unredeemed": "warning",
  "gift-card.cancelled": "error",
  "user.created": "success",
  "user.updated": "info",
  "user.deleted": "error",
  "access.granted": "success",
  "access.updated": "info",
  "access.removed": "error",
  "template.created": "success",
  "template.updated": "info",
  "template.deleted": "error",
  "widget.created": "success",
  "widget.updated": "info",
  "widget.deleted": "error",
  "settings.updated": "info",
  "tenant.created": "success",
  "tenant.updated": "info",
  "stripe.webhook": "info",
};

const actionLabels: Record<string, string> = {
  "auth.login": "Login",
  "gift-card.purchased": "Purchase",
  "gift-card.generated": "Generated",
  "gift-card.redeemed": "Redemption",
  "gift-card.unredeemed": "Reversal",
  "gift-card.cancelled": "Cancellation",
  "user.created": "User Created",
  "user.updated": "User Updated",
  "user.deleted": "User Deleted",
  "access.granted": "Access Granted",
  "access.updated": "Access Updated",
  "access.removed": "Access Removed",
  "template.created": "Template Created",
  "template.updated": "Template Updated",
  "template.deleted": "Template Deleted",
  "widget.created": "Widget Created",
  "widget.updated": "Widget Updated",
  "widget.deleted": "Widget Deleted",
  "settings.updated": "Settings Updated",
  "tenant.created": "Client Created",
  "tenant.updated": "Client Updated",
  "stripe.webhook": "Stripe Webhook",
};

function formatLogForCopy(log: AuditLogEntry): string {
  const lines = [
    `Timestamp: ${new Date(log.timestamp).toLocaleString()}`,
    `Action: ${actionLabels[log.action] || log.action}`,
    log.userName
      ? `User: ${log.userName} (${log.userEmail})`
      : log.userEmail
        ? `User: ${log.userEmail}`
        : null,
    log.userId ? `User ID: ${log.userId}` : null,
    log.tenantName
      ? `Tenant: ${log.tenantName}`
      : log.tenantId
        ? `Tenant ID: ${log.tenantId}`
        : null,
    log.tenantId && log.tenantName ? `Tenant ID: ${log.tenantId}` : null,
    log.resourceType ? `Resource Type: ${log.resourceType}` : null,
    log.resourceId ? `Resource ID: ${log.resourceId}` : null,
  ].filter(Boolean);

  if (log.details) {
    lines.push("Details:");
    for (const [k, v] of Object.entries(log.details)) {
      if (v !== null && v !== undefined && v !== "") {
        lines.push(`  ${k}: ${v}`);
      }
    }
  }

  return lines.join("\n");
}

function LogRow({ log }: { log: AuditLogEntry }) {
  const [open, setOpen] = useState(false);
  const hasDetails = log.details && Object.keys(log.details).length > 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(formatLogForCopy(log));
  };

  return (
    <>
      <TableRow>
        <TableCell sx={{ width: 30, p: 0.5 }}>
          {hasDetails && (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? (
                <KeyboardArrowUpIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {new Date(log.timestamp).toLocaleDateString()}{" "}
          {new Date(log.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </TableCell>
        <TableCell>
          <Chip
            label={actionLabels[log.action] || log.action}
            color={actionColors[log.action] || "default"}
            size="small"
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          {log.userName || log.userEmail ? (
            <>
              <Typography variant="body2">
                {log.userName || log.userEmail}
              </Typography>
              {log.userName && log.userEmail && (
                <Typography variant="caption" color="text.secondary">
                  {log.userEmail}
                </Typography>
              )}
            </>
          ) : (
            "—"
          )}
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {log.tenantName || log.tenantId || "—"}
          </Typography>
        </TableCell>
        <TableCell>
          {log.resourceType ? (
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              {log.resourceType}:{log.resourceId}
            </Typography>
          ) : (
            "—"
          )}
        </TableCell>
        <TableCell sx={{ width: 40, p: 0.5 }}>
          <IconButton size="small" onClick={handleCopy} title="Copy log entry">
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
      {hasDetails && (
        <TableRow>
          <TableCell
            colSpan={7}
            sx={{ py: 0, borderBottom: open ? undefined : "none" }}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ py: 1.5, px: 2 }}>
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
                >
                  {Object.entries(log.details!)
                    .filter(
                      ([, v]) => v !== null && v !== undefined && v !== ""
                    )
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("\n")}
                </Typography>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function Logs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const limit = 25;
  const getAuditLogs = useGetAuditLogsService();

  const load = useCallback(async () => {
    const { status, data } = await getAuditLogs({
      page,
      limit,
      action: actionFilter || undefined,
    });
    if (status === HTTP_CODES_ENUM.OK && data) {
      setLogs(data.data);
      setTotal(data.total);
    }
  }, [getAuditLogs, page, actionFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (value: string) => {
    setActionFilter(value);
    setPage(1);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Platform Logs
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        All events across all clients ({total} total)
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          select
          label="Filter by action"
          value={actionFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          size="small"
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="auth.login">Login</MenuItem>
          <MenuItem value="gift-card.purchased">Purchase</MenuItem>
          <MenuItem value="gift-card.redeemed">Redemption</MenuItem>
          <MenuItem value="gift-card.unredeemed">Reversal</MenuItem>
          <MenuItem value="gift-card.cancelled">Cancellation</MenuItem>
          <MenuItem value="user">User Changes</MenuItem>
          <MenuItem value="access">Access Changes</MenuItem>
          <MenuItem value="template">Template Changes</MenuItem>
          <MenuItem value="widget">Widget Changes</MenuItem>
          <MenuItem value="settings">Settings</MenuItem>
          <MenuItem value="tenant">Client Changes</MenuItem>
          <MenuItem value="stripe">Stripe Webhook</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 30 }} />
              <TableCell>Timestamp</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell sx={{ width: 40 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 3 }}
                  >
                    No logs found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
        <Button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          variant="outlined"
          size="small"
        >
          Previous
        </Button>
        <Typography variant="body2" sx={{ alignSelf: "center" }}>
          Page {page} of {Math.ceil(total / limit) || 1}
        </Typography>
        <Button
          disabled={page * limit >= total}
          onClick={() => setPage((p) => p + 1)}
          variant="outlined"
          size="small"
        >
          Next
        </Button>
      </Box>
    </Container>
  );
}

export default withPageRequiredAuth(Logs, {
  roles: [RoleEnum.SUPER_ADMIN],
});
