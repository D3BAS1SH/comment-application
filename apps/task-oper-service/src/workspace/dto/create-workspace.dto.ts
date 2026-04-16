import { MaxLength, MinLength } from "class-validator";

export class CreateWorkspaceDto {
    @MinLength(3, { message: "Name must be at least 3 characters long"})
    @MaxLength(255, { message: "Name must be at most 255 characters long"})
    name: string;

    @MinLength(3, { message: "Slug must be at least 3 characters long"})
    @MaxLength(50, { message: "Slug must be at most 50 characters long"})
    slug: string;
}