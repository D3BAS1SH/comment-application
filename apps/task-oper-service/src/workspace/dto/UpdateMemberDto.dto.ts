import { WorkspaceRole } from 'src/prisma/generated/enums.js';

export class UpdateMemberDto {
  role: WorkspaceRole;
}
