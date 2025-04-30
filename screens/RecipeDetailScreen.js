import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { db, auth } from '../services/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserRecipe, setIsUserRecipe] = useState(false);
  const [creatorName, setCreatorName] = useState('');

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  const fetchRecipe = async () => {
    try {
      if (!recipeId) {
        throw new Error('Recipe ID is required');
      }

      const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
      
      if (!recipeDoc.exists()) {
        throw new Error('Recipe not found');
      }

      const recipeData = recipeDoc.data();
      
      if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
        throw new Error('Recipe data is incomplete');
      }

      setRecipe(recipeData);
      setIsUserRecipe(recipeData.createdBy === auth.currentUser.uid);

      if (recipeData.createdBy) {
        const userDoc = await getDoc(doc(db, 'users', recipeData.createdBy));
        if (userDoc.exists()) {
          setCreatorName(userDoc.data().username || 'Anonymous');
        }
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddRecipe', { recipeId, editMode: true, recipe });
  };

  const handleDelete = async () => {
    if (!recipeId) return;
    try {
      if (window && window.confirm) {
        const confirmed = window.confirm('Are you sure you want to delete this recipe?');
        if (!confirmed) return;
      } else {
        // For React Native
        Alert.alert('Delete Recipe', 'Are you sure you want to delete this recipe?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: async () => {
            await deleteDoc(doc(db, 'recipes', recipeId));
            navigation.goBack();
          }}
        ]);
        return;
      }
      await deleteDoc(doc(db, 'recipes', recipeId));
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete recipe.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6F4E37" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Recipe not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#6F4E37', '#8B5A2B']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.creatorText}>by {creatorName}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{recipe.category}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={24} color="#6F4E37" />
            <Text style={styles.sectionTitle}>Ingredients</Text>
          </View>
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientDot} />
                <Text style={styles.ingredientText}>
                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color="#6F4E37" />
            <Text style={styles.sectionTitle}>Instructions</Text>
          </View>
          <View style={styles.instructionsList}>
            {recipe.instructions.map((step, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {isUserRecipe && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.85}>
            <Ionicons name="trash-outline" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  creatorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6F4E37',
    marginLeft: 10,
  },
  ingredientsList: {
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6F4E37',
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6F4E37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
    gap: 16,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6F4E37',
    padding: 14,
    borderRadius: 12,
    marginRight: 8,
    elevation: 2,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    padding: 14,
    borderRadius: 12,
    marginLeft: 8,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
