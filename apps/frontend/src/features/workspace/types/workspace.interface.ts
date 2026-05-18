export interface WorkspaceDetails {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
  owner?: {
    firstName: string;
    lastName?: string;
    email: string;
  };
  workspaceMembers?: Array<{
    user: {
      firstName: string;
      lastName?: string;
      email: string;
    };
    role?: string;
  }>;
}

export interface CreateWorkspaceDto {
  name: string;
  slug: string;
}

export interface UpdateWorkspaceDto {
  id: string;
  name?: string;
  slug?: string;
}

export interface CreateWorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

export interface AddMemberDto {
  email: string;
  role: 'MEMBER' | 'ADMIN' | 'VIEWER';
}

export interface UpdateMemberDto {
  role: 'MEMBER' | 'ADMIN' | 'VIEWER';
}

export interface TransferOwnershipDto {
  toUserId: string;
  /** Current role of the target user — must not be OWNER */
  fromRole: 'ADMIN' | 'MEMBER' | 'VIEWER';
  /** Role the caller (current owner) receives after the transfer */
  toRole: 'ADMIN' | 'MEMBER';
}

export interface GetAllMembersResponse {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  owner: {
    firstName: string;
    lastName?: string;
    email: string;
  };
  workspaceMembers: Array<{
    role: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export interface GetMembershipResponse {
  userId: string;
  email: string;
  role: string;
}
