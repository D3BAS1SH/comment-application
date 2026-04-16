export class CreateWorkspaceResponse {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    ownerId: string;

    constructor(id: string, name: string, slug: string, createdAt: Date, ownerId: string) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.createdAt = createdAt;
        this.ownerId = ownerId;
    }
}