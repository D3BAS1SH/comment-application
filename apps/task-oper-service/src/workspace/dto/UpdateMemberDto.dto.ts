
export enum memberRoles {
  OWNER,
  ADMIN,
  MEMBER,
  VIEWER
}

export class UpdateMemberDto {
    role: memberRoles
}