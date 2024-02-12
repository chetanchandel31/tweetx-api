import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { addFakeDelayBeforeResponse } from "./middlewares/addFakeDelayBeforeResponse";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { routeNotFound } from "./middlewares/routeNotFound";
import appRoutes from "./appRoutes";
import { User } from "@prisma/client";

dotenv.config();

// to be able to add custom properties to request via middlewares
declare global {
  namespace Express {
    interface Request {
      userFromToken?: User;
    }
  }
}

const app = express();

// middlewares
app.use(express.json({ limit: "50mb" })); // these let us access req.body, w/o limit property we get "request too large"
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(addFakeDelayBeforeResponse(app.settings.env));

// routes
app.get("/api", (_req, res) => res.send({ name: "tweetx", ok: true }));
app.use("/api", appRoutes);

// handle errors and 404s
app.use(routeNotFound);
app.use(globalErrorHandler);

// connect with DB and start listening
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
