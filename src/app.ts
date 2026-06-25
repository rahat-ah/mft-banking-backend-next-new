import express , {Request,Response} from 'express';
import authRouter from './routes/auth-routes';
import cookieParser from 'cookie-parser';
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser())

app.use("/api/auth", authRouter);

app.get('/', (req : Request, res : Response) => {
  res.send('Hello, World! from rahat');
});


export default app;