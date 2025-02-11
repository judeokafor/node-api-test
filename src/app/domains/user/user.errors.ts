export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserError';
  }
}

export class UserNotFoundError extends UserError {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

export class SelfDeletionError extends UserError {
  constructor() {
    super('You cannot delete yourself');
    this.name = 'SelfDeletionError';
  }
}

export class InsufficientPermissionsError extends UserError {
  constructor(message = 'Insufficient permissions for this operation') {
    super(message);
    this.name = 'InsufficientPermissionsError';
  }
}

export class EmailInUseError extends UserError {
  constructor(email: string) {
    super(`Email ${email} is already in use`);
    this.name = 'EmailInUseError';
  }
}

export class UnauthorizedUpdateError extends UserError {
  constructor() {
    super('You are not authorized to update this user');
    this.name = 'UnauthorizedUpdateError';
  }
}
