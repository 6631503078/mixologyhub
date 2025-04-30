// screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  { id: '1', title: 'Coffee', emoji: '☕', color: '#8B4513', gradient: ['#8B4513', '#A0522D'] },
  { id: '2', title: 'Smoothies', emoji: '🍹', color: '#FF6B6B', gradient: ['#FF6B6B', '#FF8E8E'] },
  { id: '3', title: 'Juice', emoji: '🍊', color: '#FFA500', gradient: ['#FFA500', '#FFB74D'] },
  { id: '4', title: 'Alcohol', emoji: '🍸', color: '#6F4E37', gradient: ['#6F4E37', '#8B5A2B'] },
  { id: '5', title: 'Other', emoji: '✨', color: '#9C7A97', gradient: ['#9C7A97', '#B794B8'] },
];

export default function HomeScreen({ navigation }) {
  const handleCategoryPress = (category) => {
    navigation.navigate('RecipeList', { category: category.title });
  };

  const handleAddRecipePress = () => {
    navigation.navigate('AddRecipe');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={item.gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
        <Text style={styles.title}>{item.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mixology Hub</Text>
        <Text style={styles.headerSubtitle}>Discover & Create Amazing Recipes</Text>
      </View>

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={handleAddRecipePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#6F4E37', '#8B5A2B']}
          style={styles.addButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Recipe</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        numColumns={2}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  addButton: {
    marginHorizontal: 20,
    marginBottom: 25,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6F4E37',
    marginLeft: 20,
    marginBottom: 15,
  },
  list: {
    paddingHorizontal: 15,
  },
  card: {
    flex: 1,
    margin: 8,
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
  gradient: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});
