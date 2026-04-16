export class WorkspaceDetails {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  ownerId: string;
  owner: {
    firstName: string;
    email: string;
  };
  workspaceMembers: {
    user: {
      firstName: string;
      email: string;
    };
  }[];

  constructor(
    id: string,
    name: string,
    slug: string,
    createdAt: Date,
    ownerId: string,
    owner: { firstName: string; email: string },
    workspaceMembers: { user: { firstName: string; email: string } }[]
  ) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.createdAt = createdAt;
    this.ownerId = ownerId;
    this.owner = owner;
    this.workspaceMembers = workspaceMembers;
  }
}
