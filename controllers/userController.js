const Joi = require('joi');
const db = require('../models/pg_models');

const Rating = require('../models/mongo_models/ratings');


exports.rateUser = async (req, res) => {
    const schema = Joi.object({
        concerned_user_id: Joi.number().required(),
        review: Joi.string().required(),
        rating: Joi.number().required(),
    });
    try {
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({
        code: 400, 
        status: "fail",
        message: error.details[0].message,
        data: null
        });

        // Verify if the concerned user exists
        const user = await db.User.findByPk(req.body.concerned_user_id);
        if (!user) {
            return res.status(404).json({
            code: 404,
            status: "fail",
            message: "User To Rate does not exist",
            data: null
            });
        }
    
        const rating = await Rating.create({
            userId: req.user.id,
            concerned_user_id: req.body.concerned_user_id,
            review: req.body.review,
            rating: req.body.rating
        });
        res.status(201).json({
        code: 201,
        status: "success",
        message: "Rating created successfully",
        data: rating
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



