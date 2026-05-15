import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class StatusOrderItemDto {
  @ApiProperty({
    description: 'Unique identifier of the status to reorder',
    example: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'New numeric position for the status (must be ≥ 0)',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  position: number;
}

export class ReorderStatusesDto {
  @ApiProperty({
    description: 'Ordered list of status IDs with their new positions',
    type: () => [StatusOrderItemDto],
    example: [
      { id: 'c3d4e5f6-a7b8-9012-cdef-345678901234', position: 0 },
      { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', position: 1 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StatusOrderItemDto)
  statuses: StatusOrderItemDto[];
}
