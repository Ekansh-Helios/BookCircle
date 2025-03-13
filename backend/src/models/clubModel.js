class ClubModel {
    constructor(club) {
      this.Name = club.Name;
      this.Location = club.Location;
      this.CentralLocation = club.CentralLocation;
      this.ContactEmail = club.ContactEmail;
      this.isActive = club.isActive ?? true;
      this.CreatedAt = club.CreatedAt || new Date();
      this.UpdatedAt = club.UpdatedAt || new Date();
    }
  }
  
  export default ClubModel;
  