import express, { type Request, type Response, type Router } from "express";
import { storage } from "./storage";
import { isAdmin, isAuthenticated } from "./auth";

const router: Router = express.Router();

router.get("/api/notes", isAuthenticated, (req: Request, res: Response) => {
  const notes = storage.getNotes();
  res.json(notes);
});

router.post("/api/notes", isAuthenticated, (req: Request, res: Response) => {
  const note = req.body;
  storage.addNote(note);
  res.status(201).send();
});

router.put("/api/notes/:id", isAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const note = req.body;
  storage.updateNote(id, note);
  res.send();
});

router.delete("/api/notes/:id", isAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  storage.deleteNote(id);
  res.send();
});

export default router;
