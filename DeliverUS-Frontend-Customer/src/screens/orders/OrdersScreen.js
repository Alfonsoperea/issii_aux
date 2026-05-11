import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, FlatList, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getUserOrders } from '../../api/OrderEndpoints'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { flashStyle, flashTextStyle } from '../../styles/GlobalStyles'

export default function OrdersScreen({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders([])
    }
  }, [loggedInUser, route])

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getUserOrders()
      setOrders(fetchedOrders)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving your orders. ${error}`,
        type: 'error',
        style: flashStyle,
        titleStyle: flashTextStyle
      })
    }
  }

  const renderOrder = ({ item }) => {
    return (
      <Pressable
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id })
        }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: pressed ? '#f5eaea' : 'white'
          }
        ]}
      >
        <TextSemiBold>{item.restaurant?.name ?? 'Restaurant'}</TextSemiBold>
        <TextRegular>
          Created at: {new Date(item.createdAt).toLocaleString()}
        </TextRegular>
        <TextRegular>Status: {item.status}</TextRegular>
        <TextSemiBold textStyle={styles.price}>
          Total: {Number(item.price).toFixed(2)}€
        </TextSemiBold>
      </Pressable>
    )
  }

  const renderEmptyOrdersList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        {loggedInUser
          ? 'You do not have confirmed orders yet.'
          : 'Log in to see your orders.'}
      </TextRegular>
    )
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={orders}
      renderItem={renderOrder}
      keyExtractor={item => item.id.toString()}
      ListEmptyComponent={renderEmptyOrdersList}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentContainer: {
    padding: 12
  },
  card: {
    borderRadius: 8,
    marginBottom: 10,
    padding: 12
  },
  price: {
    marginTop: 4
  },
  emptyList: {
    textAlign: 'center',
    padding: 24
  }
})
