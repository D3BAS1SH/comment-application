import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReorderIssueDto {
  @ApiProperty({ description: 'The ID of the status the issue is moved to' })
  @IsString()
  @IsNotEmpty()
  statusId: string;

  @ApiProperty({
    description: 'The new position of the issue in the status list',
  })
  @IsNumber()
  @IsNotEmpty()
  position: number;

  constructor(partial: Partial<ReorderIssueDto>) {
    Object.assign(this, partial);
  }
}
