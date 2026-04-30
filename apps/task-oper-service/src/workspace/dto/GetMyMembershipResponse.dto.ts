export class GetMyMembershipResponse {
    userId: string;
    role: string;

    constructor(userId: string, role: string) {
        this.userId = userId;
        this.role = role;
    }
}