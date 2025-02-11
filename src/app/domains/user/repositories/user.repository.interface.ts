import { IPaginatedResponse } from '../../../../common/interface/pagination.interface';
import { CreateUserParams, IUser, UpdateUserParams } from '../user.interface';

/**
 * Abstract repository interface for user persistence
 */
export interface IUserRepository {
  /**
   * Creates a new user
   * @param data User creation data
   */
  createUser(data: CreateUserParams): Promise<IUser>;

  /**
   * Finds a user by their email
   * @param email User's email address
   */
  findUserByEmail(email: string): Promise<IUser | undefined>;

  /**
   * Finds a user by their ID
   * @param userId User's unique identifier
   */
  findUserById(userId: string): Promise<IUser | undefined>;

  /**
   * Retrieves paginated list of users
   * @param limit Maximum number of users to return
   * @param page Page number (1-based)
   */
  findAll(limit: number, page: number): Promise<IPaginatedResponse<IUser>>;

  /**
   * Deletes a user
   * @param userId User's unique identifier
   */
  deleteUser(userId: string): Promise<void>;

  /**
   * Updates a user
   * @param userId User's unique identifier
   * @param data Update data
   */
  updateUser(userId: string, data: UpdateUserParams): Promise<IUser>;
}
