export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message = 'Invalid credentials provided') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailAlreadyExistsError extends AuthError {
  constructor(email: string) {
    super(`Email ${email} is already in use`);
    this.name = 'EmailAlreadyExistsError';
  }
}
