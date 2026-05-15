import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * General project update DTO.
 * Allowed roles: OWNER, ADMIN, MEMBER
 *
 * Note: `key` is immutable — it cannot be changed after project creation.
 * Note: `leadId` is managed separately via PATCH /projects/:id/lead (OWNER/ADMIN only).
 */
export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'New display name for the project',
    example: 'My Renamed Project',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated description of the project',
    example: 'An updated description for the project.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  constructor(partial: Partial<UpdateProjectDto>) {
    Object.assign(this, partial);
  }
}
