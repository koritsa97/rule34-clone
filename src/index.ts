import app from '@/app';
import { initMongoose } from '@/config/mongoose';

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
