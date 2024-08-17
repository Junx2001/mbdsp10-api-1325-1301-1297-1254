const Joi = require('joi');
const db = require('../models/pg_models');
const Exchange = db.Exchange;
const Proposition = db.Proposition;
const Product = db.Product;
const User = db.User;
const { Op } = require('sequelize');
const Transaction = require('../models/mongo_models/transaction');


const exchangeService = require('../services/exchange-service');

exports.createExchange = async (req, res) => {
  const schema = Joi.object({
    owner_products: Joi.array().items(Joi.number()).required(), // Assuming product IDs of owner proposition
    taker_products: Joi.array().items(Joi.number()).required(), // Assuming product IDs of taker proposition
    delivery_address: Joi.string().required(),
    owner_id: Joi.number().required(),
    taker_id: Joi.number().required(),
  });
  try {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({
      code: 400, 
      status: "fail",
      message: error.details[0].message,
      data: null
    });

    // TO DO : Validate if the products in owner_products are really owned by the owner_id
    // Validate if the products in owner_products are really owned by the owner_id
    const ownerProducts = await Product.findAll({
      where: {
        id: { [Op.in]: req.body.owner_products },
        user_id: req.body.owner_id
      }
    });
    if (ownerProducts.length !== req.body.owner_products.length) {
      return res.status(400).json({
        code: 400,
        status: "fail",
        message: "Invalid owner products",
        data: null
      });
    }

    // Validate if the products in taker_products are really owned by the taker_id
    const takerProducts = await Product.findAll({
      where: {
        id: { [Op.in]: req.body.taker_products },
        user_id: req.body.taker_id
      }
    });
    if (takerProducts.length !== req.body.taker_products.length) {
      return res.status(400).json({
        code: 400,
        status: "fail",
        message: "Invalid taker products",
        data: null
      });
    }

    // Validate if the products are available for exchange
    const unavailableProducts = await Product.findAll({
      where: {
        id: {
          [Op.in]: [...req.body.owner_products, ...req.body.taker_products]
        },
        is_exchangeable: false
      }
    });
    if (unavailableProducts.length > 0) {
      return res.status(400).json({
        code: 400,
        status: "fail",
        message: "Some products are not available for exchange",
        data: null
      });
    }

    // Validate if the owner and taker are different users
    if (req.body.owner_id === req.body.taker_id) {
      return res.status(400).json({
        code: 400,
        status: "fail",
        message: "Owner and taker cannot be the same user",
        data: null
      });
    }


    // Create owner proposition
    const ownerProposition = await Proposition.create({ user_id: req.body.owner_id, is_active: true });
    await ownerProposition.setProducts(req.body.owner_products);

    // Create taker proposition
    const takerProposition = await Proposition.create({ user_id: req.body.taker_id, is_active: true });
    await takerProposition.setProducts(req.body.taker_products);

    // Create exchange
    const exchange = await Exchange.create({
      owner_proposition_id: ownerProposition.id,
      taker_proposition_id: takerProposition.id,
      delivery_address: req.body.delivery_address,
      status : 'CREATED'
    });
   
    res.status(201).json({
      code: 201,
      status: "success",
      message: "Exchange created successfully",
      data: exchange
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

exports.acceptExchange = async (req, res) => {
  try {
    const exchange = await Exchange.findByPk(req.params.id);
    if (!exchange) return res.status(404).json({
      code: 404,
      status: "fail",
      message: "Exchange not found",
      data: null
    });

    if (exchange.status !='CREATED') return res.status(400).json({
      code: 400,
      status: "fail",
      message: "Invalid Exchange Accept Request",
      data: null
    });


    // TO DO : Generate a QR code for the process of reception of exchange

    await exchangeService.acceptExchangeUpdates(exchange);

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Exchange accepted successfully",
      data: exchange

    });


  } catch (err) {
    res.status(500).json({
      code: 500,
      status: "fail",
      message: err.message,
      data: null
    });
  }
}

exports.cancelExchange = async (req, res) => {
  try {
    const exchange = await Exchange.findByPk(req.params.id);
    if (!exchange) return res.status(404).json({
      code: 404,
      status: "fail",
      message: "Exchange not found",
      data: null
    });

    if (exchange.status == 'CANCELLED') return res.status(400).json({
      code: 400,
      status: "fail",
      message: "Exchange already cancelled",
      data: null
    });

    exchange.status = 'CANCELLED';
     
    await exchange.save().then(() => {
      res.status(200).json({
        code: 200,
        status: "success",
        message: "Exchange cancelled successfully",
        data: exchange
      });
    });

  } catch (err) {
    res.status(500).json({
      code: 500,
      status: "fail",
      message: err.message,
      data: null
    });
  }
}

exports.receiveExchange = async (req, res) => {
  const schema = Joi.object({
    accept: Joi.boolean().required(),
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
  });
  try {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({
      code: 400, 
      status: "fail",
      message: error.details[0].message,
      data: null
    });

    const exchange = await Exchange.findByPk(req.params.id);
    if (!exchange) return res.status(404).json({
      code: 404,
      status: "fail",
      message: "Exchange not found",
      data: null
    });

    if (exchange.status != 'ACCEPTED') return res.status(400).json({
      code: 400,
      status: "fail",
      message: "Invalid Reception Request",
      data: null
    });

    if (req.body.accept == false) {
      return res.status(400).json({
        code: 400,
        status: "success",
        message: "You have refused the exchange reception, but in real life, you should have accepted it 🥲",
        data: exchange
      });

    }

    exchange.status = 'RECEIVED';
    await exchange.save();

    // Temporary : create the transaction in Mongo DB with the status RECEIVED 
    const transaction = new Transaction({
      exchange_id: exchange.id,
      owner_id: exchange.owner_proposition_id,
      taker_id: exchange.taker_proposition_id,
      longitude: req.body.longitude,
      latitude: req.body.latitude,
      status: 'RECEIVED'
    });
    await transaction.save();
      
    res.status(200).json({
      code: 200,
      status: "success",
      message: "Exchange received successfully",
      data: exchange
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: "fail",
      message: err.message,
      data: null
    });
  }
 
}

exports.getExchangeDetail = async (req, res) => {
  try {
    const exchange = await Exchange.findByPk(req.params.id, {
      attributes: { exclude: ['owner_proposition_id', 'taker_proposition_id'] },
      include: [
        { model: Proposition, as: 'owner_proposition', include: [{
          model: Product,
          through: { attributes: [] }, // Exclude the join table attributes
          include: [
            { model: User, as: 'actual_owner', attributes: ['username', 'email', 'address'] }, // Assuming 'actual_owner' is the association name
            { model: User, as: 'first_owner', attributes: ['username', 'email', 'address']  }  // Assuming 'first_owner' is the association name
          ]
        }, { model: User, as: 'user', attributes: ['username', 'email'] }, ] },
        { model: Proposition, as: 'taker_proposition', include: [{
          model: Product,
          through: { attributes: [] }, // Exclude the join table attributes
          include: [
            { model: User, as: 'actual_owner', attributes: ['username', 'email', 'address']  }, // Assuming 'actual_owner' is the association name
            { model: User, as: 'first_owner', attributes: ['username', 'email', 'address']  }  // Assuming 'first_owner' is the association name
          ]
        }, { model: User, as: 'user', attributes: ['username', 'email'] }]},
      ]
    });
    if (!exchange) return res.status(404).json({
      code: 404,
      status: "fail",
      message: "Exchange not found",
      data: null
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Exchange detail retrieved successfully",
      data: exchange
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: "fail",
      message: err.message,
      data: null
    });
  }
}

exports.getAllMyExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.findAll({
      //where: { [Op.or]: [{ owner_proposition_id: req.user.id }, { taker_proposition_id: req.user.id }] },
      include: [
        { model: Proposition, as: 'owner_proposition', include: [{
          model: Product,
          through: { attributes: [] }, // Exclude the join table attributes
          include: [
            { model: User, as: 'actual_owner', attributes: ['username', 'email', 'address'] }, // Assuming 'actual_owner' is the association name
            { model: User, as: 'first_owner', attributes: ['username', 'email', 'address']  }  // Assuming 'first_owner' is the association name
          ]
        }, { model: User, as: 'user', attributes: ['username', 'email'] }, ] },
        { model: Proposition, as: 'taker_proposition', include: [{
          model: Product,
          through: { attributes: [] }, // Exclude the join table attributes
          include: [
            { model: User, as: 'actual_owner', attributes: ['username', 'email', 'address']  }, // Assuming 'actual_owner' is the association name
            { model: User, as: 'first_owner', attributes: ['username', 'email', 'address']  }  // Assuming 'first_owner' is the association name
          ]
        }, { model: User, as: 'user', attributes: ['username', 'email'] }]},
      ]
    });

    // Filter exchanges based on user involvement
    // Assuming `exchanges` is an array of Sequelize instances returned from a query
      const filteredExchanges = exchanges.map(exchange => {
        // Convert Sequelize instance to plain object
        const exchangeObj = exchange.get({ plain: true });
        let userExchangeRole = '';
        if (exchange.owner_proposition.user_id === req.user.id) {
          userExchangeRole = 'OWNER';
        } else if (exchange.taker_proposition.user_id === req.user.id) {
          userExchangeRole = 'TAKER';
        }
        // Only include exchanges where the user is involved
        if (userExchangeRole !== '') {
          return {
            ...exchangeObj,
            matchType: userExchangeRole
          };
        } else {
          return null;
        }
      }).filter(exchange => exchange !== null);

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Exchanges retrieved successfully",
      data: filteredExchanges
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: "fail",
      message: err.message,
      data: null
    });
  }
}