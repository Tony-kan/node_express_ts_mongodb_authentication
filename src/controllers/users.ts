import express from "express";

import { deleteUserById, getUserById, getUsers } from "../db/users";

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await getUsers();

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error ." });
  }
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    const deletedUser = await deleteUserById(id);

    if (!deleteUser) {
      return res.status(404).json({ message: "User not found ." });
    }

    return res.status(200).json(deletedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const updateUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    const user = await getUserById(id);

    if (!username) {
      return res.status(400).json({ message: "Username is Required ." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.username = username;
    await user.save();

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Internal Server Error." });
  }
};
