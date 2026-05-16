import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The body content of the comment',
    example: 'This is a sample comment.',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  constructor(partial: Partial<CreateCommentDto>) {
    Object.assign(this, partial);
  }
}
