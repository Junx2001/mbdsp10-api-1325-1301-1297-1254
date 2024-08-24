
const db = require('../models/pg_models');
const { Exchange, Proposition, Product, PropositionProduct } = db;
const { Op } = require('sequelize');



const acceptExchangeUpdates = async (exchange) => {
    exchange.status = 'ACCEPTED';
    await exchange.save();

    // Reload the exchange to get all the propositions with the products
    await exchange.reload({
        include: [
          { model: Proposition, as: 'owner_proposition', include: [Product] },
          { model: Proposition, as: 'taker_proposition', include: [Product] }
        ]
      }).then(async () => {
        // Get all the products involved in the exchange;
        const ownerProducts = exchange.owner_proposition.Products;
        const takerProducts = exchange.taker_proposition.Products;

        // Update all actual_owner_id of the products involved in the exchange
        await Product.update({ actual_owner_id: exchange.taker_proposition.user_id }, {
          where: { id: { [Op.in]: ownerProducts.map(product => product.id) } }
        });
        await Product.update({ actual_owner_id: exchange.owner_proposition.user_id }, {
            where: { id: { [Op.in]: takerProducts.map(product => product.id) } }
        });

      // Deactivate all propositions where products involved in the exchange
      await Proposition.update(
        { is_active: false },
        {
          where: {
            id: {
              [Op.in]: Sequelize.literal(`(
                SELECT DISTINCT "idProposition"
                FROM "PropositionProducts"
                WHERE "idProduct" IN (${ownerProducts.map(product => product.id).join(', ')})
              )`),
            },
            id: {
              [Op.ne]: exchange.owner_proposition.id,
            },
          },
        }
      );

       // Deactivate all propositions where products involved in the exchange
       await Proposition.update(
        { is_active: false },
        {
          where: {
            id: {
              [Op.in]: Sequelize.literal(`(
                SELECT DISTINCT "idProposition"
                FROM "PropositionProducts"
                WHERE "idProduct" IN (${takerProducts.map(product => product.id).join(', ')})
              )`),
            },
            id: {
              [Op.ne]: exchange.taker_proposition_id.id,
            },
          },
        }
      );
  

      const updatedPropositions = await Proposition.findAll({
        include: [{
          model: PropositionProduct,
          where: {
            idProduct: {
              [Op.in]: [...ownerProducts.map(product => product.id), ...takerProducts.map(product => product.id)]
            }
          },
          include: [Product]
        }]
      });
  
        // Block all exchanges involving propositions with the products involved in the exchange
        await Exchange.update({ status: 'BLOCKED' }, {
          where: {
            id: { [Op.ne]: exchange.id },
            status: 'CREATED',
            [Op.or]: [
              { owner_proposition_id: { [Op.in]: updatedPropositions.map(proposition => proposition.id) } },
              { taker_proposition_id: { [Op.in]: updatedPropositions.map(proposition => proposition.id) } }
            ]
          }
        });
      });

}



module.exports = {
    acceptExchangeUpdates
};