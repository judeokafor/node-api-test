import { DataSource } from 'typeorm';

import { seedUsers } from './user.seed';
import { mysqlConfig } from '../common/database/datasource';

export async function seed(existingDataSource?: DataSource) {
  console.log('Starting database seed...');

  const dataSource = existingDataSource || new DataSource(mysqlConfig);
  const shouldCloseConnection = !existingDataSource;

  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log('Database connected');
    }

    await seedUsers(dataSource);

    if (shouldCloseConnection) {
      await dataSource.destroy();
      console.log('Database connection closed');
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    if (shouldCloseConnection && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    throw error;
  }
}

// Allow running seed directly or importing
if (require.main === module) {
  seed();
}
