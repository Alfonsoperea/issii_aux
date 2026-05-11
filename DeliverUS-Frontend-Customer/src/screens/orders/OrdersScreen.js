<<<<<<< HEAD
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, FlatList, Pressable, View } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getUserOrders, remove as removeOrder } from '../../api/OrderEndpoints'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import DeleteModal from '../../components/DeleteModal'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import * as GlobalStyles from '../../styles/GlobalStyles'

export default function OrdersScreen({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)
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
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const deleteOrder = async order => {
    try {
      await removeOrder(order.id)
      setOrderToBeDeleted(null)
      await fetchOrders()
      showMessage({
        message: `Order #${order.id} was deleted successfully.`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order #${order.id} could not be deleted. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const editOrder = order => {
    if (order.status !== 'pending') {
      showMessage({
        message: 'Only pending orders can be edited.',
        type: 'warning',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      return
    }
    navigation.navigate('OrderDetailScreen', { id: order.id, editable: true })
  }

  const renderOrder = ({ item }) => {
    return (
      <View style={styles.card}>
        <TextSemiBold>{item.restaurant?.name ?? 'Restaurant'}</TextSemiBold>
        <TextRegular>
          Created at: {new Date(item.createdAt).toLocaleString()}
        </TextRegular>
        <TextRegular>Status: {item.status}</TextRegular>
        <TextSemiBold textStyle={styles.price}>
          Total: {Number(item.price).toFixed(2)}€
        </TextSemiBold>

        <View style={styles.actionButtonsContainer}>
          <Pressable
            onPress={() => editOrder(item)}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue
              },
              styles.actionButton
            ]}
          >
            <View style={styles.actionButtonContent}>
              <MaterialCommunityIcons name="pencil" color={'white'} size={20} />
              <TextRegular textStyle={styles.buttonText}>Edit</TextRegular>
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              if (item.status !== 'pending') {
                showMessage({
                  message: 'Only pending orders can be deleted.',
                  type: 'warning',
                  style: GlobalStyles.flashStyle,
                  titleStyle: GlobalStyles.flashTextStyle
                })
                return
              }
              setOrderToBeDeleted(item)
            }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimaryTap
                  : GlobalStyles.brandPrimary
              },
              styles.actionButton
            ]}
          >
            <View style={styles.actionButtonContent}>
              <MaterialCommunityIcons name="delete" color={'white'} size={20} />
              <TextRegular textStyle={styles.buttonText}>Delete</TextRegular>
            </View>
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.navigate('OrderDetailScreen', { id: item.id })}
        >
          <TextRegular textStyle={styles.detailsLink}>Open details</TextRegular>
        </Pressable>
      </View>
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
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyOrdersList}
      />
      <DeleteModal
        isVisible={orderToBeDeleted !== null}
        onCancel={() => setOrderToBeDeleted(null)}
        onConfirm={() => deleteOrder(orderToBeDeleted)}
      >
        <TextRegular>Only pending orders can be deleted.</TextRegular>
      </DeleteModal>
    </>
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
    padding: 12,
    backgroundColor: 'white'
  },
  price: {
    marginTop: 4
  },
  emptyList: {
    textAlign: 'center',
    padding: 24
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginRight: 8,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    justifyContent: 'center'
  },
  actionButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  detailsLink: {
    marginTop: 10,
    color: GlobalStyles.brandBlue
  }
})
=======
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
>>>>>>> f3499f71abd54759f0dfaa398606687787e1cf4b
