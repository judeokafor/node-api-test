import { Inject, Injectable } from '@nestjs/common';
import {
  CreateUserParams,
  IUser,
  UserRole,
  UpdateUserParams,
} from './user.interface';
import {
  UserNotFoundError,
  SelfDeletionError,
  InsufficientPermissionsError,
  EmailInUseError,
  UnauthorizedUpdateError,
} from './user.errors';
import { IUserRepository } from './repositories/user.repository.interface';
import { IPaginatedResponse } from '../../../common/interface/pagination.interface';

/**
 * Service responsible for user-related business logic
 */
@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Creates a new user
   * @param params User creation parameters
   * @returns Newly created user
   */
  async createUser(params: CreateUserParams): Promise<IUser> {
    return this.userRepository.createUser(params);
  }

  /**
   * Finds a user by their email address
   * @param email User's email address
   * @returns User if found, undefined otherwise
   */
  async findUserByEmail(email: string): Promise<IUser | undefined> {
    return this.userRepository.findUserByEmail(email);
  }

  /**
   * Retrieves paginated list of users
   * @param limit Maximum number of users to return
   * @param page Page number
   * @returns Paginated users result with metadata
   */
  async findAll(
    limit: number,
    page: number,
  ): Promise<IPaginatedResponse<IUser>> {
    return this.userRepository.findAll(limit, page);
  }

  /**
   * Finds a user by their ID
   * @param userId User's unique identifier
   * @throws {UserNotFoundError} If user is not found
   * @returns User if found
   */
  async findUserById(userId: string): Promise<IUser> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return user;
  }

  /**
   * Deletes a user from the system
   * @param requestingUserId ID of the user making the request
   * @param targetUserId ID of the user to be deleted
   * @param role Role of the requesting user
   * @throws {UserNotFoundError} If target user is not found
   * @throws {SelfDeletionError} If user tries to delete themselves
   * @throws {InsufficientPermissionsError} If user lacks required permissions
   */
  async deleteUser(
    requestingUserId: string,
    targetUserId: string,
    role: UserRole,
  ): Promise<void> {
    await this.validateUserDeletion(requestingUserId, targetUserId, role);
    await this.userRepository.deleteUser(targetUserId);
  }

  /**
   * Validates if a user can be deleted
   * @private
   */
  private async validateUserDeletion(
    requestingUserId: string,
    targetUserId: string,
    role: UserRole,
  ): Promise<void> {
    const userToDelete = await this.findUserById(targetUserId);

    if (!userToDelete) {
      throw new UserNotFoundError(targetUserId);
    }

    if (requestingUserId === targetUserId) {
      throw new SelfDeletionError();
    }

    if (role !== UserRole.ADMIN) {
      throw new InsufficientPermissionsError(
        'You do not have permission to delete users',
      );
    }
  }

  /**
   * Updates a user's information
   * @param requestingUserId ID of the user making the request
   * @param targetUserId ID of the user to update
   * @param data Update data
   * @param role Role of the requesting user
   * @throws {UserNotFoundError} If user not found
   * @throws {UnauthorizedUpdateError} If user not authorized
   * @throws {EmailInUseError} If email already in use
   */
  async updateUser(
    requestingUserId: string,
    targetUserId: string,
    data: UpdateUserParams,
    role: UserRole,
  ): Promise<IUser> {
    const targetUser = await this.findUserById(targetUserId);

    if (!targetUser) {
      throw new UserNotFoundError(targetUserId);
    }

    // Check authorization
    if (requestingUserId !== targetUserId && role !== UserRole.ADMIN) {
      throw new UnauthorizedUpdateError();
    }

    // Regular users can't update roles
    if (role !== UserRole.ADMIN && data.role) {
      throw new UnauthorizedUpdateError();
    }

    // Check if email is being updated and is not already in use
    if (data.email && data.email !== targetUser.email) {
      const existingUser = await this.userRepository.findUserByEmail(
        data.email,
      );

      if (existingUser) {
        throw new EmailInUseError(data.email);
      }
    }

    return this.userRepository.updateUser(targetUserId, data);
  }
}
