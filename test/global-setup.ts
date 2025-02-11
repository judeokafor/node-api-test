import { MySqlContainer } from '@testcontainers/mysql';
import { StartedMySqlContainer } from '@testcontainers/mysql/build/mysql-container';
import { DataSource } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

let databaseContainer: StartedMySqlContainer;
let dataSource: DataSource;

export default async function setup() {
  const ROOT_PASSWORD = 'root_password';
  const TEST_DB = 'test_db';

  // Create and start MySQL container
  databaseContainer = await new MySqlContainer()
    .withRootPassword(ROOT_PASSWORD)
    .withExposedPorts(3306)
    .withUser('root')
    .withDatabase(TEST_DB)
    .withCommand([
      '--default-authentication-plugin=mysql_native_password',
      '--character-set-server=utf8mb4',
      '--collation-server=utf8mb4_unicode_ci',
    ])
    .start();

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.DB_HOST = databaseContainer.getHost();
  process.env.DB_PORT = databaseContainer.getMappedPort(3306).toString();
  process.env.DB_USER = databaseContainer.getUsername();
  process.env.DB_PASS = databaseContainer.getUserPassword();
  process.env.DB_NAME = databaseContainer.getDatabase();

  // Initialize test DataSource
  dataSource = new DataSource({
    type: 'mysql',
    host: databaseContainer.getHost(),
    port: databaseContainer.getMappedPort(3306),
    username: databaseContainer.getUsername(),
    password: databaseContainer.getUserPassword(),
    database: databaseContainer.getDatabase(),
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    migrationsTableName: 'migrations',
    synchronize: false,
    logging: ['error', 'warn'],
    namingStrategy: new SnakeNamingStrategy(),
  } as MysqlConnectionOptions);

  try {
    // Initialize the connection
    await dataSource.initialize();

    // Run migrations and seed
    await dataSource.runMigrations();
  } catch (error) {
    console.error('Database setup failed:', error);

    throw error;
  }
}

export { databaseContainer, dataSource };
