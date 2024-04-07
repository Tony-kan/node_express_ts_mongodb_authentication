import express from "express";

import { createUser, getUserByEmail } from "../db/users";
import { authentication, random } from "../helpers";

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body;
    const existingUser = await getUserByEmail(email);

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Email , Password and Username are required." });
    }

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists." });
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

    return res.status(201).json(user).end();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error." });
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
    const salt = random();

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required." });
    }

    if (!userByEmail) {
      return res.status(401).json({ message: "Invalid email or Password" });
    }

    if (userByEmail.authentication.password !== expectedHash) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    userByEmail.authentication.sessionToken = authentication(
      salt,
      userByEmail._id.toString()
    );

    await userByEmail.save();

    res.cookie("USER-AUTH", userByEmail.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
    });

    return res.status(200).json(userByEmail).end();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};
