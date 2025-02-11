import { dataSource, databaseContainer } from './global-setup';

export async function teardown() {
  try {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
    if (databaseContainer) {
      await databaseContainer.stop({
        removeVolumes: true,
      });
    }
  } catch (error) {
    console.error('Teardown failed:', error);
    throw error;
  }
}

export default teardown;
