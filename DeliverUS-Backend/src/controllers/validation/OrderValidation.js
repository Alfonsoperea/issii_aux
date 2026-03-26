import { check } from 'express-validator'
import { Order, Product } from '../../models/models.js'

const checkProductsAvailable = async (value, { req }) => {
  try {
    const products = await Product.findAll({
      where: { id: req.body.products.map(product => product.productId) }
    })
    if (products.length !== req.body.products.length) {
      return Promise.reject(new Error('Some products do not exist.'))
    }
    if (products.some(product => !product.availability)) {
      return Promise.reject(new Error('Some products are not available.'))
    }
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkProductsSameRestaurant = async (value, { req }) => {
  try {
    const products = await Product.findAll({
      where: { id: req.body.products.map(product => product.productId) }
    })
    if (products.length !== req.body.products.length) {
      return Promise.reject(new Error('Some products do not exist.'))
    }
    const restaurantIds = [...new Set(products.map(product => product.restaurantId))]
    if (restaurantIds.length !== 1) {
      return Promise.reject(new Error('All products must belong to the same restaurant.'))
    }
    if (restaurantIds[0] !== req.body.restaurantId) {
      return Promise.reject(new Error('Products do not belong to selected restaurant.'))
    }
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkProductsSameRestaurantAsOrder = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    const products = await Product.findAll({
      where: { id: req.body.products.map(product => product.productId) }
    })
    if (products.length !== req.body.products.length) {
      return Promise.reject(new Error('Some products do not exist.'))
    }
    const restaurantIds = [...new Set(products.map(product => product.restaurantId))]
    if (restaurantIds.length !== 1 || restaurantIds[0] !== order.restaurantId) {
      return Promise.reject(new Error('All products must belong to order restaurant.'))
    }
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant

const create = [
  check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('restaurantId').exists(),
  check('userId').not().exists(),
  check('products').exists().isArray({ min: 1 }),
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
  check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('restaurantId').not().exists(),
  check('userId').not().exists(),
  check('products').exists().isArray({ min: 1 }),
  check('products.*.productId').exists().isInt({ min: 1 }).toInt(),
  check('products.*.quantity').exists().isInt({ min: 1 }).toInt(),
  check('products').custom(checkProductsAvailable),
  check('products').custom(checkProductsSameRestaurantAsOrder)
]

export { create, update }
