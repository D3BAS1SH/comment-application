import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'Name must be at most 255 characters long' })
  name?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Slug must be at most 50 characters long' })
  slug?: string;
}
