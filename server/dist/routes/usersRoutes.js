"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersControllers_1 = require("../controllers/usersControllers");
const router = (0, express_1.Router)();
router.get("/:id", usersControllers_1.getUser);
router.post("/", usersControllers_1.createUser);
router.get("/", usersControllers_1.getUsers);
exports.default = router;
