import { WorkspaceRole } from '../../prisma/generated/enums.js';

export class UpdateMemberDto {
  role: WorkspaceRole;
}
