// screens/RecipeListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const mainCategories = ["Coffee", "Smoothies", "Juice", "Alcohol"];

const cardGradients = {
  Coffee: ['#8B4513', '#A0522D'],
  Smoothies: ['#FF6B6B', '#FF8E8E'],
  Juice: ['#FFA500', '#FFB74D'],
  Alcohol: ['#6F4E37', '#8B5A2B'],
  default: ['#FFF8F0', '#EADBC8'],
};

const getTextColor = (category) => {
  if (["Coffee", "Smoothies", "Juice", "Alcohol"].includes(category)) {
    return '#fff';
  }
  return '#6F4E37';
};

export default function RecipeListScreen({ route, navigation }) {
  const { category } = route.params;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    try {
      let q;
      if (category === 'Other') {
        // Show recipes whose category is not in the main categories
        q = query(collection(db, 'recipes'));
        const querySnapshot = await getDocs(q);
        const fetchedRecipes = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(recipe => !mainCategories.includes(recipe.category));
        setRecipes(fetchedRecipes);
      } else {
        q = query(collection(db, 'recipes'), where('category', '==', category));
        const querySnapshot = await getDocs(q);
        const fetchedRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecipes(fetchedRecipes);
      }
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const renderItem = ({ item }) => {
    const textColor = getTextColor(item.category);
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={cardGradients[item.category] || cardGradients.default}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
          <View style={styles.ingredientsContainer}>
            <Ionicons name="list-outline" size={16} color={textColor} />
            <Text style={[styles.ingredientsText, { color: textColor }]}>
              {item.ingredients.length} ingredients
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6F4E37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#6F4E37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Recipes</Text>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={60} color="#6F4E37" />
          <Text style={styles.emptyText}>No recipes found</Text>
          <Text style={styles.emptySubtext}>Be the first to add a recipe!</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF8F0',
  },
  backButton: {
    marginRight: 15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFEBD6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  list: {
    padding: 15,
  },
  card: {
    height: 200,
    borderRadius: 20,
    marginBottom: 18,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#6F4E37',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientsText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6F4E37',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});
