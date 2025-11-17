import express from "express";
import cors from "cors";
import passport from "passport";
import "./strategies/google.strategy";
import authRoutes from "./routes/auth.routes";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();

// Middlewares
app.use(cors(
  {
  origin:["https://ashinity-real-estate-frontend-web.vercel.app", "*" ], 
  methods: "GET,POST,PUT,DELETE",
}
));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ashinity API",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/*.ts"], // Point to your route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
