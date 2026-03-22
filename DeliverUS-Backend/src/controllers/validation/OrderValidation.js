import { check } from 'express-validator'
import { checkRestaurantExists, checkProductsAvailable, checkProductsSameRestaurant } from '../../middlewares/OrderMiddleware.js'
import { Product } from '../../models/models.js'

// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant

const create = [
    check('createdAt').exists().isDate().toDate(),
    check('startedAt').optional({ nullable: true }).toDate(),
    check('sentAt').optional({ nullable: true }).toDate(),
    check('deliveredAt').optional({ nullable: true }).toDate(),
    check('price').exists().isFloat({ min: 0 }).toFloat(),
    check('address').exists().isString().isLength({ min: 1 }).trim(),
    check('shippingCosts').exists().isFloat({ min: 0 }).toFloat(),
    check('restaurantId').exists().isInt({ min: 1 }).toInt(),
    check('restaurantId').custom(checkRestaurantExists),
    check('userId').not().exists(),
    check('products').isArray({ min: 1 }),
    check('products.*.productId').exists().isInt({ min: 1 }).toInt(),
    check('products.*.quantity').exists().isInt({ min: 1 }).toInt(), 
    check('products').custom(checkProductsAvailable),
    check('products').custom(checkProductsSameRestaurant)
]
// TODO: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.
const update = [
    check('createdAt').exists().isDate().toDate(),
    check('startedAt').optional({ nullable: true }).toDate(),
    check('sentAt').optional({ nullable: true }).toDate(),
    check('deliveredAt').optional({ nullable: true }).toDate(),
    check('price').exists().isFloat({ min: 0 }).toFloat(),
    check('address').exists().isString().isLength({ min: 1 }).trim(),
    check('shippingCosts').exists().isFloat({ min: 0 }).toFloat(),
    check('restaurantId').not().exists(),
    check('userId').not().exists(),
    check('products').isArray({ min: 1 }),
    check('products.*.productId').exists().isInt({ min: 1 }).toInt(),
    check('products.*.quantity').exists().isInt({ min: 1 }).toInt(), 
    check('products').custom(checkProductsAvailable),
    check('products').custom(checkProductsSameRestaurant)
]

export { create, update }
