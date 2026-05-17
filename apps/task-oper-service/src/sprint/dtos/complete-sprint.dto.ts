import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CompleteSprintDto {
  @ApiPropertyOptional({
    description:
      'The ID of the sprint where uncompleted issues should be moved',
    example: 'some-uuid-for-next-sprint',
  })
  @IsString()
  @IsOptional()
  destinationSprintId?: string;

  constructor(partial: Partial<CompleteSprintDto>) {
    Object.assign(this, partial);
  }
}
