<<<<<<< HEAD
import { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { API_BASE_URL } from '@env'
import { getAll } from '../../api/RestaurantEndpoints'
import { getPopularProducts } from '../../api/ProductEndpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemiBold'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles' //Imported globally to practise a different import style unlike that of RestaurantDetailScreen

export default function RestaurantsScreen({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    fetchRestaurants()
    fetchPopularProducts()
  }, [route])

  const fetchRestaurants = async () => {
    try {
      const fetchedRestaurants = await getAll()
      setRestaurants(fetchedRestaurants)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurants. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const fetchPopularProducts = async () => {
    try {
      const fetchedTopProducts = await getPopularProducts()
      setTopProducts(fetchedTopProducts)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving top products. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.logo ? { uri: `${API_BASE_URL}/${item.logo}` } : undefined}
        title={item.name}
        onPress={() => navigation.navigate('RestaurantDetailScreen', { id: item.id })}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold>
          Shipping:{' '}
          <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
            {item.shippingCosts.toFixed(2)}€
          </TextSemiBold>
        </TextSemiBold>
      </ImageCard>
    )
  }

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TextSemiBold textStyle={styles.sectionTitle}>
          Top 3 best-selling products
        </TextSemiBold>
        {topProducts.length === 0
          ? (
          <TextRegular textStyle={styles.emptyTop}>
            Top products are currently unavailable.
          </TextRegular>
            )
          : (
              topProducts.map(product => (
            <ImageCard
              key={product.id}
              imageUri={
                product.image
                  ? { uri: `${API_BASE_URL}/${product.image}` }
                  : undefined
              }
              title={product.name}
            >
              <TextSemiBold>
                {(product.soldProductCount ?? 0).toString()} sold
              </TextSemiBold>
              <TextRegular>{Number(product.price).toFixed(2)}€</TextRegular>
            </ImageCard>
              ))
            )}
      </View>
    )
  }

  const renderEmptyRestaurantsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        There are no restaurants available right now.
      </TextRegular>
    )
  }

  return (
    <FlatList
      style={styles.container}
      data={restaurants}
      renderItem={renderRestaurant}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyRestaurantsList}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 16
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8
  },
  emptyTop: {
    marginBottom: 12
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
=======
import { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { API_BASE_URL } from '@env'
import { getAll } from '../../api/RestaurantEndpoints'
import { getPopularProducts } from '../../api/ProductEndpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemiBold'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles' //Imported globally to practise a different import style unlike that of RestaurantDetailScreen

export default function RestaurantsScreen({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    fetchRestaurants()
    fetchPopularProducts()
  }, [route])

  const fetchRestaurants = async () => {
    try {
      const fetchedRestaurants = await getAll()
      setRestaurants(fetchedRestaurants)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurants. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const fetchPopularProducts = async () => {
    try {
      const fetchedTopProducts = await getPopularProducts()
      setTopProducts(fetchedTopProducts)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving top products. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.logo ? { uri: `${API_BASE_URL}/${item.logo}` } : undefined}
        title={item.name}
        onPress={() => navigation.navigate('RestaurantDetailScreen', { id: item.id })}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold>
          Shipping:{' '}
          <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
            {item.shippingCosts.toFixed(2)}€
          </TextSemiBold>
        </TextSemiBold>
      </ImageCard>
    )
  }

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TextSemiBold textStyle={styles.sectionTitle}>
          Top 3 best-selling products
        </TextSemiBold>
        {topProducts.length === 0
          ? (
          <TextRegular textStyle={styles.emptyTop}>
            Top products are currently unavailable.
          </TextRegular>
            )
          : (
              topProducts.map(product => (
            <View key={product.id} style={styles.topProductRow}>
              <TextRegular numberOfLines={1} textStyle={styles.topProductName}>
                {product.name}
              </TextRegular>
              <TextSemiBold>
                {(product.soldProductCount ?? 0).toString()} sold
              </TextSemiBold>
            </View>
              ))
            )}
      </View>
    )
  }

  const renderEmptyRestaurantsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        There are no restaurants available right now.
      </TextRegular>
    )
  }

  return (
    <FlatList
      style={styles.container}
      data={restaurants}
      renderItem={renderRestaurant}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyRestaurantsList}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 16
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8
  },
  topProductRow: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  topProductName: {
    flex: 1,
    marginRight: 8
  },
  emptyTop: {
    marginBottom: 12
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
>>>>>>> f3499f71abd54759f0dfaa398606687787e1cf4b
