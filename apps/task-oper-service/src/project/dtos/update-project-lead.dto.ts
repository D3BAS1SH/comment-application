import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

/**
 * Privileged project lead update DTO.
 * Allowed roles: OWNER, ADMIN only
 *
 * Endpoint: PATCH /workspaces/:workspaceId/projects/:projectId/lead
 *
 * Pass `null` to explicitly remove the project lead.
 */
export class UpdateProjectLeadDto {
  @ApiProperty({
    description:
      'User ID of the new project lead. Pass null to remove the current lead.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  leadId: string | null;

  constructor(partial: Partial<UpdateProjectLeadDto>) {
    Object.assign(this, partial);
  }
}
