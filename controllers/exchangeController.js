const Joi = require('joi');
const db = require('../models/pg_models');
const Exchange = db.Exchange;
const Proposition = db.Proposition;
const Product = db.Product;
const User = db.User;
const { Op } = require('sequelize');


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

    if (exchange.status !='CREATED' || exchange.status == 'ACCEPTED') return res.status(400).json({
      code: 400,
      status: "fail",
      message: "Invalid Exchange Accept Request",
      data: null
    });

    exchange.status = 'ACCEPTED';
    await exchange.save();
    // TO DO : Creating a new Transation for the exchange (Mongo DB)

    // TO DO : Generate a QR code for the process of reception of exchange

    // Deactivate all propositions where products involved in the exchange (Need improvements)
    await Proposition.update({ is_active: false }, {
      where: { id: [exchange.owner_proposition_id, exchange.taker_proposition_id] }
    }).then(() => {
      res.status(200).json({
        code: 200,
        status: "success",
        message: "Exchange accepted successfully",
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
       // TO DO : Update the transaction status to CANCELLED
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
    accept: Joi.boolean().required()
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

    if (exchange.status == 'RECEIVED' || exchange.status != 'ACCEPTED' || exchange.status == 'CANCELLED') return res.status(400).json({
      code: 400,
      status: "fail",
      message: "Invalid Reception Request",
      data: null
    });

    if (req.body.accept == false) {
      exchange.status = 'CANCELLED';
      await exchange.save();

      // TO DO : Update the transaction status to CANCELLED

      // TO DO : Update all propositions where products involved in the exchange to Active

      return res.status(200).json({
        code: 200,
        status: "success",
        message: "Exchange Cancelled successfully",
        data: exchange
      });
    }
 

    exchange.status = 'RECEIVED';
    await exchange.save();
    // TODO : Update the transaction status to RECEIVED
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
        }] },
        { model: Proposition, as: 'taker_proposition', include: [{
          model: Product,
          through: { attributes: [] }, // Exclude the join table attributes
        }]}
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
      where: { [Op.or]: [{ owner_proposition_id: req.user.id }, { taker_proposition_id: req.user.id }] },
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

     // Iterate over results to add a custom field
     const enhancedExchanges = exchanges.map(result => ({
      ...result.toJSON(), // Convert Sequelize instance to plain object
      matchType: result.owner_proposition_id === req.user.id ? 'OWNER' : 'TAKER'
    }));

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Exchanges retrieved successfully",
      data: enhancedExchanges
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