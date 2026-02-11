import { Router } from "express";
import { 
  createusersController, 
  getusersController, 
  getusersByIdController,
  updateusersController,
  deleteusersController 
} from "./users.controller";

const router = Router();

// POST /api/users/register
router.post("/register", createusersController);


// GET /api/users
router.get("/", getusersController);

// GET /api/users/:id
router.get("/:id", getusersByIdController);

// PUT /api/users/:id
router.put("/:id", updateusersController);

// DELETE /api/users/:id
router.delete("/:id", deleteusersController);

export default router;