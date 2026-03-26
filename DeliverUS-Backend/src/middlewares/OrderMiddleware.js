import { Order, Restaurant, Product } from '../models/models.js'

// TODO: Implement the following function to check if the order belongs to current loggedIn customer (order.userId equals or not to req.user.id)
const checkOrderCustomer = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (!order) {
      return res.status(404).send('Not found')
    }
    if (req.user.id === order.userId) {
      return next()
    } else {
      return res.status(403).send('This entity does not belong to you')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}
// Metodo para comprobar que los productos del pedido están disponibles. Se llama desde el OrderValidation.js
const checkProductsAvailable = async (req, res, next) => {
  try {
    const products = await Product.findByPk(req.body.productsId)
    for (const product of products) {
      if (!product || !product.available) {
        return res.status(400).send(`Product with id ${product.id} is not available`)
      }
    }
    return next()
  } catch (err) {
    return res.status(500).send(err.message)
  }
}
// Metodo para comprobar que los productos del pedido perteneces al mismo restaurante. Se llama desde el OrderValidation.js
const checkProductsSameRestaurant = async (req, res, next) => {
  try {
    const products = await Product.findByPk(req.body.productsId)
    const restaurantId = products[0].restaurantId
    for (const product of products) {
      if (product.restaurantId !== restaurantId) {
        return res.status(400).send(`All products must belong to the same restaurant`)
      }
    }
    return next()
  } catch (err) {
    return res.status(500).send(err.message)
  }
}



// TODO: Implement the following function to check if the restaurant of the order exists
// 
const checkRestaurantExists = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.body.restaurantId)
    if (restaurant === null) {
      return res.status(409).send('The restaurantId does not exist.')
    }
    return next()
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkOrderOwnership = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: {
        model: Restaurant,
        as: 'restaurant'
      }
    })
    if (req.user.id === order.restaurant.userId) {
      return next()
    } else {
      return res.status(403).send('Not enough privileges. This entity does not belong to you')
    }
  } catch (err) {
    return res.status(500).send(err)
  }
}

const checkOrderVisible = (req, res, next) => {
  if (req.user.userType === 'owner') {
    checkOrderOwnership(req, res, next)
  } else if (req.user.userType === 'customer') {
    checkOrderCustomer(req, res, next)
  }
}

const checkOrderIsPending = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    const isPending = !order.startedAt
    if (isPending) {
      return next()
    } else {
      return res.status(409).send('The order has already been started')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkOrderCanBeSent = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    const isShippable = order.startedAt && !order.sentAt
    if (isShippable) {
      return next()
    } else {
      return res.status(409).send('The order cannot be sent')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}
const checkOrderCanBeDelivered = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    const isDeliverable = order.startedAt && order.sentAt && !order.deliveredAt
    if (isDeliverable) {
      return next()
    } else {
      return res.status(409).send('The order cannot be delivered')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export { checkProductsSameRestaurant, checkProductsAvailable, checkOrderOwnership, checkOrderCustomer, checkOrderVisible, checkOrderIsPending, checkOrderCanBeSent, checkOrderCanBeDelivered, checkRestaurantExists }
