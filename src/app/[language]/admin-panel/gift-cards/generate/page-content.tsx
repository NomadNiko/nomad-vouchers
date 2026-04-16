"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import { useState, useCallback } from "react";
import { useGetWidgetsService } from "@/services/api/services/widgets";
import { usePurchaseGiftCardService } from "@/services/api/services/gift-cards";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/services/currency/currency-provider";

function GenerateGiftCard() {
  const { symbol: CURRENCY_SYMBOL } = useCurrency();
  const getWidgets = useGetWidgetsService();
  const purchaseGiftCard = usePurchaseGiftCardService();

  const { data: widgetsData } = useQuery({
    queryKey: ["widgets-for-generate"],
    queryFn: async () => {
      const { status, data } = await getWidgets({ page: 1, limit: 50 });
      return status === HTTP_CODES_ENUM.OK ? data?.data || [] : [];
    },
  });

  const widgets = (widgetsData || []).filter((w) => w.isActive);

  const [widgetId, setWidgetId] = useState("");
  const [amount, setAmount] = useState("");
  const [fromName, setFromName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedWidget = widgets.find((w) => w.id === widgetId);

  const handleGenerate = useCallback(async () => {
    if (!selectedWidget || !amount || !fromName) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { status, data } = await purchaseGiftCard({
        templateId: selectedWidget.templateId,
        widgetId: selectedWidget.id,
        originalAmount: parseFloat(amount),
        purchaserName: fromName,
        purchaserEmail: recipientEmail || "noreply@generated.local",
        recipientName: recipientName || undefined,
        recipientEmail: recipientEmail || undefined,
        notes: notes || undefined,
      });
      if (status === HTTP_CODES_ENUM.CREATED && data) {
        setSuccess(
          `Gift card ${data.code} generated for ${CURRENCY_SYMBOL}${parseFloat(amount).toFixed(2)}` +
            (recipientEmail ? ` — email sent to ${recipientEmail}` : "")
        );
        setAmount("");
        setRecipientName("");
        setRecipientEmail("");
        setNotes("");
      } else {
        setError("Failed to generate gift voucher.");
      }
    } catch {
      setError("Failed to generate gift voucher.");
    } finally {
      setSaving(false);
    }
  }, [
    selectedWidget,
    amount,
    fromName,
    recipientName,
    recipientEmail,
    notes,
    purchaseGiftCard,
    CURRENCY_SYMBOL,
  ]);

  const canSubmit =
    widgetId && parseFloat(amount) >= 1 && fromName.trim() !== "";

  return (
    <Container maxWidth="sm">
      <Grid container spacing={3} pt={3}>
        <Grid size={12}>
          <Typography variant="h4">Generate Gift Voucher</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create a gift voucher without a purchase — for promotions,
            complimentary gifts, or replacements.
          </Typography>
        </Grid>

        {error && (
          <Grid size={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
        {success && (
          <Grid size={12}>
            <Alert severity="success">{success}</Alert>
          </Grid>
        )}

        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  select
                  label="Widget *"
                  value={widgetId}
                  onChange={(e) => setWidgetId(e.target.value)}
                  fullWidth
                  helperText="Select the widget to use for this voucher's template and disclaimer settings"
                >
                  {widgets.map((w) => (
                    <MenuItem key={w.id} value={w.id}>
                      {w.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={12}>
                <TextField
                  label={`Amount (${CURRENCY_SYMBOL}) *`}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  fullWidth
                  inputProps={{ min: 1, step: 0.01 }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="From (sender name) *"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  fullWidth
                  helperText="Who is this gift voucher from? e.g. your business name"
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Recipient Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Recipient Email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  fullWidth
                  helperText="If provided, the gift voucher will be emailed to this address"
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Personal Message (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={12}>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={saving || !canSubmit}
            size="large"
          >
            {saving ? "Generating..." : "Generate Gift Voucher"}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(GenerateGiftCard, {
  roles: [RoleEnum.ADMIN, RoleEnum.STAFF],
});
