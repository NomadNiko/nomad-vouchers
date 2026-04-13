"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Typography from "@mui/material/Typography";
import { useTenant } from "@/services/tenant/tenant-context";

export default function TenantSwitcher() {
  const { currentTenant, tenants, switchTenant } = useTenant();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  if (!currentTenant || tenants.length <= 1) {
    return currentTenant ? (
      <Typography
        variant="body2"
        sx={{ color: "white", mx: 1, display: { xs: "none", md: "block" } }}
      >
        {currentTenant.tenantName}
      </Typography>
    ) : null;
  }

  return (
    <>
      <Button
        sx={{ color: "white", textTransform: "none", mx: 1 }}
        onClick={(e) => setAnchor(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
        size="small"
      >
        {currentTenant.tenantName}
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        {tenants.map((t) => (
          <MenuItem
            key={t.tenantId}
            selected={t.tenantId === currentTenant.tenantId}
            onClick={() => {
              switchTenant(t.tenantId);
              setAnchor(null);
              window.location.reload();
            }}
          >
            {t.tenantName}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
