
const db = require('../models/pg_models');
const Category = db.Category;


const checkCategoriesExists = async (category_ids) => {
    if (!category_ids || category_ids.length === 0) {
        return false;
    }
    const categories = await Category.findAll({
       // Using where id in category_ids
        where: {
            id: category_ids
        }
    });
    if (categories.length !== category_ids.length) {
        return false;
    }

    return true;
}

module.exports = {
    checkCategoriesExists
};