"use client";

import { useEffect, useState, useCallback } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Link from "@/components/link";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import { useGetTenantsService } from "@/services/api/services/tenants";
import { Tenant } from "@/services/api/types/tenant";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";

function VendorAdmin() {
  const { t } = useTranslation("vendor-admin");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const getTenants = useGetTenantsService();

  const load = useCallback(async () => {
    const { status, data } = await getTenants();
    if (status === HTTP_CODES_ENUM.OK && data) {
      setTenants(data);
    }
  }, [getTenants]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">{t("vendor-admin:title")}</Typography>
        <Button
          variant="contained"
          component={Link}
          href="/admin-panel/vendor-admin/create"
        >
          {t("vendor-admin:actions.create")}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("vendor-admin:table.name")}</TableCell>
              <TableCell>{t("vendor-admin:table.slug")}</TableCell>
              <TableCell>{t("vendor-admin:table.status")}</TableCell>
              <TableCell>{t("vendor-admin:table.created")}</TableCell>
              <TableCell>{t("vendor-admin:table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>{tenant.name}</TableCell>
                <TableCell>{tenant.slug}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      tenant.isActive
                        ? t("vendor-admin:status.active")
                        : t("vendor-admin:status.inactive")
                    }
                    color={tenant.isActive ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    component={Link}
                    href={`/admin-panel/vendor-admin/${tenant.id}/edit`}
                  >
                    {t("vendor-admin:actions.edit")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default withPageRequiredAuth(VendorAdmin, {
  roles: [RoleEnum.SUPER_ADMIN],
});
