export class GetAllMembersResponse {
    id: string;
    name: string;
    createdAt:Date;
    ownerId: string;
    slug: string;
    workspaceMembers: {
        user: {
            firstName: string;
            email: string;
        };
    }[];
    owner: {
        firstName: string;
        email: string;
    };

    constructor(id: string, name: string, createdAt: Date, ownerId: string, slug: string, workspaceMembers: {
        user: {
            firstName: string;
            email: string;
        };
    }[], owner: {
        firstName: string;
        email: string;
    }) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.ownerId = ownerId;
        this.slug = slug;
        this.workspaceMembers = workspaceMembers.map((member) => {
            return {
                user: {
                    firstName: member.user.firstName,
                    email: member.user.email,
                },
            };
        });
        this.owner = {
            firstName: owner.firstName,
            email: owner.email,
        };
    }
}