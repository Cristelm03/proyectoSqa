//import prisma client
const prisma = require("../prisma/client");

// Import validationResult from express-validator
const { validationResult } = require("express-validator");

//import bcrypt
const bcrypt = require("bcrypt");

//import user helpers
const { omitPassword, parseId } = require("../utils/user");

//send the error response: 404 when Prisma did not find the record, 500 otherwise
const handleError = (res, error) => {
  if (error.code === "P2025") {
    return res.status(404).send({
      success: false,
      message: "User not found",
    });
  }

  return res.status(500).send({
    success: false,
    message: "Internal server error",
  });
};

//send the error response for an id that is not a positive integer
const invalidId = (res) =>
  res.status(400).send({
    success: false,
    message: "Invalid user id",
  });

//function findUsers
const findUsers = async (req, res) => {
  try {
    //get all users from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    //send response
    res.status(200).send({
      success: true,
      message: "Get all users successfully",
      data: users,
    });
  } catch (error) {
    handleError(res, error);
  }
};

//function createUser
const createUser = async (req, res) => {
  // Periksa hasil validasi
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Jika ada error, kembalikan error ke pengguna
    return res.status(422).json({
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  }

  //hash password
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    //insert data
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      },
    });

    res.status(201).send({
      success: true,
      message: "User created successfully",
      data: omitPassword(user),
    });
  } catch (error) {
    handleError(res, error);
  }
};

//function findUserById
const findUserById = async (req, res) => {
  //get ID from params
  const id = parseId(req.params.id);
  if (!id) return invalidId(res);

  try {
    //get user by ID
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    //user not found
    if (!user) return handleError(res, { code: "P2025" });

    //send response
    res.status(200).send({
      success: true,
      message: `Get user By ID :${id}`,
      data: user,
    });
  } catch (error) {
    handleError(res, error);
  }
};

//function updateUser
const updateUser = async (req, res) => {
  //get ID from params
  const id = parseId(req.params.id);
  if (!id) return invalidId(res);

  // Periksa hasil validasi
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Jika ada error, kembalikan error ke pengguna
    return res.status(422).json({
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  }

  //hash password
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    //update user
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      },
    });

    //send response
    res.status(200).send({
      success: true,
      message: "User updated successfully",
      data: omitPassword(user),
    });
  } catch (error) {
    handleError(res, error);
  }
};

//function deleteUser
const deleteUser = async (req, res) => {
  //get ID from params
  const id = parseId(req.params.id);
  if (!id) return invalidId(res);

  try {
    //delete user
    await prisma.user.delete({
      where: {
        id,
      },
    });

    //send response
    res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  findUsers,
  createUser,
  findUserById,
  updateUser,
  deleteUser,
};
