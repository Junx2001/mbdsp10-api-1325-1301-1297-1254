const Joi = require('joi');
const db = require('../models');
const Exchange = db.Exchange;
const Proposition = db.Proposition;


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

    if (exchange.status == 'ACCEPTED') return res.status(400).json({
      code: 400,
      status: "fail",
      message: "Exchange already accepted",
      data: null
    });

    exchange.status = 'ACCEPTED';
    await exchange.save();

    // Deactivate all propositions where products involved in the exchange
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

