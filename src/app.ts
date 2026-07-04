import express , {Request,Response} from 'express';
import authRouter from './routes/auth-routes';
import cookieParser from 'cookie-parser';
import cors from "cors";
import userRouter from './routes/user-routes';

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser())

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.get('/', (req : Request, res : Response) => {
  res.send('Hello, World! from rahat');
});


export default app;