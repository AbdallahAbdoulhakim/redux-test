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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.getUsers = exports.createUser = void 0;
const prisma_1 = require("../../generated/prisma");
const z = __importStar(require("zod/v4"));
const bcrypt_1 = require("bcrypt");
const prisma = new prisma_1.PrismaClient().$extends({
    result: {
        refreshToken: {
            is_valid: {
                needs: { expires_at: true },
                compute(refreshToken) {
                    return true;
                },
            },
        },
    },
});
const saltRounds = 10;
const userSchema = z
    .object({
    username: z
        .string({ error: "Username is required!" })
        .trim()
        .regex(/^[0-9A-Za-z]{6,16}$/, {
        error: "Username must contain only letters and numbers, and it must be between 6 and 16 characters long.",
    }),
    password: z
        .string({ error: "Password is required!" })
        .trim()
        .regex(/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/, {
        error: "The password must have at least one upper case english letter, at least one lower case english letter, at least one digit, at least one special character and must have a minimum of eight characters!",
    }),
    firstname: z.string().trim().optional(),
    lastname: z.string().trim().optional(),
    email: z.email({ error: "You must provide a valid email!" }),
    confirmPassword: z
        .string({ error: "Password confirmation is required!" })
        .trim()
        .min(1),
})
    .refine(({ password, confirmPassword }) => {
    return password === confirmPassword;
}, { error: "`password` and `confirmPassword` fields must match" });
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = userSchema.parse(req.body), { confirmPassword, password } = _a, userToCreate = __rest(_a, ["confirmPassword", "password"]);
    const salt = yield (0, bcrypt_1.genSalt)(saltRounds);
    const hashedPass = yield (0, bcrypt_1.hash)(password, salt);
    const _b = yield prisma.user.create({
        data: Object.assign(Object.assign({}, userToCreate), { password: hashedPass }),
    }), { password: createdPassword } = _b, createdUser = __rest(_b, ["password"]);
    res.json(createdUser);
});
exports.createUser = createUser;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany();
    res.json(users.map((user) => {
        const { password } = user, userToSend = __rest(user, ["password"]);
        return userToSend;
    }));
});
exports.getUsers = getUsers;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const userIdSchema = z
        .string()
        .regex(/^\d+$/, { error: "userId must be a number!" });
    userIdSchema.parse(userId);
    const user = yield prisma.user.findFirst({
        where: {
            id: Number(userId),
        },
    });
    if (!user) {
        res.status(404).json({ message: "User not Found!" });
        return;
    }
    const { password } = user, userToSend = __rest(user, ["password"]);
    res.json(userToSend);
});
exports.getUser = getUser;
