import { memberRoles } from "./UpdateMemberDto.dto.js";

export class AddMemberDto {
    // Member id
    userId: string;
    role: memberRoles;
}