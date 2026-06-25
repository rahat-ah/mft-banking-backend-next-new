import dotenv from 'dotenv';
dotenv.config();
import app from './app';

import { connectToMongoDb} from './db/db';

const PORT = process.env.PORT || 3000;
connectToMongoDb()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
