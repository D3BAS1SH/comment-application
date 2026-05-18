export class GetAllMembersResponse {
  id: string;
  name: string;
  createdAt: Date;
  ownerId: string;
  slug: string;
  workspaceMembers: {
    role: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
  owner: {
    firstName: string;
    email: string;
  };

  constructor(
    id: string,
    name: string,
    createdAt: Date,
    ownerId: string,
    slug: string,
    workspaceMembers: {
      role: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }[],
    owner: {
      firstName: string;
      email: string;
    }
  ) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.ownerId = ownerId;
    this.slug = slug;
    this.workspaceMembers = workspaceMembers.map((member) => ({
      role: member.role,
      user: {
        id: member.user.id,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        email: member.user.email,
      },
    }));
    this.owner = {
      firstName: owner.firstName,
      email: owner.email,
    };
  }
}
