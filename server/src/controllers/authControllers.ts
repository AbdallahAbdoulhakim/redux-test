import type { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import * as z from "zod/v4";
import { compare } from "bcrypt";
import { sign, decode } from "jsonwebtoken";

type UserPayload = {
  id: number;
  username: string;
};

const prisma = new PrismaClient();

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "5ee8103f1b511685dafe";

const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "b64fbca02d6b61d3a3fd";

const generateAccessToken = (user: UserPayload) => {
  return sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};
const generateRefreshToken = (user: UserPayload) => {
  let date = new Date();
  let millisecondToAdd = 60 * 60 * 24 * 7 * 1000;
  date.setTime(date.getTime() + millisecondToAdd);

  return {
    refreshToken: sign(user, REFRESH_TOKEN_SECRET, {
      expiresIn: 60 * 60 * 24 * 7,
    }),
    expire_at: date,
  };
};

const loginSchema = z.object({
  username: z.string({ error: "username is required!" }).min(1),
  password: z.string({ error: "password is required!" }).min(1),
});

export const login = async (req: Request, res: Response) => {
  const { username, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  if (user && (await compare(password, user.password))) {
    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
    });

    const { refreshToken, expire_at } = generateRefreshToken({
      id: user.id,
      username: user.username,
    });

    const existToken = await prisma.refreshToken.count({
      where: {
        userId: user.id,
      },
    });

    if (existToken > 2) {
      const toDelete = await prisma.refreshToken.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          expires_at: "asc",
        },
      });

      await prisma.refreshToken.delete({
        where: {
          id: toDelete?.id,
        },
      });
    }

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expires_at: expire_at,
      },
    });

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    res.json({ accessToken });
  } else {
    res.status(401).json({ message: "Invalid credentials!" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized!" });
    return;
  }

  const decoded = decode(refreshToken);

  console.log(decoded);

  res.json("Voila");
};
