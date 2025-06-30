import type { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import * as z from "zod/v4";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "5ee8103f1b511685dafe";

console.log(JWT_SECRET);

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
    const token = sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials!" });
  }
};
