"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import {
  useGetTenantService,
  useUpdateTenantService,
} from "@/services/api/services/tenants";
import {
  useGetTenantUsersService,
  useCreateUserTenantAccessService,
  useUpdateUserTenantAccessService,
  useDeleteUserTenantAccessService,
  UserTenantAccessResponse,
} from "@/services/api/services/user-tenant-access";
import { useGetUsersService } from "@/services/api/services/users";
import { Tenant } from "@/services/api/types/tenant";
import { User } from "@/services/api/types/user";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";

function EditClient() {
  const { t } = useTranslation("vendor-admin");
  const params = useParams();
  const id = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [accessList, setAccessList] = useState<UserTenantAccessResponse[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState<"admin" | "staff" | "user">("user");

  const getTenant = useGetTenantService();
  const updateTenant = useUpdateTenantService();
  const getTenantUsers = useGetTenantUsersService();
  const createAccess = useCreateUserTenantAccessService();
  const updateAccess = useUpdateUserTenantAccessService();
  const deleteAccess = useDeleteUserTenantAccessService();
  const getUsers = useGetUsersService();

  const load = useCallback(async () => {
    const { status, data } = await getTenant(id);
    if (status === HTTP_CODES_ENUM.OK && data) {
      setTenant(data);
      setName(data.name);
      setSlug(data.slug);
      setIsActive(data.isActive);
    }
  }, [getTenant, id]);

  const loadAccess = useCallback(async () => {
    const { status, data } = await getTenantUsers(id);
    if (status === HTTP_CODES_ENUM.OK && data) {
      setAccessList(data);
    }
  }, [getTenantUsers, id]);

  const loadUsers = useCallback(async () => {
    const { status, data } = await getUsers({ page: 1, limit: 50 });
    if (status === HTTP_CODES_ENUM.OK && data) {
      setAllUsers(data.data || []);
    }
  }, [getUsers]);

  useEffect(() => {
    load();
    loadAccess();
    loadUsers();
  }, [load, loadAccess, loadUsers]);

  const handleSave = async () => {
    await updateTenant(id, { name, slug, isActive });
    load();
  };

  const handleAddUser = async () => {
    if (!addUserId) return;
    await createAccess({ userId: addUserId, tenantId: id, role: addRole });
    setAddUserId("");
    loadAccess();
  };

  const handleRoleChange = async (accessId: string, newRole: string) => {
    await updateAccess(accessId, { role: newRole });
    loadAccess();
  };

  const handleRemoveUser = async (accessId: string) => {
    await deleteAccess(accessId);
    loadAccess();
  };

  const availableUsers = allUsers.filter(
    (u) => !accessList.some((a) => a.userId === u.id)
  );

  const getUserName = (userId: string) => {
    const u = allUsers.find((user) => user.id === userId);
    return u
      ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email
      : userId;
  };

  if (!tenant) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t("vendor-admin:edit.title")}: {tenant.name}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
        <TextField
          label={t("vendor-admin:edit.inputs.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label={t("vendor-admin:edit.inputs.slug")}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          fullWidth
        />
        <FormControlLabel
          control={
            <Switch
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          }
          label={t("vendor-admin:edit.inputs.active")}
        />
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ alignSelf: "flex-start" }}
        >
          {t("vendor-admin:actions.save")}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        {t("vendor-admin:edit.userAccess.title")}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <Select
          value={addUserId}
          onChange={(e) => setAddUserId(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="" disabled>
            {t("vendor-admin:edit.userAccess.selectUser")}
          </MenuItem>
          {availableUsers.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.firstName} {u.lastName} ({u.email})
            </MenuItem>
          ))}
        </Select>
        <Select
          value={addRole}
          onChange={(e) =>
            setAddRole(e.target.value as "admin" | "staff" | "user")
          }
          size="small"
        >
          <MenuItem value="admin">
            {t("vendor-admin:edit.userAccess.roles.admin")}
          </MenuItem>
          <MenuItem value="staff">
            {t("vendor-admin:edit.userAccess.roles.staff")}
          </MenuItem>
          <MenuItem value="user">
            {t("vendor-admin:edit.userAccess.roles.user")}
          </MenuItem>
        </Select>
        <Button
          variant="outlined"
          onClick={handleAddUser}
          disabled={!addUserId}
        >
          {t("vendor-admin:actions.addUser")}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {t("vendor-admin:edit.userAccess.table.user")}
              </TableCell>
              <TableCell>
                {t("vendor-admin:edit.userAccess.table.role")}
              </TableCell>
              <TableCell>
                {t("vendor-admin:edit.userAccess.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accessList.map((access) => (
              <TableRow key={access.id}>
                <TableCell>{getUserName(access.userId)}</TableCell>
                <TableCell>
                  <Select
                    value={access.role}
                    onChange={(e) =>
                      handleRoleChange(access.id, e.target.value)
                    }
                    size="small"
                  >
                    <MenuItem value="admin">
                      {t("vendor-admin:edit.userAccess.roles.admin")}
                    </MenuItem>
                    <MenuItem value="staff">
                      {t("vendor-admin:edit.userAccess.roles.staff")}
                    </MenuItem>
                    <MenuItem value="user">
                      {t("vendor-admin:edit.userAccess.roles.user")}
                    </MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveUser(access.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default withPageRequiredAuth(EditClient, {
  roles: [RoleEnum.SUPER_ADMIN],
});
