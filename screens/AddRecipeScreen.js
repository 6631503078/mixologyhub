// screens/AddRecipeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const categories = [
  { id: '1', title: 'Coffee', emoji: '☕' },
  { id: '2', title: 'Smoothies', emoji: '🍹' },
  { id: '3', title: 'Juice', emoji: '🍊' },
  { id: '4', title: 'Alcohol', emoji: '🍸' },
  { id: '5', title: 'Other', emoji: '✨' },
];

const units = ['g', 'ml', 'tsp', 'tbsp', 'cup', 'piece', 'slice', 'pinch', 'custom'];

export default function AddRecipeScreen({ navigation, route }) {
  const editMode = route?.params?.editMode;
  const recipeId = route?.params?.recipeId;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Coffee');
  const [customCategory, setCustomCategory] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [currentUnit, setCurrentUnit] = useState('g');
  const [customUnit, setCustomUnit] = useState('');
  const [instructions, setInstructions] = useState([]);
  const [currentStep, setCurrentStep] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-fill fields in edit mode
  useEffect(() => {
    const fetchRecipeForEdit = async () => {
      if (editMode && recipeId) {
        setIsLoading(true);
        try {
          const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
          if (recipeDoc.exists()) {
            const data = recipeDoc.data();
            setTitle(data.title || '');
            setCategory(
              ['Coffee', 'Smoothies', 'Juice', 'Alcohol'].includes(data.category)
                ? data.category
                : 'Other'
            );
            setCustomCategory(
              ['Coffee', 'Smoothies', 'Juice', 'Alcohol'].includes(data.category)
                ? ''
                : data.category
            );
            setIngredients(data.ingredients || []);
            setInstructions(data.instructions || []);
          }
        } catch (e) {
          Alert.alert('Error', 'Failed to load recipe for editing.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchRecipeForEdit();
  }, [editMode, recipeId]);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!category) newErrors.category = 'Category is required';
    if (category === 'Other' && !customCategory.trim()) {
      newErrors.customCategory = 'Custom category name is required';
    }
    if (ingredients.length === 0) newErrors.ingredients = 'At least one ingredient is required';
    if (instructions.length === 0) newErrors.instructions = 'At least one instruction step is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addIngredient = () => {
    if (currentIngredient.trim() && currentAmount.trim()) {
      const unitToUse = currentUnit === 'custom' ? customUnit.trim() : currentUnit;
      if (currentUnit === 'custom' && !customUnit.trim()) {
        Alert.alert('Error', 'Please enter a custom unit');
        return;
      }
      
      setIngredients([
        ...ingredients,
        {
          name: currentIngredient.trim(),
          amount: currentAmount.trim(),
          unit: unitToUse,
        },
      ]);
      setCurrentIngredient('');
      setCurrentAmount('');
      if (currentUnit === 'custom') {
        setCurrentUnit('g'); // Reset to default
        setCustomUnit('');
      }
    }
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstructionStep = () => {
    if (currentStep.trim()) {
      setInstructions([...instructions, currentStep.trim()]);
      setCurrentStep('');
    }
  };

  const removeInstructionStep = (index) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (editMode && recipeId) {
        // Update existing recipe
        await updateDoc(doc(db, 'recipes', recipeId), {
          title,
          category: category === 'Other' ? customCategory : category,
          ingredients,
          instructions,
        });
        Alert.alert('Success', 'Recipe updated successfully!');
      } else {
        // Add new recipe
        await addDoc(collection(db, 'recipes'), {
          title,
          category: category === 'Other' ? customCategory : category,
          ingredients,
          instructions,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.uid,
        });
        Alert.alert('Success', 'Recipe added successfully!');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#6F4E37" />
        </TouchableOpacity>
        <Text style={styles.header}>{editMode ? 'Edit Recipe' : 'Add New Recipe'}</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Recipe Title</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          placeholder="Enter recipe title"
          value={title}
          onChangeText={setTitle}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                category === cat.title && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat.title)}
            >
              <Text style={[
                styles.categoryEmoji,
                category === cat.title && styles.categoryEmojiActive
              ]}>{cat.emoji}</Text>
              <Text style={[
                styles.categoryText,
                category === cat.title && styles.categoryTextActive
              ]}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {category === 'Other' && (
          <TextInput
            style={[
              styles.input,
              styles.customInput,
              errors.customCategory && styles.inputError
            ]}
            placeholder="Enter custom category"
            value={customCategory}
            onChangeText={setCustomCategory}
            placeholderTextColor="#999"
          />
        )}
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        {errors.customCategory && <Text style={styles.errorText}>{errors.customCategory}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ingredients</Text>
        <View style={styles.ingredientInputContainer}>
          <View style={styles.ingredientFields}>
            <TextInput
              style={[styles.input, styles.ingredientNameInput]}
              placeholder="Ingredient name"
              value={currentIngredient}
              onChangeText={setCurrentIngredient}
              placeholderTextColor="#999"
            />
            <View style={styles.amountUnitRow}>
              <View style={styles.amountContainer}>
                <TextInput
                  style={[styles.input, styles.amountInput]}
                  placeholder="Amount"
                  value={currentAmount}
                  onChangeText={setCurrentAmount}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.unitPickerWrapper}>
                <Picker
                  selectedValue={currentUnit}
                  onValueChange={(itemValue) => setCurrentUnit(itemValue)}
                  style={styles.unitPicker}
                  dropdownIconColor="#6F4E37"
                  mode="dropdown"
                >
                  {units.map((unit) => (
                    <Picker.Item 
                      key={unit} 
                      label={unit} 
                      value={unit}
                      color="#6F4E37"
                    />
                  ))}
                </Picker>
              </View>
              {currentUnit === 'custom' && (
                <View style={styles.customUnitContainer}>
                  <TextInput
                    style={[styles.input, styles.customUnitInput]}
                    placeholder="Enter unit"
                    value={customUnit}
                    onChangeText={setCustomUnit}
                    placeholderTextColor="#999"
                  />
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity 
            style={styles.addIngredientButton} 
            onPress={addIngredient}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={32} color="#6F4E37" />
          </TouchableOpacity>
        </View>

        {ingredients.length > 0 && (
          <View style={styles.ingredientsList}>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientInfo}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.ingredientAmount}>
                    {ingredient.amount} {ingredient.unit}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => removeIngredient(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Instructions</Text>
        <View style={styles.instructionInputContainer}>
          <TextInput
            style={[styles.input, styles.instructionInput]}
            placeholder="Add a step"
            value={currentStep}
            onChangeText={setCurrentStep}
          />
          <TouchableOpacity 
            style={styles.addIngredientButton}
            onPress={addInstructionStep}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={32} color="#6F4E37" />
          </TouchableOpacity>
        </View>
        {errors.instructions && <Text style={styles.errorText}>{errors.instructions}</Text>}
        <View style={styles.instructionsList}>
          {instructions.map((step, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <Text style={styles.instructionText}>{step}</Text>
              <TouchableOpacity onPress={() => removeInstructionStep(index)}>
                <Ionicons name="close-circle" size={20} color="#6F4E37" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{editMode ? 'Update Recipe' : 'Submit Recipe'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF8F0',
    flexGrow: 1,
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  backButton: {
    marginRight: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFEBD6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6F4E37',
    flex: 1,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6F4E37',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0D3C5',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#6F4E37',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFEBD6',
    borderWidth: 1,
    borderColor: '#E0D3C5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37',
  },
  categoryEmoji: {
    fontSize: 22,
    marginRight: 8,
    color: '#6F4E37',
  },
  categoryEmojiActive: {
    color: '#fff',
  },
  categoryText: {
    fontSize: 15,
    color: '#6F4E37',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  ingredientInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ingredientFields: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  ingredientNameInput: {
    fontSize: 16,
    color: '#6F4E37',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#FFEBD6',
    borderRadius: 8,
  },
  amountUnitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountContainer: {
    flex: 1,
    marginRight: 10,
  },
  amountInput: {
    fontSize: 16,
    color: '#6F4E37',
    padding: 8,
    backgroundColor: '#FFEBD6',
    borderRadius: 8,
  },
  unitPickerWrapper: {
    width: 100,
    backgroundColor: '#FFEBD6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0D3C5',
    marginLeft: 0,
    marginRight: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  unitPicker: {
    height: 40,
    color: '#6F4E37',
    backgroundColor: 'transparent',
  },
  addIngredientButton: {
    marginLeft: 10,
    padding: 5,
  },
  ingredientsList: {
    marginTop: 15,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6F4E37',
    marginBottom: 4,
  },
  ingredientAmount: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 5,
  },
  instructionInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  instructionInput: {
    flex: 1,
  },
  instructionsList: {
    marginTop: 10,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFEBD6',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6F4E37',
    marginRight: 10,
    minWidth: 25,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#6F4E37',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#6F4E37',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  customInput: {
    marginTop: 10,
    backgroundColor: '#FFEBD6',
  },
  customUnitContainer: {
    flex: 1,
    marginLeft: 10,
  },
  customUnitInput: {
    backgroundColor: '#FFEBD6',
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
});
