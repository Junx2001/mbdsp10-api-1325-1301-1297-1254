const Joi = require('joi');
const db = require('../models');
const Category = db.Category;


exports.createExchange = async (req, res) => {
  const schema = Joi.object({
    category_name: Joi.string().required(),
  });
  try {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({
      code: 400, 
      status: "fail",
      message: error.details[0].message,
      data: null
    });

    const category = await Category.create(req.body);
    res.status(201).json({
      code: 201,
      status: "success",
      message: "Category created successfully",
      data: category
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


