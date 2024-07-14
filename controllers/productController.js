const Joi = require('joi');
const db = require('../models');
const Product = db.Product;
const Category = db.Category;

// Add a product
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

    const product = await Product.create({ product_name, description, product_image, first_owner_id: req.user.id, actual_owner_id: req.user.id});
    await product.setCategories(categories).then(
        async () => {
          await product.reload({
            include: [{
              model: Category,
              through: { attributes: [] }, // Exclude the join table attributes
            }],
          });
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


// Get all products
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

// Get a product
exports.getProduct = async (req, res) => {
  try {
    // Getting a product with its categories
    const product = await Product.findByPk(req.params.id, {
      include: [{
        model: Category,
        through: { attributes: [] }, // Exclude the join table attributes
      }],
    });
    if (!product) {
      return res.status(404).json({
        code: 404,
        status: "fail",
        message: "Product not found",
        data: null
      });
    }
    res.status(200).json({
      code: 200,
      status: "success",
      message: "Product retrieved successfully",
      data: product
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


// Update a product
exports.updateProduct = async (req, res) => {
  const schema = Joi.object({
    product_name: Joi.string(),
    description: Joi.string().allow(null, ''),
    product_image: Joi.string().allow(null),
    categories: Joi.array().items(Joi.number()), // Assuming category IDs
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
    // Get the product by ID and by the actual owner
    const product = await Product.findOne({ where: { id: req.params.id, actual_owner_id: req.user.id } });
    if (!product) {
      return res.status(404).json({
        code: 404,
        status: "fail",
        message: "Product not found Or You are not the owner of this product",
        data: null
      });
    }
    // Update the product and include the categories
    await product.update({ product_name, description, product_image }).then(
      async () => {
        if (categories && categories.length > 0)
          {
            await product.setCategories(categories).then(
              async () => {
                await product.reload({
                  include: [{
                    model: Category,
                    through: { attributes: [] }, // Exclude the join table attributes
                  }],
                });
                  res.status(200).json({
                      code: 200,
                      status: "success",
                      message: "Product updated successfully With Categories",
                      data: product
                    });
              }
            ); // Assuming categories is an array of category IDs
          }
          else
          {
            await product.reload({
              include: [{
                model: Category,
                through: { attributes: [] }, // Exclude the join table attributes
              }],
            });
            res.status(200).json({
              code: 200,
              status: "success",
              message: "Product updated successfully",
              data: product
            });
          }
      }
    )
   
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: "fail",
      message: err.message,
      data: null
    });
  }
}

// Set a product as non exchangeable
exports.setProductAsNonExchangeable = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id, actual_owner_id: req.user.id } });
    if (!product) {
      return res.status(404).json({
        code: 404,
        status: "fail",
        message: "Product not found",
        data: null
      });
    }
    await product.update({ is_exchangeable: false });
    res.status(200).json({
      code: 200,
      status: "success",
      message: "Product set as non exchangeable",
      data: product
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


//Soft delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id, actual_owner_id: req.user.id } });
    if (!product) {
      return res.status(404).json({
        code: 404,
        status: "fail",
        message: "Product not found",
        data: null
      });
    }
    await product.destroy();
    res.status(200).json({
      code: 200,
      status: "success",
      message: "Product deleted successfully",
      data: null
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




