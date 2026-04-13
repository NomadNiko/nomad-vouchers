"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import { useCreateTenantService } from "@/services/api/services/tenants";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import useLanguage from "@/services/i18n/use-language";
import { useTranslation } from "@/services/i18n/client";

function CreateClient() {
  const { t } = useTranslation("vendor-admin");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const createTenant = useCreateTenantService();
  const router = useRouter();
  const language = useLanguage();

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  const handleSubmit = async () => {
    setError("");
    const { status } = await createTenant({ name, slug });
    if (status === HTTP_CODES_ENUM.CREATED) {
      router.push(`/${language}/admin-panel/vendor-admin`);
    } else {
      setError(t("vendor-admin:create.errors.slugExists"));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t("vendor-admin:create.title")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label={t("vendor-admin:create.inputs.name")}
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          fullWidth
        />
        <TextField
          label={t("vendor-admin:create.inputs.slug")}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          fullWidth
          helperText={t("vendor-admin:create.inputs.slugHelp")}
        />
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!name || !slug}
        >
          {t("vendor-admin:actions.create")}
        </Button>
      </Box>
    </Container>
  );
}

export default withPageRequiredAuth(CreateClient, {
  roles: [RoleEnum.SUPER_ADMIN],
});
