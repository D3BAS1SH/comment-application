import { WorkspaceRole } from '../../prisma/generated/enums.js';

export class TransferOwnershipDto {
  toUserId: string;
  fromRole: WorkspaceRole;
  toRole: WorkspaceRole;
}
