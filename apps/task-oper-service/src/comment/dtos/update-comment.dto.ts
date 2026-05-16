import { PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto.js';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  constructor(partial: Partial<UpdateCommentDto>) {
    super();
    Object.assign(this, partial);
  }
}
