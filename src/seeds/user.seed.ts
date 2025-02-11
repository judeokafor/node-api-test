import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as argon2 from 'argon2';

import { User } from '../app/domains/user/user.entity';
import { UserRole } from '../app/domains/user/user.interface';

export async function seedUsers(dataSource: DataSource, count = 1000) {
  const userRepository = dataSource.getRepository(User);
  const ADMIN_COUNT = 10;

  const adminPassword = await argon2.hash('admin123');

  // Create admin users with known credentials
  const adminUsers = Array.from({ length: ADMIN_COUNT }, (_, index) => {
    return userRepository.create({
      name: index === 0 ? 'Super Admin' : `Admin ${index}`,
      email: index === 0 ? 'admin@example.com' : `admin${index}@example.com`,
      password: adminPassword,
      role: UserRole.ADMIN,
    });
  });

  const password = await argon2.hash('password123');
  // Create regular users with faker
  const regularUsers = Array.from({ length: count - ADMIN_COUNT }, () => {
    return userRepository.create({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password,
      role: UserRole.USER,
    });
  });

  console.log(
    `Seeding ${ADMIN_COUNT} admins and ${count - ADMIN_COUNT} regular users...`,
  );
  await userRepository.save([...adminUsers, ...regularUsers]);
  console.log('Users seeded successfully');
}
