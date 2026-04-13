"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTranslation } from "@/services/i18n/client";

export default function NoAccessPage() {
  const { t } = useTranslation("common");

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          {t("common:noAccess.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("common:noAccess.message")}
        </Typography>
      </Box>
    </Container>
  );
}
