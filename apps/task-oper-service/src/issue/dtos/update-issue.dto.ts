import { PartialType } from '@nestjs/swagger';
import { CreateIssueDto } from './create-issue.dto.js';

export class UpdateIssueDto extends PartialType(CreateIssueDto) {
  constructor(partial: Partial<UpdateIssueDto>) {
    super();
    Object.assign(this, partial);
  }
}
