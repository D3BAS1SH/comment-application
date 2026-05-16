import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import { LoggerService } from 'src/common/logger/logger.service.js';
import { IssueService } from './issue.service.js';
import { UserId } from 'src/common/decorators/UserId.decorator.js';
import { CreateIssueDto } from './dtos/create-issue.dto.js';
import { UpdateIssueDto } from './dtos/update-issue.dto.js';
import { ReorderIssueDto } from './dtos/reorder-issue.dto.js';
import { MoveSprintDto } from './dtos/move-sprint.dto.js';
import { ApiResponse } from 'src/common/dto/api-response.dto.js';
import { IssuePriority } from 'src/prisma/generated/enums.js';
import { IssueResponseDto } from './dtos/issue-response.dto.js';
import { IssueDetailResponseDto, SubTaskDto, IssueCommentDto } from './dtos/issue-detail-response.dto.js';
import { IssueListResponseDto } from './dtos/issue-list-response.dto.js';
import { IssueActivityListResponseDto } from './dtos/issue-activity-list-response.dto.js';
import { IssueCommentListResponseDto } from './dtos/issue-comment-list-response.dto.js';
import { SubTaskListResponseDto } from './dtos/subtask-list-response.dto.js';

@ApiTags('Issues')
@Controller('projects/:projectId/issues')
export class IssueController {
	private readonly context: string = IssueController.name;

	constructor(
		private readonly loggerService: LoggerService,
		private readonly issueService: IssueService
	) { }

