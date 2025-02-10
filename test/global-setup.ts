import { MySqlContainer } from '@testcontainers/mysql';
import { StartedMySqlContainer } from '@testcontainers/mysql/build/mysql-container';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { mysqlConfig } from '../src/common/database/datasource';
import { seed } from '../src/seeds/seed';

let databaseContainer: StartedMySqlContainer;

export default async function setup() {
  dotenv.config();

  const ROOT_PASSWORD = 'root_password';
  const TEST_USER = 'test_user';
  const TEST_PASSWORD = 'test_password';
  const TEST_DB = 'test_db';

  // Create and start MySQL container
  databaseContainer = await new MySqlContainer()
    .withRootPassword(ROOT_PASSWORD)
    .withExposedPorts(3306)
    .withCommand([
      '--default-authentication-plugin=mysql_native_password',
      '--character-set-server=utf8mb4',
      '--collation-server=utf8mb4_unicode_ci',
    ])
    .start();

  // First connect as root to set up database and user
  const rootDataSource = new DataSource({
    type: 'mysql',
    host: databaseContainer.getHost(),
    port: databaseContainer.getMappedPort(3306),
    username: 'root',
    password: ROOT_PASSWORD,
    logging: ['error', 'warn'],
  } as MysqlConnectionOptions);

  try {
    await rootDataSource.initialize();
    console.log('Root connection initialized');

    // Create database and user with privileges
    await rootDataSource.query(`CREATE DATABASE IF NOT EXISTS ${TEST_DB}`);
    await rootDataSource.query(`
      CREATE USER IF NOT EXISTS '${TEST_USER}'@'%' IDENTIFIED BY '${TEST_PASSWORD}'
    `);
    await rootDataSource.query(`
      GRANT ALL PRIVILEGES ON ${TEST_DB}.* TO '${TEST_USER}'@'%'
    `);
    await rootDataSource.query('FLUSH PRIVILEGES');

    await rootDataSource.destroy();
    console.log('Database and user created');

    // Now connect as test user to run migrations
    const testConfig: MysqlConnectionOptions = {
      ...mysqlConfig,
      host: databaseContainer.getHost(),
      port: databaseContainer.getMappedPort(3306),
      username: TEST_USER,
      password: TEST_PASSWORD,
      database: TEST_DB,
    };

    const testDataSource = new DataSource(testConfig);

    await testDataSource.initialize();
    console.log('Test user connection initialized');

    await testDataSource.runMigrations();
    console.log('Migrations completed');

    // Always run seeds in test environment
    await seed(testDataSource);
    console.log('Test database seeded');

    await testDataSource.destroy();
    console.log('Test user connection closed');

    console.log('Test MySQL Container ready:', {
      host: databaseContainer.getHost(),
      port: databaseContainer.getMappedPort(3306),
      database: TEST_DB,
      user: TEST_USER,
    });
  } catch (error) {
    console.error('Database setup failed:', error);
    await teardown();
    throw error;
  }
}

export async function teardown() {
  if (databaseContainer) {
    await databaseContainer.stop();
    console.log('Test MySQL Container stopped');
  }
}

export { databaseContainer };
