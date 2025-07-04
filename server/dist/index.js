"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const zod_middleware_1 = require("./middlewares/zod.middleware");
// ROUTE IMPORTS
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const authControllers_1 = require("./controllers/authControllers");
// CONFIGURATION
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
// ROUTES
app.use("/users", usersRoutes_1.default);
// Login
app.post("/login", authControllers_1.login);
app.post("/refresh", authControllers_1.refresh);
// Zod Middleware
app.use(zod_middleware_1.zodMiddleware);
console.log(process.env.PORT);
const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
