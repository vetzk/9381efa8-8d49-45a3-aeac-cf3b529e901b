import express, {
  Express,
  json,
  NextFunction,
  Request,
  Response,
  urlencoded,
} from "express";
import cors from "cors";
import { PORT } from "./config";
import { DataRouter } from "./routers/data.router";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.setupSwagger();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(cors());
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private setupSwagger(): void {
    const swaggerDefinition = {
      openapi: "3.0.0",
      info: {
        title: "User Management API",
        version: "1.0.0",
        description: "API documentation for user management system",
      },
      servers: [
        {
          url: `http://localhost:${PORT}`, // Replace with your server URL
        },
      ],
    };

    const options = {
      swaggerDefinition,
      apis: ["./src/routers/*.ts"], // Path to the API docs
    };

    const swaggerSpec = swaggerJSDoc(options);
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  private handleError(): void {
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.includes("/api/")) {
        res.status(404).send("Not Found");
      } else {
        next();
      }
    });

    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes("/api/")) {
          console.error("Error", err.stack);
          console.log(err);
          res.status(500).send("Error!");
        } else {
          next();
        }
      }
    );
  }

  private routes(): void {
    const dataRouter = new DataRouter();

    this.app.use("/api/data", dataRouter.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(` ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
