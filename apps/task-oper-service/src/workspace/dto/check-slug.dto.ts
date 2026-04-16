import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CheckSlugDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Slug must be at least 3 characters long' })
  @MaxLength(50, { message: 'Slug must be at most 50 characters long' })
  slug: string;
}