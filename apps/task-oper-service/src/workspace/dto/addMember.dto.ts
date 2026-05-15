import { IsEmail, IsNotEmpty } from 'class-validator';
import { WorkspaceRole } from 'src/prisma/generated/enums.js';

export class AddMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  role: WorkspaceRole;
}
