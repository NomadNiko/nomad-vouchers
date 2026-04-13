export enum RoleEnum {
  ADMIN = 1,
  USER = 2,
  STAFF = 3,
  SUPER_ADMIN = 4,
}

export type Role = {
  id: number | string;
  name?: string;
};
