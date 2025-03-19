import app from './app';
import { AppDataSource } from './data-source';

const PORT = process.env.PORT || 5020;

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error during Data Source initialization:', err);
  });