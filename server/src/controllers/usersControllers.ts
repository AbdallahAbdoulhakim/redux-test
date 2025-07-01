import type { Response, Request } from "express";
import { PrismaClient } from "../../generated/prisma";
import * as z from "zod/v4";
import { genSalt, hash } from "bcrypt";

const prisma = new PrismaClient().$extends({
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
        error:
          "Username must contain only letters and numbers, and it must be between 6 and 16 characters long.",
      }),
    password: z
      .string({ error: "Password is required!" })
      .trim()
      .regex(
        /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/,
        {
          error:
            "The password must have at least one upper case english letter, at least one lower case english letter, at least one digit, at least one special character and must have a minimum of eight characters!",
        }
      ),
    firstname: z.string().trim().optional(),
    lastname: z.string().trim().optional(),
    email: z.email({ error: "You must provide a valid email!" }),
    confirmPassword: z
      .string({ error: "Password confirmation is required!" })
      .trim()
      .min(1),
  })
  .refine(
    ({ password, confirmPassword }) => {
      return password === confirmPassword;
    },
    { error: "`password` and `confirmPassword` fields must match" }
  );

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { confirmPassword, password, ...userToCreate } = userSchema.parse(
    req.body
  );

  const salt = await genSalt(saltRounds);
  const hashedPass = await hash(password, salt);

  const { password: createdPassword, ...createdUser } =
    await prisma.user.create({
      data: { ...userToCreate, password: hashedPass },
    });

  res.json(createdUser);
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await prisma.user.findMany();

  res.json(
    users.map((user) => {
      const { password, ...userToSend } = user;
      return userToSend;
    })
  );
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  const userIdSchema = z
    .string()
    .regex(/^\d+$/, { error: "userId must be a number!" });

  userIdSchema.parse(userId);

  const user = await prisma.user.findFirst({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    res.status(404).json({ message: "User not Found!" });
    return;
  }

  const { password, ...userToSend } = user;

  res.json(userToSend);
};
