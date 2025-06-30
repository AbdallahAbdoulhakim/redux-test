import { Router } from "express";
import { createUser, getUser, getUsers } from "../controllers/usersControllers";

const router = Router();

router.get("/:id", getUser);
router.post("/", createUser);
router.get("/", getUsers);

export default router;
