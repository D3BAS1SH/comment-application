export class GetMembershipResponse {
  userId: string;
  email: string;
  role: string;

  constructor(userId: string, role: string, email: string) {
    this.userId = userId;
    this.role = role;
    this.email = email;
  }
}
