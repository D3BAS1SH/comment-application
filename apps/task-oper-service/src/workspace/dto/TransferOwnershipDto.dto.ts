import { memberRoles } from "./UpdateMemberDto.dto.js"

export class TransferOwnershipDto {
    userId: string;
    fromRole: memberRoles;
    toRole: memberRoles;
}