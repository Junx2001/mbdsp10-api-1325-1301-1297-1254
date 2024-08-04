const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../models/pg_models');
const User = db.User;
const Role = db.Role;


exports.register = async (req, res) => {
  const registerSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    address: Joi.string().allow(null),
    role: Joi.string().required()
  });
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({
      code: 400, 
      status: "fail",
      message: error.details[0].message,
      data: null
    });

    const role = await Role.findOne({ where: { name: req.body.role } });
    if (!role)  return res.status(400).json({
      code: 400, 
      status: "fail",
      message: "invalid role",
      data: null
    });

    const user = await User.create({ ...req.body, role_id: role.id });
    const new_user = { id: user.id, username: user.username, email: user.email, role: role.name }
    res.status(201).json({
      code: 201,
      status: "success",
      message: "User created successfully",
      data: new_user
    });
    
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: "fail",
      message: err.message,
      data: null
    });
  }
};

exports.login = async (req, res) => {
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  });
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({
      code: 400, 
      status: "fail",
      message: error.details[0].message,
      data: null
    });

    const user = await User.findOne({ where: { email: req.body.email }, include: 'role' });
    if (!user)  return res.status(400).json({
      code: 401, 
      status: "fail",
      message: "Account not found. Please register first.",
      data: null
    });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword)  return res.status(400).json({
      code: 403, 
      status: "fail",
      message: "Invalid email or password. Please try again.",
      data: null
    });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      code: 200,
      status: "success",
      message: "User logged in successfully",
      data: { 
        user: { id: user.id, username: user.username, email: user.email, role: user.role.name },
        access_token: token,
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
