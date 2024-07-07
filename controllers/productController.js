const Joi = require('joi');
const db = require('../models');
const Product = db.Product;
const Category = db.Category;


exports.addProduct = async (req, res) => {
    const schema = Joi.object({
        product_name: Joi.string().required(),
        description: Joi.string().allow(null, ''),
        product_image: Joi.string().allow(null),
        categories: Joi.array().items(Joi.number()).required(), // Assuming category IDs
      });
  try {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({
      code: 400, 
      status: "fail",
      message: error.details[0].message,
      data: null
    });

    const { product_name, description, product_image, categories } = req.body;

    const product = await Product.create({ product_name, description, product_image, first_owner_id: 1});
    await product.setCategories(categories).then(
        () => {
            res.status(201).json({
                code: 201,
                status: "success",
                message: "Product created successfully",
                data: product
              });
        }
    ); // Assuming categories is an array of category IDs

    
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: "fail",
      message: err.message,
      data: null
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
     // Getting all products with their categories
     const products = await Product.findAll({
      include: [{
        model: Category,
        through: { attributes: [] }, // Exclude the join table attributes
      }],
    });
      res.status(200).json({
      code: 200,
      status: "success",
      message: "Products retrieved successfully",
      data: products
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




