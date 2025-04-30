import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const cardGradients = {
  Coffee: ['#8B4513', '#A0522D'],
  Smoothies: ['#FF6B6B', '#FF8E8E'],
  Juice: ['#FFA500', '#FFB74D'],
  Alcohol: ['#6F4E37', '#8B5A2B'],
  default: ['#FFF8F0', '#EADBC8'],
};

export default function MyRecipesScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const fetchMyRecipes = async () => {
    try {
      const q = query(
        collection(db, 'recipes'),
        where('createdBy', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const recipesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecipes(recipesList);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTextColor = (category) => {
    if (["Coffee", "Smoothies", "Juice", "Alcohol"].includes(category)) {
      return '#fff';
    }
    return '#6F4E37';
  };

  const renderRecipeItem = ({ item }) => {
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
          <Text style={[styles.recipeTitle, { color: textColor }]}>{item.title}</Text>
          <View style={styles.recipeMeta}>
            <View style={styles.categoryBadge}>
              <Text style={[styles.categoryText, { color: textColor }]}>{item.category}</Text>
            </View>
            <View style={styles.ingredientsCount}>
              <Ionicons name="list-outline" size={16} color={textColor} />
              <Text style={[styles.ingredientsText, { color: textColor }]}>
                {item.ingredients.length} ingredients
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6F4E37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Recipes</Text>
        <Text style={styles.headerSubtitle}>Your culinary creations</Text>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={60} color="#6F4E37" />
          <Text style={styles.emptyText}>No recipes yet</Text>
          <Text style={styles.emptySubtext}>Start creating your first recipe!</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddRecipe')}
          >
            <LinearGradient
              colors={['#6F4E37', '#8B5A2B']}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Recipe</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF8F0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6F4E37',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  list: {
    padding: 15,
  },
  card: {
    height: 180,
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
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  ingredientsCount: {
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
    marginBottom: 30,
  },
  addButton: {
    width: '80%',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
}); 