	// ---------------------------------------------------------------------------
	// POST /projects/:projectId/issues
	// ---------------------------------------------------------------------------

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Create a new issue',
		description: 'Creates a new issue within the specified project. Requires workspace membership and appropriate permissions (non-VIEWER).'
	})
	@ApiParam({ name: 'projectId', description: 'The unique identifier of the project.' })
	@SwaggerApiResponse({
		status: HttpStatus.CREATED,
		description: 'Issue created successfully.',
		schema: {
			example: {
				success: true,
				statusCode: 201,
				message: 'Issue created successfully',
				data: {
					id: 'i1b2c3d4-e5f6-7890-abcd-ef1234567890',
					projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
					title: 'Implement Authentication',
					description: 'Set up JWT based authentication',
					priority: 'HIGH',
					position: 1000,
					statusId: 's1b2c3d4-e5f6-7890-abcd-ef1234567890',
					reporterId: 'u1b2c3d4-e5f6-7890-abcd-ef1234567890',
					createdAt: '2026-05-15T08:00:00.000Z',
					updatedAt: '2026-05-15T08:00:00.000Z'
				},
				timestamp: '2026-05-15T08:00:00.000Z',
			}
		}
	})
	@SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project or related entity not found.' })
	@SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Caller is not a member or lacks necessary role.' })
	@SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid authentication token.' })
	async createIssue(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Body() createIssueObject: CreateIssueDto
	): Promise<ApiResponse<IssueResponseDto>> {
		this.loggerService.log(`Create Issue Called By ${callerId}`, this.context);
		const result = await this.issueService.createIssue(callerId, projectId, createIssueObject);
		return ApiResponse.success(result, 'Issue created successfully', HttpStatus.CREATED);
	}

	// ---------------------------------------------------------------------------
	// GET /projects/:projectId/issues
	// ---------------------------------------------------------------------------

	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Get all issues with filters',
		description: 'Returns a list of issues for the specified project matching the provided filters. Available to all workspace members.'
	})
	@ApiParam({ name: 'projectId', description: 'The unique identifier of the project.' })
	@ApiQuery({ name: 'sprintId', required: false, type: String, description: 'Filter by sprint ID' })
	@ApiQuery({ name: 'epicId', required: false, type: String, description: 'Filter by epic ID' })
	@ApiQuery({ name: 'assigneeId', required: false, type: String, description: 'Filter by assignee ID' })
	@ApiQuery({ name: 'statusId', required: false, type: String, description: 'Filter by status ID' })
	@ApiQuery({ name: 'priority', required: false, enum: IssuePriority, description: 'Filter by priority' })
	@SwaggerApiResponse({
		status: HttpStatus.OK,
		description: 'Issues fetched successfully.',
		schema: {
			example: {
				success: true,
				statusCode: 200,
				message: 'Issues retrieved successfully',
				data: {
					issues: [
						{
							id: 'i1b2c3d4-e5f6-7890-abcd-ef1234567890',
							title: 'Implement Authentication',
							priority: 'HIGH',
							statusId: 's1b2c3d4-e5f6-7890-abcd-ef1234567890'
						}
					],
					totalCount: 1
				},
				timestamp: '2026-05-15T08:00:00.000Z',
			}
		}
	})
	@SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found.' })
	@SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Caller is not a member of this workspace.' })
	@SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid authentication token.' })
	async getAllIssues(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Query('sprintId') sprintId?: string,
		@Query('epicId') epicId?: string,
		@Query('assigneeId') assigneeId?: string,
		@Query('statusId') statusId?: string,
		@Query('priority') priority?: IssuePriority,
	): Promise<ApiResponse<IssueListResponseDto>> {
		this.loggerService.log(`Get All Issue Called By ${callerId}`, this.context);
		const result = await this.issueService.getIssues(callerId, projectId, { sprintId, epicId, assigneeId, statusId, priority });
		return ApiResponse.success(result, 'Issues retrieved successfully', HttpStatus.OK);
	}

	// ---------------------------------------------------------------------------
	// GET /projects/:projectId/issues/:issueId
	// ---------------------------------------------------------------------------

	@Get(':issueId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Get details of a specific issue',
		description: 'Retrieves the full details of a specific issue including its labels, subtasks, and other relations.'
	})
	@ApiParam({ name: 'projectId', description: 'The unique identifier of the project.' })
	@ApiParam({ name: 'issueId', description: 'The unique identifier of the issue.' })
	@SwaggerApiResponse({
		status: HttpStatus.OK,
		description: 'Issue retrieved successfully.',
		schema: {
			example: {
				success: true,
				statusCode: 200,
				message: 'Issue retrieved successfully',
				data: {
					id: 'i1b2c3d4-e5f6-7890-abcd-ef1234567890',
					title: 'Implement Authentication',
					description: 'Set up JWT based authentication',
					labels: [],
					subtasks: []
				},
				timestamp: '2026-05-15T08:00:00.000Z',
			}
		}
	})
	@SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Issue or Project not found.' })
	@SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Caller is not a member of this workspace.' })
	@SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid authentication token.' })
	async getIssue(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('issueId') issueId: string
	): Promise<ApiResponse<IssueDetailResponseDto>> {
		this.loggerService.log(`Get Specific Issue Called By ${callerId}`, this.context);
		const result = await this.issueService.getIssue(callerId, projectId, issueId);
		return ApiResponse.success(result, 'Issue retrieved successfully', HttpStatus.OK);
	}

	// ---------------------------------------------------------------------------
	// PATCH /projects/:projectId/issues/:issueId
	// ---------------------------------------------------------------------------

	@Patch(':issueId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Update an issue',
		description: 'Updates specific fields of an issue and logs the changes as activities. Requires write permissions (non-VIEWER).'
	})
	@ApiParam({ name: 'projectId', description: 'The unique identifier of the project.' })
	@ApiParam({ name: 'issueId', description: 'The unique identifier of the issue.' })
	@SwaggerApiResponse({
		status: HttpStatus.OK,
		description: 'Issue updated successfully.',
		schema: {
			example: {
				success: true,
				statusCode: 200,
				message: 'Issue updated successfully',
				data: {
					id: 'i1b2c3d4-e5f6-7890-abcd-ef1234567890',
					title: 'Updated Issue Title'
				},
				timestamp: '2026-05-15T08:00:00.000Z',
			}
		}
	})
	@SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Issue or related entity not found.' })
	@SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Caller is not a member or lacks necessary role.' })
	@SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid authentication token.' })
	async updateIssue(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('issueId') issueId: string,
		@Body() updateIssueObject: UpdateIssueDto
	): Promise<ApiResponse<IssueDetailResponseDto>> {
		this.loggerService.log(`Update Issue Called By ${callerId}`, this.context);
		const result = await this.issueService.updateIssue(callerId, projectId, issueId, updateIssueObject);
		return ApiResponse.success(result, 'Issue updated successfully', HttpStatus.OK);
	}

	// ---------------------------------------------------------------------------
	// DELETE /projects/:projectId/issues/:issueId
	// ---------------------------------------------------------------------------

	@Delete(':issueId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Delete an issue',
		description: 'Permanently deletes an issue and its associated activities. Subtasks will be unlinked or deleted based on relations.'
	})
	@ApiParam({ name: 'projectId', description: 'The unique identifier of the project.' })
	@ApiParam({ name: 'issueId', description: 'The unique identifier of the issue.' })
	@SwaggerApiResponse({
		status: HttpStatus.OK,
		description: 'Issue deleted successfully.',
		schema: {
			example: {
				success: true,
				statusCode: 200,
				message: 'Issue deleted successfully',
				data: null,
				timestamp: '2026-05-15T08:00:00.000Z',
			}
		}
	})
	@SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Issue or Project not found.' })
	@SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Caller is not a member or lacks necessary role.' })
	@SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid authentication token.' })
	async deleteIssue(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('issueId') issueId: string
	): Promise<ApiResponse<null>> {
		this.loggerService.log(`Delete Issue Called By ${callerId}`, this.context);
		await this.issueService.deleteIssue(callerId, projectId, issueId);
		return ApiResponse.success(null, 'Issue deleted successfully', HttpStatus.OK);
	}

	// ---------------------------------------------------------------------------
	// PATCH /projects/:projectId/issues/:issueId/reorder
	// ---------------------------------------------------------------------------

	@Patch(':issueId/reorder')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Reorder an issue within a status column',
		description: 'Updates the position of an issue within its current status column or moves it to a new status column and reorders.'
	})
	@ApiParam({ name: 'projectId', description: 'The unique identifier of the project.' })
	@ApiParam({ name: 'issueId', description: 'The unique identifier of the issue.' })
	@SwaggerApiResponse({
		status: HttpStatus.OK,
		description: 'Issue reordered successfully.',
		schema: {
			example: {
				success: true,
				statusCode: 200,
				message: 'Issue reordered successfully',
				data: {
					id: 'i1b2c3d4-e5f6-7890-abcd-ef1234567890',
					position: 2500,
					statusId: 's1b2c3d4-e5f6-7890-abcd-ef1234567890'
				},
				timestamp: '2026-05-15T08:00:00.000Z',
			}
		}
	})
	@SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Issue or Status not found.' })
	@SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Caller is not a member or lacks necessary role.' })
	@SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid authentication token.' })
	async reorderIssues(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('issueId') issueId: string,
		@Body() reorderIssuesObject: ReorderIssueDto
	): Promise<ApiResponse<IssueDetailResponseDto>> {
		this.loggerService.log(`Reorder Issue Called By ${callerId}`, this.context);
		const result = await this.issueService.reorderIssue(callerId, projectId, issueId, reorderIssuesObject);
		return ApiResponse.success(result, 'Issue reordered successfully', HttpStatus.OK);
	}

	// ---------------------------------------------------------------------------
	// PATCH /projects/:projectId/issues/:issueId/move-sprint
	// ---------------------------------------------------------------------------

	@Patch(':issueId/move-sprint')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Move an issue to a sprint or backlog',
		description: 'Moves an issue to a specific sprint or to the backlog if sprintId is explicitly passed as null.'
	})
	@ApiParam({ name: 'projectId', description: 'The unique identifier of the project.' })
	@ApiParam({ name: 'issueId', description: 'The unique identifier of the issue.' })
	@SwaggerApiResponse({
		status: HttpStatus.OK,
		description: 'Issue moved to sprint successfully.',
		schema: {
			example: {
				success: true,
				statusCode: 200,
				message: 'Issue moved to sprint successfully',
				data: {
					id: 'i1b2c3d4-e5f6-7890-abcd-ef1234567890',
					sprintId: 'sp1b2c3d4-e5f6-7890-abcd-ef123456789'
				},
				timestamp: '2026-05-15T08:00:00.000Z',
			}
		}
	})
	@SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Issue or Sprint not found.' })
	@SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Caller is not a member or lacks necessary role.' })
	@SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid authentication token.' })
	async moveIssueToSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('issueId') issueId: string,
		@Body() moveIssueSprintObject: MoveSprintDto
	): Promise<ApiResponse<IssueDetailResponseDto>> {
		this.loggerService.log(`Move to Sprint Issue Called By ${callerId}`, this.context);
		const result = await this.issueService.moveToSprint(callerId, projectId, issueId, moveIssueSprintObject);
		return ApiResponse.success(result, 'Issue moved to sprint successfully', HttpStatus.OK);
	}

	// ---------------------------------------------------------------------------
	// POST /projects/:projectId/issues/:issueId/labels/:labelId
	// ---------------------------------------------------------------------------

	@Post(':issueId/labels/:labelId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Attach a label to an issue',
		description: 'Attaches an existing label to the specified issue.'
	})
	@ApiParam({ name: 'projectId', description: 'The unique identifier of the project.' })
	@ApiParam({ name: 'issueId', description: 'The unique identifier of the issue.' })
	@ApiParam({ name: 'labelId', description: 'The unique identifier of the label.' })
	@SwaggerApiResponse({
		status: HttpStatus.OK,
		description: 'Label attached successfully.',
		schema: {
			example: {
				success: true,
				statusCode: 200,
				message: 'Label attached to issue successfully',
				data: {
					id: 'i1b2c3d4-e5f6-7890-abcd-ef1234567890',
					labels: [{ id: 'l1b2c3d4', name: 'Bug', color: '#f00' }]
				},
				timestamp: '2026-05-15T08:00:00.000Z',
			}
		}
	})
	@SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Issue or Label not found.' })
	@SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Caller is not a member or lacks necessary role.' })
	@SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid authentication token.' })
	async attachLabelToIssue(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('issueId') issueId: string,
		@Param('labelId') labelId: string
	): Promise<ApiResponse<IssueDetailResponseDto>> {
		this.loggerService.log(`Add Label to Issue Called By ${callerId}`, this.context);
		const result = await this.issueService.addLabel(callerId, projectId, issueId, labelId);
		return ApiResponse.success(result, 'Label attached to issue successfully', HttpStatus.OK);
	}

	// ---------------------------------------------------------------------------
	// DELETE /projects/:projectId/issues/:issueId/labels/:labelId
	// ---------------------------------------------------------------------------

	@Delete(':issueId/labels/:labelId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Detach a label from an issue',
		description: 'Detaches a previously attached label from the specified issue.'
	})
	@ApiParam({ name: 'projectId', description: 'The unique identifier of the project.' })
	@ApiParam({ name: 'issueId', description: 'The unique identifier of the issue.' })
	@ApiParam({ name: 'labelId', description: 'The unique identifier of the label.' })
	@SwaggerApiResponse({
		status: HttpStatus.OK,
		description: 'Label detached successfully.',
		schema: {
			example: {
				success: true,
				statusCode: 200,
				message: 'Label detached from issue successfully',
				data: {
					id: 'i1b2c3d4-e5f6-7890-abcd-ef1234567890',
					labels: []
				},
				timestamp: '2026-05-15T08:00:00.000Z',
			}
		}
	})
	@SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Issue or Label not found.' })
	@SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Caller is not a member or lacks necessary role.' })
	@SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid authentication token.' })
	async detachLabelFromIssue(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('issueId') issueId: string,
		@Param('labelId') labelId: string
	): Promise<ApiResponse<IssueDetailResponseDto>> {
		this.loggerService.log(`Remove Label from Issue Called By ${callerId}`, this.context);
		const result = await this.issueService.removeLabel(callerId, projectId, issueId, labelId);
		return ApiResponse.success(result, 'Label detached from issue successfully', HttpStatus.OK);
	}

	// ---------------------------------------------------------------------------
	// GET /projects/:projectId/issues/:issueId/activities
	// ---------------------------------------------------------------------------

	@Get(':issueId/activities')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'List all activities of an issue',
		description: 'Retrieves a history of activities/changes associated with the specified issue.'
	})
	@ApiParam({ name: 'projectId', description: 'The unique identifier of the project.' })
	@ApiParam({ name: 'issueId', description: 'The unique identifier of the issue.' })
	@SwaggerApiResponse({
		status: HttpStatus.OK,
		description: 'Issue activities retrieved successfully.',
		schema: {
			example: {
				success: true,
				statusCode: 200,
				message: 'Issue activities retrieved successfully',
				data: {
					activities: [
						{
							id: 'act1b2c3d4',
							issueId: 'i1b2c3d4-e5f6-7890-abcd-ef1234567890',
							actorId: 'u1b2c3d4',
							type: 'STATUS_CHANGED',
							createdAt: '2026-05-15T08:00:00.000Z'
						}
					],
					totalCount: 1
				},
				timestamp: '2026-05-15T08:00:00.000Z',
			}
		}
	})
	@SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Issue or Project not found.' })
	@SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Caller is not a member of this workspace.' })
	@SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid authentication token.' })
	async allActivityOfIssue(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('issueId') issueId: string
	): Promise<ApiResponse<IssueActivityListResponseDto>> {
		this.loggerService.log(`List all Issue activities Called By ${callerId}`, this.context);
		const result = await this.issueService.getActivities(callerId, projectId, issueId);
		return ApiResponse.success(result, 'Issue activities retrieved successfully', HttpStatus.OK);
	}

	// ---------------------------------------------------------------------------
	// GET /projects/:projectId/issues/:issueId/subtasks
	// ---------------------------------------------------------------------------

	@Get(':issueId/subtasks')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'List all subtasks of an issue',
		description: 'Retrieves all immediate subtasks of the specified issue.'
	})
	@ApiParam({ name: 'projectId', description: 'The unique identifier of the project.' })
	@ApiParam({ name: 'issueId', description: 'The unique identifier of the issue.' })
	@SwaggerApiResponse({
		status: HttpStatus.OK,
		description: 'Issue subtasks retrieved successfully.',
		schema: {
			example: {
				success: true,
				statusCode: 200,
				message: 'Issue subtasks retrieved successfully',
				data: {
					issues: [
						{
							id: 'sub1b2c3d4',
							title: 'Subtask 1',
							parentId: 'i1b2c3d4-e5f6-7890-abcd-ef1234567890'
						}
					],
					totalCount: 1
				},
				timestamp: '2026-05-15T08:00:00.000Z',
			}
		}
	})
	@SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Issue or Project not found.' })
	@SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Caller is not a member of this workspace.' })
	@SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid authentication token.' })
	async allSubTasks(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('issueId') issueId: string
	): Promise<ApiResponse<SubTaskListResponseDto>> {
		this.loggerService.log(`List all subtask Issue Called By ${callerId}`, this.context);
		const result = await this.issueService.getSubtasks(callerId, projectId, issueId);
		return ApiResponse.success(result, 'Issue subtasks retrieved successfully', HttpStatus.OK);
	}

	// ---------------------------------------------------------------------------
	// GET /projects/:projectId/issues/:issueId/comments
	// ---------------------------------------------------------------------------

	@Get(':issueId/comments')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'List all comments of an issue',
		description: 'Retrieves all comments associated with the specified issue, including author details.'
	})
	@ApiParam({ name: 'projectId', description: 'The unique identifier of the project.' })
	@ApiParam({ name: 'issueId', description: 'The unique identifier of the issue.' })
	@SwaggerApiResponse({
		status: HttpStatus.OK,
		description: 'Issue comments retrieved successfully.',
		schema: {
			example: {
				success: true,
				statusCode: 200,
				message: 'Issue comments retrieved successfully',
				data: {
					comments: [
						{
							id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890',
							body: 'This is a test comment.',
							author: {
								id: 'u1b2c3d4',
								firstName: 'John',
								lastName: 'Doe',
								email: 'john@example.com'
							},
							createdAt: '2026-05-15T08:00:00.000Z',
							updatedAt: '2026-05-15T08:00:00.000Z'
						}
					],
					totalCount: 1
				},
				timestamp: '2026-05-15T08:00:00.000Z',
			}
		}
	})
	@SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Issue or Project not found.' })
	@SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Caller is not a member of this workspace.' })
	@SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid authentication token.' })
	async getIssueComments(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('issueId') issueId: string
	): Promise<ApiResponse<IssueCommentListResponseDto>> {
		this.loggerService.log(`List all comments of Issue Called By ${callerId}`, this.context);
		const result = await this.issueService.getIssueComments(callerId, projectId, issueId);
		return ApiResponse.success(result, 'Issue comments retrieved successfully', HttpStatus.OK);
	}
}
