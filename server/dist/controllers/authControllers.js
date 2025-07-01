"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.login = void 0;
const prisma_1 = require("../../generated/prisma");
const z = __importStar(require("zod/v4"));
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma = new prisma_1.PrismaClient();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "5ee8103f1b511685dafe";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "b64fbca02d6b61d3a3fd";
const generateAccessToken = (user) => {
    return (0, jsonwebtoken_1.sign)(user, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};
const generateRefreshToken = (user) => {
    let date = new Date();
    let millisecondToAdd = 60 * 60 * 24 * 7 * 1000;
    date.setTime(date.getTime() + millisecondToAdd);
    return {
        refreshToken: (0, jsonwebtoken_1.sign)(user, REFRESH_TOKEN_SECRET, {
            expiresIn: 60 * 60 * 24 * 7,
        }),
        expire_at: date,
    };
};
const loginSchema = z.object({
    username: z.string({ error: "username is required!" }).min(1),
    password: z.string({ error: "password is required!" }).min(1),
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = loginSchema.parse(req.body);
    const user = yield prisma.user.findFirst({
        where: {
            username,
        },
    });
    if (user && (yield (0, bcrypt_1.compare)(password, user.password))) {
        const accessToken = generateAccessToken({
            id: user.id,
            username: user.username,
        });
        const { refreshToken, expire_at } = generateRefreshToken({
            id: user.id,
            username: user.username,
        });
        const existToken = yield prisma.refreshToken.count({
            where: {
                userId: user.id,
            },
        });
        if (existToken > 2) {
            const toDelete = yield prisma.refreshToken.findFirst({
                where: {
                    userId: user.id,
                },
                orderBy: {
                    expires_at: "asc",
                },
            });
            yield prisma.refreshToken.delete({
                where: {
                    id: toDelete === null || toDelete === void 0 ? void 0 : toDelete.id,
                },
            });
        }
        yield prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expires_at: expire_at,
            },
        });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
        res.json({ accessToken });
    }
    else {
        res.status(401).json({ message: "Invalid credentials!" });
    }
});
exports.login = login;
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ message: "Unauthorized!" });
        return;
    }
    const decoded = (0, jsonwebtoken_1.decode)(refreshToken);
    console.log(decoded);
    res.json("Voila");
});
exports.refresh = refresh;
