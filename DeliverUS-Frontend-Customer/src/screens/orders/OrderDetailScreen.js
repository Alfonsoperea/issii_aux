import { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { API_BASE_URL } from '@env'
import { getDetail } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import * as GlobalStyles from '../../styles/GlobalStyles'

export default function OrderDetailScreen({ route }) {
  const [order, setOrder] = useState(null)

  useEffect(() => {
    fetchOrder()
  }, [route])

  const fetchOrder = async () => {
    try {
      const fetchedOrder = await getDetail(route.params.id)
      setOrder(fetchedOrder)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving the order details. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderHeader = () => {
    if (!order) {
      return null
    }
    return (
      <View style={styles.header}>
        <TextSemiBold textStyle={styles.title}>Order #{order.id}</TextSemiBold>
        <TextRegular>Restaurant: {order.restaurant?.name ?? '-'}</TextRegular>
        <TextRegular>Address: {order.address}</TextRegular>
        <TextRegular>Status: {order.status}</TextRegular>
        <TextRegular>
          Date: {new Date(order.createdAt).toLocaleString()}
        </TextRegular>
        <TextRegular>
          Shipping costs: {Number(order.shippingCosts).toFixed(2)}€
        </TextRegular>
        <TextSemiBold>Total: {Number(order.price).toFixed(2)}€</TextSemiBold>
      </View>
    )
  }

  const renderProduct = ({ item }) => {
    const quantity = item.OrderProducts?.quantity ?? 0
    const unityPrice = Number(item.OrderProducts?.unityPrice ?? item.price)
    return (
      <ImageCard
        imageUri={item.image ? { uri: `${API_BASE_URL}/${item.image}` } : undefined}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextRegular>
          {quantity} x {unityPrice.toFixed(2)}€
        </TextRegular>
        <TextSemiBold>Subtotal: {(unityPrice * quantity).toFixed(2)}€</TextSemiBold>
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This order has no products.
      </TextRegular>
    )
  }

  return (
    <FlatList
      style={styles.container}
      data={order?.products ?? []}
      renderItem={renderProduct}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyProductsList}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    margin: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12
  },
  title: {
    fontSize: 16,
    marginBottom: 6
  },
  emptyList: {
    textAlign: 'center',
    padding: 24
  }
})
