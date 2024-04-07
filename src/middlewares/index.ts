import express from "express";
import { get, merge } from "lodash";

import { getUserBySessionToken } from "../db/users";

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["USER-AUTH"];
    const existingUser = await getUserBySessionToken(sessionToken);

    if (!sessionToken || !existingUser) {
      return res.status(403).json({ message: "Unauthorized ." });
    }

    merge(req, { identity: existingUser });

    return next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.params;

    const currentUserId = get(req, "identity._id") as string;

    if (!currentUserId) {
      return res.status(403).json({ message: "Forbidden ." });
    }

    if (currentUserId.toString() !== id) {
      return res.status(403).json({ message: "Forbidden ." });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};
