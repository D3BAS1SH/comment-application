import { ConflictException, ForbiddenException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service.js';
import { PrismaService } from 'src/prisma/prisma.service.js';
import { CreateEpicDto } from './dtos/create-epic.dto.js';
import { EpicResponseDto } from './dtos/epic-respones.dto.js';
import { PrismaClientKnownRequestError } from 'src/prisma/generated/internal/prismaNamespace.js';

@Injectable()
export class EpicService {

  private readonly context: string = EpicService.name;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService
  ) {}

  async createEpic(
    callerId: string,
    projectId: string,
    createEpicObject: CreateEpicDto
  ): Promise<EpicResponseDto> {
    try {

      const callerProjectMember = await this.prismaService.project.findFirst({
        where: {
          id: projectId,
          workspace: {
            workspaceMembers: {
              some: {
                userId: callerId
              }
            }
          }
        },
        select: {
          id: true,
          workspace: {
            select: {
              workspaceMembers: {
                where: {
                  userId: callerId
                },
                select: {
                  role: true
                }
              }
            }
          },
          leadId: true
        }
      });

      if(!callerProjectMember) {
        throw new ForbiddenException('You are not member of this workspace or project');
      }

      const userRole = callerProjectMember.workspace.workspaceMembers[0].role;
      const isLead = callerId === callerProjectMember.leadId;
      const isOwner = userRole === 'OWNER';

      if (!isLead && !isOwner) {
        throw new ForbiddenException('Only Project Lead or Owner can create Epics');
      }

      const createdEpic = await this.prismaService.epic.create({
        data: {
          projectId: projectId,
          title: createEpicObject.title,
          color: createEpicObject.color,
          description: createEpicObject.description,
          startDate: createEpicObject.startDate,
          endDate: createEpicObject.endDate,
          createdBy: callerId
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      if(!createdEpic) {
        throw new InternalServerErrorException('Something went wrong at creating Epic');
      }

      return new EpicResponseDto(createdEpic);

    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Create Epic`
      );
      if (error instanceof HttpException) throw error;
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `An epic named "${createEpicObject.title}" already exists in this project`
        );
      }
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }
}
