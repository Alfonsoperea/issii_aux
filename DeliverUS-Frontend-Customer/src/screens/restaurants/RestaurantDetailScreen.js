import { useContext, useEffect, useMemo, useState } from 'react'
import {
  StyleSheet,
  View,
  FlatList,
  ImageBackground,
  Image,
  Pressable,
  TextInput
} from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import { createOrder } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { API_BASE_URL } from '@env'
import { AuthorizationContext } from '../../context/AuthorizationContext'

export default function RestaurantDetailScreen({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const [cartProducts, setCartProducts] = useState([])
  const [address, setAddress] = useState('')
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    if (loggedInUser?.address) {
      setAddress(loggedInUser.address)
    }
  }, [loggedInUser])

  useEffect(() => {
    fetchRestaurantDetail()
  }, [route])

  const renderHeader = () => {
    return (
      <View>
        <ImageBackground
          source={
            restaurant?.heroImage
              ? {
                  uri: API_BASE_URL + '/' + restaurant.heroImage,
                  cache: 'force-cache'
                }
              : undefined
          }
          style={styles.imageBackground}
        >
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>
              {restaurant.name}
            </TextSemiBold>
            <Image
              style={styles.image}
              source={
                restaurant.logo
                  ? {
                      uri: API_BASE_URL + '/' + restaurant.logo,
                      cache: 'force-cache'
                    }
                  : undefined
              }
            />
            <TextRegular textStyle={styles.description}>
              {restaurant.description}
            </TextRegular>
            <TextRegular textStyle={styles.description}>
              {restaurant.restaurantCategory
                ? restaurant.restaurantCategory.name
                : ''}
            </TextRegular>
          </View>
        </ImageBackground>
      </View>
    )
  }

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={
          item.image ? { uri: API_BASE_URL + '/' + item.image } : undefined
        }
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>
          {item.price.toFixed(2)}€
        </TextSemiBold>
        {!item.availability && (
          <TextRegular textStyle={styles.availability}>
            Not available
          </TextRegular>
        )}
        {item.availability && (
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandGreenTap
                  : GlobalStyles.brandGreen
              }
            ]}
            onPress={() => addProductToCart(item)}
          >
            <TextRegular textStyle={styles.buttonText}>Add to cart</TextRegular>
          </Pressable>
        )}
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  const fetchRestaurantDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      setRestaurant(fetchedRestaurant)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const addProductToCart = product => {
    setCartProducts(prev => {
      const existingLine = prev.find(line => line.product.id === product.id)
      if (!existingLine) {
        return [...prev, { product, quantity: 1 }]
      }
      return prev.map(line =>
        line.product.id === product.id
          ? { ...line, quantity: line.quantity + 1 }
          : line
      )
    })
  }

  const updateCartQuantity = (productId, delta) => {
    setCartProducts(prev =>
      prev
        .map(line =>
          line.product.id === productId
            ? { ...line, quantity: line.quantity + delta }
            : line
        )
        .filter(line => line.quantity > 0)
    )
  }

  const clearCart = () => {
    setCartProducts([])
  }

  const productsPrice = useMemo(
    () =>
      cartProducts.reduce(
        (acc, line) => acc + line.quantity * Number(line.product.price),
        0
      ),
    [cartProducts]
  )

  const shippingCosts = useMemo(() => {
    return productsPrice > 10 ? 0 : Number(restaurant.shippingCosts ?? 0)
  }, [productsPrice, restaurant.shippingCosts])

  const orderTotal = useMemo(
    () => productsPrice + shippingCosts,
    [productsPrice, shippingCosts]
  )

  const confirmOrder = async () => {
    if (!loggedInUser) {
      showMessage({
        message: 'You need to be logged in to place an order.',
        type: 'warning',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      return
    }
    if (cartProducts.length === 0) {
      showMessage({
        message: 'Add at least one product before confirming the order.',
        type: 'warning',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      return
    }
    if (!address.trim()) {
      showMessage({
        message: 'Delivery address is required.',
        type: 'warning',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      return
    }

    const orderData = {
      createdAt: new Date(),
      price: Number(orderTotal.toFixed(2)),
      address: address.trim(),
      shippingCosts: Number(shippingCosts.toFixed(2)),
      restaurantId: route.params.id,
      products: cartProducts.map(line => ({
        productId: line.product.id,
        quantity: line.quantity
      }))
    }

    try {
      await createOrder(orderData)
      showMessage({
        message: 'Order placed successfully.',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      clearCart()
      navigation.navigate('My Orders')
    } catch (error) {
      showMessage({
        message: `There was an error while creating the order. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderCartLine = line => {
    return (
      <View key={line.product.id} style={styles.cartLine}>
        <TextRegular textStyle={styles.cartLineTitle} numberOfLines={1}>
          {line.product.name}
        </TextRegular>
        <View style={styles.quantityActions}>
          <Pressable
            style={styles.quantityButton}
            onPress={() => updateCartQuantity(line.product.id, -1)}
          >
            <TextSemiBold>-</TextSemiBold>
          </Pressable>
          <TextSemiBold textStyle={styles.quantityValue}>
            {line.quantity}
          </TextSemiBold>
          <Pressable
            style={styles.quantityButton}
            onPress={() => updateCartQuantity(line.product.id, 1)}
          >
            <TextSemiBold>+</TextSemiBold>
          </Pressable>
        </View>
      </View>
    )
  }

  const renderCartFooter = () => {
    return (
      <View style={styles.cartContainer}>
        <TextSemiBold textStyle={styles.cartTitle}>Your new order</TextSemiBold>
        {cartProducts.length === 0
          ? (
          <TextRegular>Your cart is empty.</TextRegular>
            )
          : (
              cartProducts.map(renderCartLine)
            )}
        <TextRegular textStyle={styles.addressLabel}>Delivery address</TextRegular>
        <TextInput
          value={address}
          onChangeText={setAddress}
          style={styles.addressInput}
          placeholder="Address"
        />
        <TextRegular>Products: {productsPrice.toFixed(2)}€</TextRegular>
        <TextRegular>Shipping: {shippingCosts.toFixed(2)}€</TextRegular>
        <TextSemiBold>Total: {orderTotal.toFixed(2)}€</TextSemiBold>

        <View style={styles.cartButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.cartButton,
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue
              }
            ]}
            onPress={clearCart}
          >
            <TextRegular textStyle={styles.buttonText}>Dismiss order</TextRegular>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.cartButton,
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimaryTap
                  : GlobalStyles.brandPrimary
              }
            ]}
            onPress={confirmOrder}
          >
            <TextRegular textStyle={styles.buttonText}>Confirm order</TextRegular>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyProductsList}
      ListFooterComponent={renderCartFooter}
      style={styles.container}
      data={restaurant.products}
      renderItem={renderProduct}
      keyExtractor={item => item.id.toString()}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: GlobalStyles.brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: GlobalStyles.brandSecondary
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  addButton: {
    borderRadius: 8,
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start'
  },
  buttonText: {
    color: 'white'
  },
  cartContainer: {
    margin: 12,
    marginBottom: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'white'
  },
  cartTitle: {
    fontSize: 16,
    marginBottom: 8
  },
  cartLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cartLineTitle: {
    flex: 1,
    marginRight: 8
  },
  quantityActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityButton: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c8c8c8',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityValue: {
    marginHorizontal: 8
  },
  addressLabel: {
    marginTop: 10
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#c8c8c8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 10
  },
  cartButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  cartButton: {
    borderRadius: 8,
    paddingVertical: 10,
    width: '48%',
    alignItems: 'center'
  }
})
