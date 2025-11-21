import express, { type Request, type Response, type Router } from "express";
import { storage } from "./storage";
import { isAdmin, isAuthenticated } from "./auth";

// ... rest of the file remains the same ...