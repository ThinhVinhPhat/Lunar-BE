import 'tsconfig-paths/register';
import { connectionSource } from './typeorm';

connectionSource
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
