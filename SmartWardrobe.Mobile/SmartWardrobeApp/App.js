import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Your computer's IP address
const API_URL = 'http://192.168.0.11:5190/api';

// Category list
const CATEGORIES = [
  { id: 1, name: 'TShirt' },
  { id: 2, name: 'Shirt' },
  { id: 3, name: 'Blouse' },
  { id: 4, name: 'Sweater' },
  { id: 5, name: 'Jacket' },
  { id: 6, name: 'Coat' },
  { id: 7, name: 'Vest' },
  { id: 8, name: 'Dress' },
  { id: 9, name: 'Skirt' },
  { id: 10, name: 'Pant' },
  { id: 11, name: 'Short' },
  { id: 12, name: 'Jeans' },
  { id: 13, name: 'Suit' },
  { id: 14, name: 'Blazer' },
];

export default function App() {
  // Auth state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // App state
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('👕 Welcome to SmartWardrobe!');
  const [backendStatus, setBackendStatus] = useState('🔄 Connecting to backend...');
  const [clothingItems, setClothingItems] = useState([]);

  // Add Product State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductColor, setNewProductColor] = useState('');
  const [newProductSize, setNewProductSize] = useState('');
  const [newProductSeason, setNewProductSeason] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Test backend connection on app start
  useEffect(() => {
    console.log('SmartWardrobe App Started!');
    testBackendConnection();
  }, []);

  // Backend connection test function
  const testBackendConnection = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`, { timeout: 10000 });
      console.log('✅ Backend connected!', response.data);
      setBackendStatus('✅ Backend connected!');
      setMessage('🟢 Connected to backend!');
    } catch (error) {
      console.log('❌ Backend connection failed:', error.message);
      setBackendStatus('❌ Backend connection failed!');
      setMessage('🔴 Backend connection failed! Please start the backend.');
    }
  };

  // User registration
  const register = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters!');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/Auth/register`, {
        fullName: fullName,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      });
      console.log('✅ Registration successful!', response.data);
      Alert.alert('Success', 'Registration completed! You can now log in.');

      setIsRegisterMode(false);
      setPassword('');
      setConfirmPassword('');
      setFullName('');

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.log('❌ Registration failed:', error.response?.data);
      Alert.alert('Registration Error', errorMessage);
    }
  };

  // User login
  const login = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password!');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/Auth/login`, {
        email: email,
        password: password
      });
      console.log('✅ Login successful!', response.data);

      const tokenData = response.data.token || response.data.data?.token;
      if (tokenData) {
        setToken(tokenData);
        setIsLoggedIn(true);
        setMessage('🟢 Login successful! Welcome!');
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Error', 'Token not received!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.log('❌ Login failed:', error.response?.data);
      Alert.alert('Login Error', errorMessage);
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
    setClothingItems([]);
    setShowAddForm(false);
    setMessage('👋 Logged out!');
    Alert.alert('Info', 'Logged out!');
  };

  // Fetch clothing items
  const fetchClothingItems = async () => {
    if (!token) {
      Alert.alert('Warning', 'Please login first!');
      return;
    }

    try {
      console.log('📤 Fetching products...');

      const response = await axios.get(`${API_URL}/Clothing`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          pageNumber: 1,
          pageSize: 100
        },
        timeout: 15000
      });

      console.log('✅ Products fetched successfully!', response.data);

      if (response.data?.data?.items) {
        const items = response.data.data.items;
        setClothingItems(items);
        setMessage(`✅ ${items.length} products found!`);
      } else if (response.data?.items) {
        const items = response.data.items;
        setClothingItems(items);
        setMessage(`✅ ${items.length} products found!`);
      } else if (Array.isArray(response.data)) {
        setClothingItems(response.data);
        setMessage(`✅ ${response.data.length} products found!`);
      } else {
        console.warn('⚠️ Unknown response format:', response.data);
        setClothingItems([]);
        setMessage('⚠️ Products received but format is incorrect!');
      }
    } catch (error) {
      console.log('❌ Failed to fetch products:', error.message);

      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again!');
        setIsLoggedIn(false);
        setToken(null);
      } else {
        Alert.alert('Error', `Failed to fetch products: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Add new product
  const addProduct = async () => {
    if (!token) {
      Alert.alert('Warning', 'Please login first!');
      return;
    }

    if (!newProductName.trim()) {
      Alert.alert('Error', 'Product name is required!');
      return;
    }

    if (!newProductCategory) {
      Alert.alert('Error', 'Please select a category!');
      return;
    }

    try {
      const productData = {
        name: newProductName,
        category: parseInt(newProductCategory),
        brand: newProductBrand || undefined,
        color: newProductColor || undefined,
        size: newProductSize || undefined,
        season: newProductSeason ? parseInt(newProductSeason) : undefined
      };

      console.log('📤 Adding product...', productData);

      const response = await axios.post(`${API_URL}/Clothing`, productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ Product added successfully!', response.data);
      Alert.alert('Success', 'Product added successfully!');

      // Clear form
      setNewProductName('');
      setNewProductCategory('');
      setNewProductBrand('');
      setNewProductColor('');
      setNewProductSize('');
      setNewProductSeason('');
      setShowAddForm(false);
      setShowCategoryPicker(false);

      // Refresh product list
      fetchClothingItems();

    } catch (error) {
      console.log('❌ Failed to add product:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to add product: ${error.response?.data?.message || error.message}`);
    }
  };

  // Get outfit suggestion
  const getOutfitSuggestion = async () => {
    if (!token) {
      Alert.alert('Warning', 'Please login first!');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/AI/outfit-suggestions`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });
      setCount(count + 1);
      setMessage(`👔 Outfit suggestion #${count + 1} ready!`);
      console.log('Outfit suggestion:', response.data);
    } catch (error) {
      console.log('❌ Failed to get outfit suggestion:', error.message);
      Alert.alert('Error', 'Failed to get outfit suggestion!');
    }
  };

  // Select category
  const selectCategory = (categoryId) => {
    setNewProductCategory(categoryId.toString());
    setShowCategoryPicker(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛍️ SmartWardrobe</Text>
        <Text style={styles.subtitle}>AI-Powered Smart Wardrobe App</Text>
      </View>

      {/* Login/Register Form */}
      {!isLoggedIn ? (
        <View style={styles.card}>
          {!isRegisterMode ? (
            <View>
              <Text style={styles.sectionTitle}>🔐 Login</Text>

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={login}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => {
                  setIsRegisterMode(true);
                  setPassword('');
                  setConfirmPassword('');
                  setFullName('');
                }}
              >
                <Text style={styles.toggleButtonText}>Don't have an account? <Text style={styles.toggleButtonHighlight}>Register</Text></Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>📝 Register</Text>

              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={register}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => {
                  setIsRegisterMode(false);
                  setPassword('');
                  setConfirmPassword('');
                  setFullName('');
                }}
              >
                <Text style={styles.toggleButtonText}>Already have an account? <Text style={styles.toggleButtonHighlight}>Login</Text></Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.backendStatus}>{backendStatus}</Text>
        </View>
      ) : (
        <View>
          {/* Main Menu */}
          <View style={styles.card}>
            <Text style={styles.message}>{message}</Text>
            <Text style={styles.backendStatus}>{backendStatus}</Text>

            <TouchableOpacity style={styles.button} onPress={getOutfitSuggestion}>
              <Text style={styles.buttonText}>🤖 Get Outfit Suggestion</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#2ecc71', marginTop: 10 }]}
              onPress={fetchClothingItems}
            >
              <Text style={styles.buttonText}>🔄 Fetch Products</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#f39c12', marginTop: 10 }]}
              onPress={() => setShowAddForm(!showAddForm)}
            >
              <Text style={styles.buttonText}>{showAddForm ? '❌ Close Form' : '➕ Add New Product'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#e74c3c', marginTop: 10 }]}
              onPress={logout}
            >
              <Text style={styles.buttonText}>🚪 Logout</Text>
            </TouchableOpacity>

            <Text style={styles.counter}>Total Suggestions: {count}</Text>
          </View>

          {/* Add Product Form */}
          {showAddForm && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>📦 Add New Product</Text>

              <TextInput
                style={styles.input}
                placeholder="Product Name * (e.g. Nike Air Max)"
                value={newProductName}
                onChangeText={setNewProductName}
              />

              {/* Category Selector */}
              <View>
                <TouchableOpacity
                  style={styles.categorySelector}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text style={styles.categorySelectorText}>
                    {newProductCategory
                      ? CATEGORIES.find(c => c.id === parseInt(newProductCategory))?.name || 'Select Category'
                      : '📂 Select Category *'}
                  </Text>
                  <Text style={styles.categorySelectorArrow}>▼</Text>
                </TouchableOpacity>

                {showCategoryPicker && (
                  <ScrollView
                    style={styles.categoryList}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryItem,
                          newProductCategory === cat.id.toString() && styles.categoryItemSelected
                        ]}
                        onPress={() => selectCategory(cat.id)}
                      >
                        <Text style={[
                          styles.categoryItemText,
                          newProductCategory === cat.id.toString() && styles.categoryItemTextSelected
                        ]}>
                          {cat.id}. {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Brand (Optional)"
                value={newProductBrand}
                onChangeText={setNewProductBrand}
              />

              <TextInput
                style={styles.input}
                placeholder="Color (Optional)"
                value={newProductColor}
                onChangeText={setNewProductColor}
              />

              <TextInput
                style={styles.input}
                placeholder="Size (Optional)"
                value={newProductSize}
                onChangeText={setNewProductSize}
              />

              <TextInput
                style={styles.input}
                placeholder="Season (1: Summer, 2: Winter, 3: Spring, 4: Fall)"
                value={newProductSeason}
                onChangeText={setNewProductSeason}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2ecc71' }]}
                onPress={addProduct}
              >
                <Text style={styles.buttonText}>✅ Save Product</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Product List */}
          {clothingItems.length > 0 && (
            <View style={styles.features}>
              <Text style={styles.featureTitle}>👗 Wardrobe Products ({clothingItems.length})</Text>
              {clothingItems.map((item, index) => (
                <Text key={index} style={styles.featureItem}>
                  • {item.name || 'Product'}
                  {item.brand ? ` (${item.brand})` : ''}
                  {item.category ? ` - ${CATEGORIES.find(c => c.id === item.category)?.name || item.category}` : ''}
                  {item.color ? ` - ${item.color}` : ''}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.features}>
        <Text style={styles.featureTitle}>📋 Features:</Text>
        <Text style={styles.featureItem}>✅ Wardrobe Management</Text>
        <Text style={styles.featureItem}>✅ AI Outfit Suggestions</Text>
        <Text style={styles.featureItem}>✅ Seasonal Analysis</Text>
        <Text style={styles.featureItem}>✅ Photo Upload</Text>
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#3498db',
    width: '100%',
  },
  registerButton: {
    backgroundColor: '#2ecc71',
    width: '100%',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#34495e',
  },
  backendStatus: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  toggleButtonHighlight: {
    color: '#3498db',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  counter: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
  },
  features: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 16,
    color: '#34495e',
    paddingVertical: 5,
  },
  // Category Selector Styles
  categorySelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#333',
  },
  categorySelectorArrow: {
    fontSize: 16,
    color: '#999',
  },
  categoryList: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  categoryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryItemSelected: {
    backgroundColor: '#3498db',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
  categoryItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});