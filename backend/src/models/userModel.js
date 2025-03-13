class UserModel {
  constructor(user) {
    this.name = user.name;
    this.email = user.email;
    this.mobile = user.mobile;
    this.password = user.password;
    this.userType = user.userType;
    this.clubId = user.clubId || null; // Ensure clubId is included (defaults to null if not provided)
    this.MFA = user.MFA || false;
    this.isActive = user.isActive ?? true;
    this.CreatedAt = user.CreatedAt || new Date();
    this.UpdatedAt = user.UpdatedAt || new Date();
  }
}

export default UserModel;
