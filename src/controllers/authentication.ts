import express from "express";

import { createUser, getUserByEmail } from "../db/users";
import { authentication, random } from "../helpers";

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body;
    const existingUser = await getUserByEmail(email);

    if (!email || !password || !username) {
      return res.sendStatus(400);
    }

    if (existingUser) {
      return res.sendStatus(400);
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    const userByEmail = await getUserByEmail(email).select(
      "authentication.salt + authentication.password"
    );
    const expectedHash = authentication(
      userByEmail.authentication.salt,
      password
    );

    if (!email || !password) {
      return res.sendStatus(400);
    }

    if (!userByEmail) {
      return res.sendStatus(400);
    }

    if (userByEmail.authentication.password !== expectedHash) {
      return res.sendStatus(403);
    }

    const salt = random();

    userByEmail.authentication.sessionToken = authentication(
      salt,
      userByEmail._id.toString()
    );

    await userByEmail.save();

    res.cookie("TKAY-AUTH", userByEmail.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
    });

    return res.status(200).json(userByEmail).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
