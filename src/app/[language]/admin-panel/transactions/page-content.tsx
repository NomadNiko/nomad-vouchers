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
import Tooltip from "@mui/material/Tooltip";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import {
  useGetTransactionsService,
  TransactionEntry,
} from "@/services/api/services/audit";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const statusColors: Record<
  string,
  "success" | "warning" | "error" | "default"
> = {
  active: "success",
  partially_redeemed: "warning",
  fully_redeemed: "default",
  cancelled: "error",
};

function Transactions() {
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 25;
  const getTransactions = useGetTransactionsService();

  const load = useCallback(async () => {
    const { status, data } = await getTransactions({ page, limit });
    if (status === HTTP_CODES_ENUM.OK && data) {
      setTransactions(data.data);
      setTotal(data.total);
    }
  }, [getTransactions, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        All gift voucher purchases across all clients ({total} total)
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Fee</TableCell>
              <TableCell>Total Charged</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Purchaser</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Client</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((t) => {
              const fee =
                t.adminFeeCharged ??
                (t.adminFeeType === "percentage" && t.adminFeeValue
                  ? Math.round(
                      t.originalAmount * (t.adminFeeValue / 100) * 100
                    ) / 100
                  : t.adminFeeType === "fixed" && t.adminFeeValue
                    ? t.adminFeeValue
                    : 0);
              const totalCharged =
                t.stripeAmountTotal ?? t.originalAmount + fee;
              return (
                <TableRow key={t.id}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {new Date(t.purchaseDate).toLocaleDateString()}{" "}
                    {new Date(t.purchaseDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {t.code}
                    </Typography>
                  </TableCell>
                  <TableCell>{t.originalAmount.toFixed(2)}</TableCell>
                  <TableCell>{fee > 0 ? fee.toFixed(2) : "—"}</TableCell>
                  <TableCell>{totalCharged.toFixed(2)}</TableCell>
                  <TableCell>{t.currentBalance.toFixed(2)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{t.purchaserName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.purchaserEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.status.replace("_", " ")}
                      color={statusColors[t.status] || "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {t.stripeSessionId ? (
                      <Tooltip
                        title={`Session: ${t.stripeSessionId}${t.stripePaymentIntent ? ` | Payment: ${t.stripePaymentIntent}` : ""}`}
                      >
                        <Chip
                          label="Stripe"
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </Tooltip>
                    ) : t.squarespaceOrderId ? (
                      <Tooltip title={t.squarespaceOrderId}>
                        <Chip
                          label="Squarespace"
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    ) : (
                      <Chip label="Manual" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={t.tenantId}>
                      <Typography variant="caption">
                        {t.tenantName || t.tenantId}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
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

export default withPageRequiredAuth(Transactions, {
  roles: [RoleEnum.SUPER_ADMIN],
});
