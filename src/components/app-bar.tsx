"use client";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "@/services/i18n/client";
import Link from "@/components/link";
import { RoleEnum } from "@/services/api/types/role";
import Divider from "@mui/material/Divider";
import ThemeSwitchButton from "@/components/switch-theme-button";
import { IS_SIGN_UP_ENABLED } from "@/services/auth/config";
import ListSubheader from "@mui/material/ListSubheader";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Special_Elite } from "next/font/google";
import TenantSwitcher from "@/components/tenant-switcher";
import { useTenant } from "@/services/tenant/tenant-context";

const specialElite = Special_Elite({ weight: "400", subsets: ["latin"] });

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: { href: string; text: string }[];
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <Button
        sx={{ my: 2, color: "white" }}
        onClick={(e) => setAnchor(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        {items.map((item) => (
          <MenuItem
            key={item.href}
            component={Link}
            href={item.href}
            onClick={() => setAnchor(null)}
          >
            {item.text}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function ResponsiveAppBar() {
  const { t } = useTranslation("common");
  const { user, isLoaded } = useAuth();
  const { logOut } = useAuthActions();
  const { currentTenant, isSuperAdmin } = useTenant();
  const [anchorElementNav, setAnchorElementNav] = useState<null | HTMLElement>(
    null
  );
  const [anchorElementUser, setAnchorElementUser] =
    useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElementNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElementUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElementNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElementUser(null);
  };

  // Use tenant-scoped role when available, fall back to global role
  const tenantRole = currentTenant?.role;
  const isAdmin =
    isSuperAdmin ||
    tenantRole === "admin" ||
    (!!user?.role && [RoleEnum.ADMIN].includes(Number(user?.role?.id)));
  const isStaff =
    tenantRole === "staff" ||
    (!!user?.role && [RoleEnum.STAFF].includes(Number(user?.role?.id)));
  const isAdminOrStaff = isAdmin || isStaff;

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: specialElite.style.fontFamily,
              fontWeight: 700,
              letterSpacing: "normal",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {t("common:app-name")}
          </Typography>

          {/* Mobile hamburger */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElementNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElementNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {/* Voucher Status */}
              <MenuItem
                onClick={handleCloseNavMenu}
                component={Link}
                href="/gift-cards/balance"
              >
                {t("common:navigation.checkBalance")}
              </MenuItem>

              {isAdminOrStaff && [
                <Divider key="d1" />,
                <ListSubheader key="h2">
                  {t("common:navigation.manage")}
                </ListSubheader>,
                <MenuItem
                  key="redeem"
                  onClick={handleCloseNavMenu}
                  component={Link}
                  href="/admin-panel/gift-cards/redeem"
                >
                  {t("common:navigation.redeem")}
                </MenuItem>,
                <MenuItem
                  key="generate"
                  onClick={handleCloseNavMenu}
                  component={Link}
                  href="/admin-panel/gift-cards/generate"
                >
                  {t("common:navigation.generate")}
                </MenuItem>,
                <MenuItem
                  key="purchases"
                  onClick={handleCloseNavMenu}
                  component={Link}
                  href="/admin-panel/gift-cards/purchases"
                >
                  {t("common:navigation.purchases")}
                </MenuItem>,
              ]}

              {isAdmin && [
                <Divider key="d2" />,
                <ListSubheader key="h3">
                  {t("common:navigation.admin")}
                </ListSubheader>,
                <MenuItem
                  key="templates"
                  onClick={handleCloseNavMenu}
                  component={Link}
                  href="/admin-panel/gift-cards/templates"
                >
                  {t("common:navigation.templates")}
                </MenuItem>,
                <MenuItem
                  key="widgets"
                  onClick={handleCloseNavMenu}
                  component={Link}
                  href="/admin-panel/gift-cards/widgets"
                >
                  {t("common:navigation.widgets")}
                </MenuItem>,
                <MenuItem
                  key="settings"
                  onClick={handleCloseNavMenu}
                  component={Link}
                  href="/admin-panel/gift-cards/settings"
                >
                  {t("common:navigation.settings")}
                </MenuItem>,
                <MenuItem
                  key="users"
                  onClick={handleCloseNavMenu}
                  component={Link}
                  href="/admin-panel/users"
                >
                  {t("common:navigation.users")}
                </MenuItem>,
              ]}

              {isAdminOrStaff && [
                <Divider key="d3" />,
                <MenuItem
                  key="docs"
                  onClick={handleCloseNavMenu}
                  component={Link}
                  href="/admin-panel/gift-cards/docs"
                >
                  {t("common:navigation.docs")}
                </MenuItem>,
              ]}

              {isSuperAdmin && [
                <Divider key="d4" />,
                <MenuItem
                  key="vendor-admin"
                  onClick={handleCloseNavMenu}
                  component={Link}
                  href="/admin-panel/vendor-admin"
                >
                  {t("common:navigation.vendorAdmin")}
                </MenuItem>,
              ]}

              {isLoaded &&
                !user && [
                  <Divider key="divider" />,
                  <MenuItem
                    key="sign-in"
                    onClick={handleCloseNavMenu}
                    component={Link}
                    href="/sign-in"
                  >
                    {t("common:navigation.signIn")}
                  </MenuItem>,
                  IS_SIGN_UP_ENABLED ? (
                    <MenuItem
                      key="sign-up"
                      onClick={handleCloseNavMenu}
                      component={Link}
                      href="/sign-up"
                    >
                      {t("common:navigation.signUp")}
                    </MenuItem>
                  ) : null,
                ]}
            </Menu>
          </Box>

          {/* Mobile logo */}
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: specialElite.style.fontFamily,
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.5rem" },
              letterSpacing: "normal",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {t("common:app-name")}
          </Typography>

          {/* Desktop nav */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button
              sx={{ my: 2, color: "white" }}
              component={Link}
              href="/gift-cards/balance"
            >
              {t("common:navigation.checkBalance")}
            </Button>

            {isAdminOrStaff && (
              <NavDropdown
                label={t("common:navigation.manage")}
                items={[
                  {
                    href: "/admin-panel/gift-cards/redeem",
                    text: t("common:navigation.redeem"),
                  },
                  {
                    href: "/admin-panel/gift-cards/generate",
                    text: t("common:navigation.generate"),
                  },
                  {
                    href: "/admin-panel/gift-cards/purchases",
                    text: t("common:navigation.purchases"),
                  },
                ]}
              />
            )}

            {isAdmin && (
              <NavDropdown
                label={t("common:navigation.admin")}
                items={[
                  {
                    href: "/admin-panel/gift-cards/templates",
                    text: t("common:navigation.templates"),
                  },
                  {
                    href: "/admin-panel/gift-cards/widgets",
                    text: t("common:navigation.widgets"),
                  },
                  {
                    href: "/admin-panel/gift-cards/settings",
                    text: t("common:navigation.settings"),
                  },
                  {
                    href: "/admin-panel/users",
                    text: t("common:navigation.users"),
                  },
                ]}
              />
            )}

            {isAdminOrStaff && (
              <Button
                sx={{ my: 2, color: "white" }}
                component={Link}
                href="/admin-panel/gift-cards/docs"
              >
                {t("common:navigation.docs")}
              </Button>
            )}

            {isSuperAdmin && (
              <Button
                sx={{ my: 2, color: "white" }}
                component={Link}
                href="/admin-panel/vendor-admin"
              >
                {t("common:navigation.vendorAdmin")}
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
            <TenantSwitcher />
            <ThemeSwitchButton />
          </Box>

          {!isLoaded ? (
            <CircularProgress color="inherit" />
          ) : user ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Profile menu">
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{ p: 0 }}
                  data-testid="profile-menu-item"
                >
                  <Avatar
                    alt={user?.firstName + " " + user?.lastName}
                    src={user.photo?.path}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: 5.5 }}
                id="menu-appbar"
                anchorEl={anchorElementUser}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorElementUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem
                  onClick={handleCloseUserMenu}
                  component={Link}
                  href="/profile"
                  data-testid="user-profile"
                >
                  {t("common:navigation.profile")}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    logOut();
                    handleCloseUserMenu();
                  }}
                  data-testid="logout-menu-item"
                >
                  {t("common:navigation.logout")}
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
              <Button
                sx={{ my: 2, color: "white", display: "block" }}
                component={Link}
                href="/sign-in"
              >
                {t("common:navigation.signIn")}
              </Button>
              {IS_SIGN_UP_ENABLED && (
                <Button
                  sx={{ my: 2, color: "white", display: "block" }}
                  component={Link}
                  href="/sign-up"
                >
                  {t("common:navigation.signUp")}
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
