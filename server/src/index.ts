import express, { type Application } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { zodMiddleware } from "./middlewares/zod.middleware";

// ROUTE IMPORTS

import userRoutes from "./routes/usersRoutes";
import { login, refresh } from "./controllers/authControllers";

// CONFIGURATION

dotenv.config();
const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// ROUTES

app.use("/users", userRoutes);

// Login

app.post("/login", login);
app.post("/refresh", refresh);

// Zod Middleware
app.use(zodMiddleware);

console.log(process.env.PORT);
const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
