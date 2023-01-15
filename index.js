import app from './src/app.js';
import { initMongoose } from './src/config/mongoose.js';

initMongoose()
  .then(() => {
    console.log('Database connected');

    const { PORT } = process.env;
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
