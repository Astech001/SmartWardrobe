import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput, Modal, Image } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef } from 'react';

const API_URL = 'http://192.168.0.11:5190/api';

// Kategoriler
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
  { id: 15, name: 'Sneakers' },
  { id: 16, name: 'Boots' },
  { id: 17, name: 'Sandals' },
  { id: 18, name: 'Bag' },
  { id: 19, name: 'Hat' },
  { id: 20, name: 'Scarf' },
  { id: 21, name: 'Belt' },
  { id: 22, name: 'Watch' },
  { id: 23, name: 'Jewelry' },
];

// Abonelik Planları
const PLANS = [
  { id: 0, name: 'Free', price: 0, yearlyPrice: 0, limit: 20, icon: '🆓', color: '#95a5a6', isFree: true },
  { id: 1, name: 'Plus', price: 79, yearlyPrice: 790, limit: 200, icon: '📸', color: '#3498db', isFree: false },
  { id: 2, name: 'Pro', price: 199, yearlyPrice: 1990, limit: 500, icon: '💼', color: '#9b59b6', isFree: false },
  { id: 3, name: 'Ultimate', price: 399, yearlyPrice: 3990, limit: -1, icon: '👑', color: '#f39c12', isFree: false },
];

// Sezonlar
const SEASONS = [
  { id: 1, name: '☀️ Summer' },
  { id: 2, name: '❄️ Winter' },
  { id: 3, name: '🌿 Spring' },
  { id: 4, name: '🍂 Fall' },
];

// Hava Durumları
const WEATHERS = [
  { id: 1, name: '☀️ Sunny' },
  { id: 2, name: '⛅ Partly Cloudy' },
  { id: 3, name: '☁️ Cloudy' },
  { id: 4, name: '🌧️ Rainy' },
  { id: 5, name: '❄️ Snowy' },
];

// AI Kombin için gerekli kategoriler
const REQUIRED_CATEGORIES = [
  { id: 1, name: 'TShirt', minCount: 2, icon: '👕' },
  { id: 4, name: 'Sweater', minCount: 1, icon: '🧥' },
  { id: 12, name: 'Jeans', minCount: 2, icon: '👖' },
  { id: 15, name: 'Sneakers', minCount: 2, icon: '👟' },
  { id: 5, name: 'Jacket', minCount: 1, icon: '🧥' },
];

export default function App() {
  // Auth
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // App
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('👕 Welcome to SmartWardrobe!');
  const [backendStatus, setBackendStatus] = useState('🔄 Connecting to backend...');
  const [clothingItems, setClothingItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Subscription
  const [subscription, setSubscription] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Add Product
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductColor, setNewProductColor] = useState('');
  const [newProductSize, setNewProductSize] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedWeather, setSelectedWeather] = useState('');
  const [showSeasonPicker, setShowSeasonPicker] = useState(false);
  const [showWeatherPicker, setShowWeatherPicker] = useState(false);

  // Photo Upload
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  // Edit Product
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editSize, setEditSize] = useState('');
  const [editSeason, setEditSeason] = useState('');
  const [editWeather, setEditWeather] = useState('');
  const [showEditCategoryPicker, setShowEditCategoryPicker] = useState(false);
  const [showEditSeasonPicker, setShowEditSeasonPicker] = useState(false);
  const [showEditWeatherPicker, setShowEditWeatherPicker] = useState(false);

  // AI Outfit
  const [outfitSuggestions, setOutfitSuggestions] = useState([]);
  const [showOutfitModal, setShowOutfitModal] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [outfitOccasion, setOutfitOccasion] = useState('casual');
  const [outfitTimeOfDay, setOutfitTimeOfDay] = useState('afternoon');
  const [outfitWeather, setOutfitWeather] = useState('sunny');
  const [outfitTemperature, setOutfitTemperature] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSeason, setFilterSeason] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Profile State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // ... App fonksiyonu içinde
  const scrollViewRef = useRef(null);

  const addFormRef = useRef(null);

  // ================ LIFECYCLE ================

  useEffect(() => {
    console.log('SmartWardrobe App Started!');
    testBackendConnection();
  }, []);

  useEffect(() => {
    if (token) {
      fetchSubscriptionStatus();
    }
  }, [token]);

  // ================ BACKEND ================

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

  // ================ SUBSCRIPTION ================

  const fetchSubscriptionStatus = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/Subscription/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Subscription status:', JSON.stringify(response.data, null, 2));

      // ✅ DÜZELTME: response.data.data'yı set et
      const subscriptionData = response.data.data || response.data;
      setSubscription(subscriptionData);
    } catch (error) {
      console.log('❌ Failed to fetch subscription:', error.message);
    }
  };

  // ================ PROFİL ================

  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/Auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ User profile RAW:', JSON.stringify(response.data, null, 2)); // ← EKLEYİN
      setUserProfile(response.data);
    } catch (error) {
      console.log('❌ Failed to fetch profile:', error.message);
    }
  };

  const upgradePlan = async (planId) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/Subscription/upgrade`,
        { plan: planId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Plan upgraded!', response.data);
      Alert.alert('Success', `Upgraded to ${PLANS.find(p => p.id === planId)?.name} plan!`);
      setShowSubscriptionModal(false);
      fetchSubscriptionStatus();
    } catch (error) {
      console.log('❌ Upgrade failed:', error.response?.data || error.message);
      Alert.alert('Error', `Upgrade failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ================ AUTH ================

  const register = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters!');
      return;
    }
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password!');
      return;
    }
    setIsLoading(true);
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
        await fetchClothingItemsWithToken(tokenData);
        await fetchUserProfile(); // ✅ PROFİL VERİLERİNİ GETİR

      } else {
        Alert.alert('Error', 'Token not received!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.log('❌ Login failed:', error.response?.data);
      Alert.alert('Login Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
    setClothingItems([]);
    setFilteredItems([]);
    setSubscription(null);
    setSelectedImage(null);
    setUploadedImageUrl(null);
    setShowAddForm(false);
    setShowEditModal(false);
    setShowSubscriptionModal(false);
    setShowOutfitModal(false);
    setShowPreferenceModal(false);
    setMessage('👋 Logged out!');
    Alert.alert('Info', 'Logged out!');
  };

  // ================ PHOTO UPLOAD ================

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setUploadedImageUrl(null);
      console.log('📸 Photo taken:', result.assets[0]);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setUploadedImageUrl(null);
      console.log('🖼️ Image selected:', result.assets[0]);
    }
  };

  const uploadPhoto = async () => {
    if (!token) {
      Alert.alert('Warning', 'Please login first!');
      return;
    }
    if (!selectedImage) {
      Alert.alert('Error', 'Please select a photo first!');
      return;
    }
    if (subscription && subscription.remainingPhotoCount <= 0) {
      Alert.alert('Photo Limit Reached', 'You have reached your photo limit. Please upgrade your plan.');
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await fetch(selectedImage.uri)
        .then(res => res.blob())
        .then(blob => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        }));

      const imageBase64 = base64.split(',')[1];
      const response = await axios.post(`${API_URL}/Upload/image`, {
        imageBase64: imageBase64,
        fileName: 'photo.jpg'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('✅ Photo uploaded!', response.data);
      const imageUrl = response.data.imageUrl || response.data.data?.imageUrl;
      setUploadedImageUrl(imageUrl);
      Alert.alert('Success', 'Photo uploaded successfully!');
      await fetchSubscriptionStatus();
    } catch (error) {
      console.log('❌ Upload failed:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        Alert.alert('Photo Limit Reached', 'You have reached your photo limit. Please upgrade your plan.');
      } else {
        Alert.alert('Error', `Upload failed: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // ================ PRODUCTS ================

  const fetchClothingItemsWithToken = async (authToken) => {
    try {
      console.log('📤 Fetching products after login...');
      const response = await axios.get(`${API_URL}/Clothing`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        params: { pageNumber: 1, pageSize: 100 },
        timeout: 15000
      });
      console.log('✅ Products fetched after login!', response.data);

      let items = [];
      if (response.data?.data?.items) items = response.data.data.items;
      else if (response.data?.items) items = response.data.items;
      else if (Array.isArray(response.data)) items = response.data;

      setClothingItems(items);
      setFilteredItems(items);
      setMessage(`✅ ${items.length} products found!`);
    } catch (error) {
      console.log('❌ Failed to fetch products after login:', error.message);
    }
  };

  const fetchClothingItems = async () => {
    if (!token) {
      Alert.alert('Warning', 'Please login first!');
      return;
    }
    setIsLoading(true);
    try {
      console.log('📤 Fetching products...');
      const response = await axios.get(`${API_URL}/Clothing`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: { pageNumber: 1, pageSize: 100 },
        timeout: 15000
      });
      console.log('✅ Products fetched!', response.data);

      let items = [];
      if (response.data?.data?.items) items = response.data.data.items;
      else if (response.data?.items) items = response.data.items;
      else if (Array.isArray(response.data)) items = response.data;

      setClothingItems(items);
      setFilteredItems(items);
      setMessage(`✅ ${items.length} products found!`);
    } catch (error) {
      console.log('❌ Failed to fetch products:', error.message);
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again!');
        setIsLoggedIn(false);
        setToken(null);
      } else {
        Alert.alert('Error', `Failed to fetch products: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ================ KATEGORİ GRUPLAMA ================

  const groupProductsByCategory = (items) => {
    const grouped = {};
    items.forEach(item => {
      const categoryId = item.category;
      const categoryName = CATEGORIES.find(c => c.id === categoryId)?.name || 'Unknown';
      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          categoryId,
          categoryName,
          items: []
        };
      }
      grouped[categoryId].items.push(item);
    });
    return Object.values(grouped);
  };

  // ================ SEARCH & FILTER ================

  const applyFilters = () => {
    let filtered = [...clothingItems];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(term) ||
        item.brand?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(item => item.category?.toString() === filterCategory);
    }

    if (filterSeason) {
      filtered = filtered.filter(item => item.season?.toString() === filterSeason);
    }

    if (filterColor) {
      filtered = filtered.filter(item => item.color?.toLowerCase().includes(filterColor.toLowerCase()));
    }

    setFilteredItems(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterSeason('');
    setFilterColor('');
    setFilteredItems(clothingItems);
    setShowFilters(false);
  };

  // ================ CRUD ================

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditName(product.name || '');
    setEditCategory(product.category ? product.category.toString() : '');
    setEditBrand(product.brand || '');
    setEditColor(product.color || '');
    setEditSize(product.size || '');
    setEditSeason(product.season ? product.season.toString() : '');
    setEditWeather(product.suitableWeather ? product.suitableWeather.toString() : '');
    setShowEditModal(true);
  };

  const updateProduct = async () => {
    if (!token || !selectedProduct) return;
    if (!editName.trim()) {
      Alert.alert('Error', 'Product name is required!');
      return;
    }
    setIsLoading(true);
    try {
      const updateData = {
        name: editName,
        category: editCategory ? parseInt(editCategory) : undefined,
        brand: editBrand || undefined,
        color: editColor || undefined,
        size: editSize || undefined,
        season: editSeason ? parseInt(editSeason) : undefined,
        suitableWeather: editWeather ? parseInt(editWeather) : undefined
      };
      console.log('📤 Updating product...', updateData);
      await axios.put(`${API_URL}/Clothing/${selectedProduct.id}`, updateData, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000
      });
      console.log('✅ Product updated!');
      Alert.alert('Success', 'Product updated successfully!');
      setShowEditModal(false);
      fetchClothingItems();
    } catch (error) {
      console.log('❌ Update failed:', error.response?.data || error.message);
      Alert.alert('Error', `Update failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            setIsLoading(true);
            try {
              await axios.delete(`${API_URL}/Clothing/${productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              console.log('✅ Product deleted!');
              Alert.alert('Success', 'Product deleted successfully!');
              fetchClothingItems();
            } catch (error) {
              console.log('❌ Delete failed:', error.response?.data || error.message);
              Alert.alert('Error', `Delete failed: ${error.response?.data?.message || error.message}`);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

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
    if (!newProductColor.trim()) {
      Alert.alert('Error', 'Please enter a color!');
      return;
    }
    if (!selectedSeason) {
      Alert.alert('Error', 'Please select a season!');
      return;
    }
    if (!selectedWeather) {
      Alert.alert('Error', 'Please select a weather type!');
      return;
    }
    if (!uploadedImageUrl) {
      Alert.alert('Warning', 'Please upload a photo first!');
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        name: newProductName,
        category: parseInt(newProductCategory),
        brand: newProductBrand || undefined,
        color: newProductColor.trim(),
        size: newProductSize || undefined,
        season: parseInt(selectedSeason),
        suitableWeather: parseInt(selectedWeather),
        imageUrl: uploadedImageUrl,
        publicImageId: 'image_' + Date.now(),
        thumbnailUrl: uploadedImageUrl
      };
      console.log('📤 Adding product...', productData);
      await axios.post(`${API_URL}/Clothing`, productData, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000
      });
      console.log('✅ Product added successfully!');
      Alert.alert('Success', 'Product added successfully!');

      // Formu temizle
      setNewProductName('');
      setNewProductCategory('');
      setNewProductBrand('');
      setNewProductColor('');
      setNewProductSize('');
      setSelectedSeason('');
      setSelectedWeather('');
      setSelectedImage(null);
      setUploadedImageUrl(null);
      setShowAddForm(false);
      setShowCategoryPicker(false);
      setShowSeasonPicker(false);
      setShowWeatherPicker(false);
      fetchClothingItems();
    } catch (error) {
      console.log('❌ Failed to add product:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to add product: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ================ AI OUTFIT ================

  const analyzeCategories = (items) => {
    const result = REQUIRED_CATEGORIES.map(req => {
      const count = items.filter(item => item.category === req.id).length;
      return {
        ...req,
        count: count,
        isComplete: count >= req.minCount,
        need: Math.max(0, req.minCount - count)
      };
    });

    const allCategoryIds = new Set(items.map(item => item.category));
    const extraCategories = CATEGORIES
      .filter(cat => allCategoryIds.has(cat.id) && !REQUIRED_CATEGORIES.some(req => req.id === cat.id))
      .map(cat => {
        const count = items.filter(item => item.category === cat.id).length;
        return {
          id: cat.id,
          name: cat.name,
          count: count,
          minCount: 1,
          icon: '📦',
          isComplete: count >= 1,
          need: Math.max(0, 1 - count)
        };
      });

    return [...result, ...extraCategories];
  };

  const getOutfitSuggestionWithPreferences = async () => {
    if (!token) {
      Alert.alert('Warning', 'Please login first!');
      return;
    }

    if (clothingItems.length === 0) {
      await fetchClothingItems();
    }

    const categoryAnalysis = analyzeCategories(clothingItems);
    const missingCategories = categoryAnalysis.filter(c => c.count < c.minCount);
    const hasEnoughProducts = missingCategories.length === 0;

    if (!hasEnoughProducts) {
      let message = '⚠️ You need more products to get outfit suggestions!\n\n';
      message += '📊 Your Wardrobe Status:\n';
      categoryAnalysis.forEach(cat => {
        const status = cat.count >= cat.minCount ? '✅' : '❌';
        message += `${status} ${cat.icon} ${cat.name}: ${cat.count}/${cat.minCount}\n`;
      });
      message += '\n💡 Add these missing items:\n';
      missingCategories.forEach(cat => {
        const need = cat.minCount - cat.count;
        message += `  • ${cat.icon} ${need} more ${cat.name}(s)\n`;
      });
      message += `\n📝 Total: ${categoryAnalysis.reduce((sum, c) => sum + c.count, 0)} products`;
      message += `\n📝 Need: ${missingCategories.reduce((sum, c) => sum + (c.minCount - c.count), 0)} more products`;

      Alert.alert('📊 Wardrobe Analysis', message, [
        { text: 'Add Products', onPress: () => setShowAddForm(true) },
        { text: 'OK', style: 'cancel' },
      ]);
      return;
    }

    setIsLoadingSuggestions(true);
    setShowOutfitModal(true);

    try {
      const requestData = {
        excludeItems: [],
        occasion: outfitOccasion,
        timeOfDay: outfitTimeOfDay,
        weather: outfitWeather,
        temperature: outfitTemperature ? parseInt(outfitTemperature) : undefined,
      };

      console.log('📤 Outfit request with preferences:', requestData);

      const response = await axios.post(`${API_URL}/AI/outfit-suggestions`, requestData, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 15000
      });

      console.log('✅ Outfit suggestions:', response.data);
      const suggestions = response.data.data?.suggestions || response.data.suggestions || [];

      if (suggestions.length === 0) {
        setOutfitSuggestions([]);
        setMessage('👔 No outfit suggestions available. Try adding more products!');
        Alert.alert(
          'No Suggestions',
          'AI could not create outfit combinations from your wardrobe.\n\nSuggestions:\n• Add products from different categories\n• Add at least 3-4 products\n• Try adding: TShirt, Jeans, Shoes, Jacket',
          [{ text: 'OK', style: 'default' }]
        );
        setShowOutfitModal(false);
      } else {
        setOutfitSuggestions(suggestions);
        setCount(count + 1);
        setMessage(`👔 Outfit suggestion #${count + 1} ready!`);
      }
    } catch (error) {
      console.log('❌ Failed to get outfit suggestion:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to get outfit suggestions: ${error.response?.data?.message || error.message}`);
      setShowOutfitModal(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const selectCategory = (categoryId) => {
    setNewProductCategory(categoryId.toString());
    setShowCategoryPicker(false);
  };

  const selectEditCategory = (categoryId) => {
    setEditCategory(categoryId.toString());
    setShowEditCategoryPicker(false);
  };

  // ================ RENDER ================

  return (
    <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>

      {/* Loading Spinner */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>🛍️ SmartWardrobe</Text>
        <Text style={styles.subtitle}>AI-Powered Smart Wardrobe App</Text>
      </View>

      {!isLoggedIn ? (
        // LOGIN / REGISTER
        <View style={styles.card}>
          {!isRegisterMode ? (
            <View>
              <Text style={styles.sectionTitle}>🔐 Login</Text>
              <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
              <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={login}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleButton} onPress={() => { setIsRegisterMode(true); setPassword(''); setConfirmPassword(''); setFullName(''); }}>
                <Text style={styles.toggleButtonText}>Don't have an account? <Text style={styles.toggleButtonHighlight}>Register</Text></Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>📝 Register</Text>
              <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
              <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              <TextInput style={styles.input} placeholder="Password (min 6)" value={password} onChangeText={setPassword} secureTextEntry />
              <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
              <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={register}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleButton} onPress={() => { setIsRegisterMode(false); setPassword(''); setConfirmPassword(''); setFullName(''); }}>
                <Text style={styles.toggleButtonText}>Already have an account? <Text style={styles.toggleButtonHighlight}>Login</Text></Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.backendStatus}>{backendStatus}</Text>

          {/* Features - Sadece Login ekranında */}
          <View style={styles.features}>
            <Text style={styles.featureTitle}>📋 Features:</Text>
            <Text style={styles.featureItem}>✅ Wardrobe Management</Text>
            <Text style={styles.featureItem}>✅ AI Outfit Suggestions</Text>
            <Text style={styles.featureItem}>✅ Seasonal Analysis</Text>
            <Text style={styles.featureItem}>✅ Photo Upload</Text>
          </View>
        </View>
      ) : (
        <View>
          {/* MAIN MENU */}
          <View style={styles.card}>
            <Text style={styles.message}>{message}</Text>
            <Text style={styles.backendStatus}>{backendStatus}</Text>

            {/* Subscription Card */}
            {subscription && (
              <View style={styles.subscriptionCard}>
                <View style={styles.subscriptionRow}>
                  <Text style={styles.subscriptionTitle}>📊 Your Plan</Text>
                  <TouchableOpacity style={styles.subscriptionButton} onPress={() => setShowSubscriptionModal(true)}>
                    <Text style={styles.subscriptionButtonText}>Upgrade</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.subscriptionPlanRow}>
                  <Text style={styles.subscriptionPlan}>
                    {PLANS.find(p => p.id === subscription?.plan)?.icon} {PLANS.find(p => p.id === subscription?.plan)?.name || 'Free'}
                  </Text>
                  <View style={styles.subscriptionStatus}>
                    <View style={styles.greenTick} />
                    <Text style={styles.subscriptionStatusText}>Active</Text>
                  </View>
                </View>
                <View style={styles.photoLimitContainer}>
                  <View style={styles.photoLimitBar}>
                    <View style={[styles.photoLimitFill, {
                      width: subscription?.plan === 3 ? '100%' :
                        `${Math.min(((subscription?.usedPhotoCount ?? 0) / (subscription?.monthlyPhotoLimit ?? 20)) * 100, 100)}%`
                    }]} />
                  </View>
                  <Text style={styles.photoLimitText}>
                    📸 {subscription?.usedPhotoCount ?? 0} / {subscription?.monthlyPhotoLimit ?? 20} photos used
                  </Text>
                  <Text style={styles.photoLimitText}>
                    Remaining: {subscription?.remainingPhotoCount ?? 0} photos
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#9b59b6', marginTop: 10 }]}
              onPress={() => setShowPreferenceModal(true)}
            >
              <Text style={styles.buttonText}>
                🤖 AI Outfit Suggestion
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#2ecc71', marginTop: 10 }]}
              onPress={async () => {
                await fetchClothingItems();
                // ✅ Ürün listesine scroll yap
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ y: 850, animated: true });
                }, 300);
              }}
            >
              <Text style={styles.buttonText}>🔄 Fetch Products</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#f39c12', marginTop: 10 }]}
              onPress={() => {
                setShowAddForm(!showAddForm);
                if (!showAddForm) {
                  setTimeout(() => {
                    addFormRef.current?.measureLayout(
                      scrollViewRef.current,
                      (x, y) => {
                        scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
                      },
                      () => { }
                    );
                  }, 300);
                }
              }}
            >
              <Text style={styles.buttonText}>{showAddForm ? '❌ Close Form' : '➕ Add New Product'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c', marginTop: 10 }]} onPress={logout}>
              <Text style={styles.buttonText}>🚪 Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#3498db', marginTop: 10 }]}
              onPress={() => {
                fetchUserProfile();
                setShowProfileModal(true);
              }}
            >
              <Text style={styles.buttonText}>👤 Profile</Text>
            </TouchableOpacity>

            <Text style={styles.counter}>Total Suggestions: {count}</Text>
          </View>

          {/* SEARCH & FILTER */}
          <View style={styles.searchContainer}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="🔍 Search products..."
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                  if (text.trim() === '' && !filterCategory && !filterSeason && !filterColor) {
                    setFilteredItems(clothingItems);
                  }
                }}
                onSubmitEditing={applyFilters}
              />
              <TouchableOpacity style={styles.filterToggleButton} onPress={() => setShowFilters(!showFilters)}>
                <Text style={styles.filterToggleText}>⚙️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.searchButton} onPress={applyFilters}>
                <Text style={styles.searchButtonText}>🔍</Text>
              </TouchableOpacity>
            </View>

            {showFilters && (
              <View style={styles.filtersContainer}>
                <Text style={styles.filtersTitle}>📋 Filters</Text>
                <View style={styles.filterRow}>
                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Category</Text>
                    <View style={styles.filterSelector}>
                      <TouchableOpacity style={[styles.filterChip, !filterCategory && styles.filterChipActive]} onPress={() => setFilterCategory('')}>
                        <Text style={[styles.filterChipText, !filterCategory && styles.filterChipTextActive]}>All</Text>
                      </TouchableOpacity>
                      {CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat.id} style={[styles.filterChip, filterCategory === cat.id.toString() && styles.filterChipActive]} onPress={() => setFilterCategory(cat.id.toString())}>
                          <Text style={[styles.filterChipText, filterCategory === cat.id.toString() && styles.filterChipTextActive]}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Season</Text>
                    <View style={styles.filterSelector}>
                      <TouchableOpacity style={[styles.filterChip, !filterSeason && styles.filterChipActive]} onPress={() => setFilterSeason('')}>
                        <Text style={[styles.filterChipText, !filterSeason && styles.filterChipTextActive]}>All</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.filterChip, filterSeason === '1' && styles.filterChipActive]} onPress={() => setFilterSeason('1')}>
                        <Text style={[styles.filterChipText, filterSeason === '1' && styles.filterChipTextActive]}>☀️ Summer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.filterChip, filterSeason === '2' && styles.filterChipActive]} onPress={() => setFilterSeason('2')}>
                        <Text style={[styles.filterChipText, filterSeason === '2' && styles.filterChipTextActive]}>❄️ Winter</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.filterChip, filterSeason === '3' && styles.filterChipActive]} onPress={() => setFilterSeason('3')}>
                        <Text style={[styles.filterChipText, filterSeason === '3' && styles.filterChipTextActive]}>🌿 Spring</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.filterChip, filterSeason === '4' && styles.filterChipActive]} onPress={() => setFilterSeason('4')}>
                        <Text style={[styles.filterChipText, filterSeason === '4' && styles.filterChipTextActive]}>🍂 Fall</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Color</Text>
                    <TextInput style={styles.filterInput} placeholder="Enter color..." value={filterColor} onChangeText={setFilterColor} />
                  </View>

                  <View style={styles.filterActions}>
                    <TouchableOpacity style={[styles.filterActionButton, styles.applyButton]} onPress={applyFilters}>
                      <Text style={styles.filterActionButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterActionButton, styles.clearButton]} onPress={clearFilters}>
                      <Text style={styles.filterActionButtonText}>Clear All</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* ADD PRODUCT FORM */}
          {showAddForm && (
            <View ref={addFormRef}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>📦 Add New Product</Text>

                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput style={styles.input} placeholder="Product Name *" value={newProductName} onChangeText={setNewProductName} />

                <Text style={styles.inputLabel}>Category *</Text>
                <View>
                  <TouchableOpacity style={styles.categorySelector} onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
                    <Text style={styles.categorySelectorText}>
                      {newProductCategory ? CATEGORIES.find(c => c.id === parseInt(newProductCategory))?.name || 'Select Category' : '📂 Select Category *'}
                    </Text>
                    <Text style={styles.categorySelectorArrow}>▼</Text>
                  </TouchableOpacity>
                  {showCategoryPicker && (
                    <ScrollView style={styles.categoryList} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                      {CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat.id} style={[styles.categoryItem, newProductCategory === cat.id.toString() && styles.categoryItemSelected]} onPress={() => selectCategory(cat.id)}>
                          <Text style={[styles.categoryItemText, newProductCategory === cat.id.toString() && styles.categoryItemTextSelected]}>{cat.id}. {cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <Text style={styles.inputLabel}>Color *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Color * (e.g. Black, White, Blue)"
                  value={newProductColor}
                  onChangeText={setNewProductColor}
                />

                <Text style={styles.inputLabel}>Season *</Text>
                <View>
                  <TouchableOpacity style={styles.categorySelector} onPress={() => setShowSeasonPicker(!showSeasonPicker)}>
                    <Text style={styles.categorySelectorText}>
                      {selectedSeason ? SEASONS.find(s => s.id === parseInt(selectedSeason))?.name : '📅 Select Season'}
                    </Text>
                    <Text style={styles.categorySelectorArrow}>▼</Text>
                  </TouchableOpacity>
                  {showSeasonPicker && (
                    <ScrollView style={styles.categoryList} nestedScrollEnabled={true}>
                      {SEASONS.map((season) => (
                        <TouchableOpacity key={season.id} style={[styles.categoryItem, selectedSeason === season.id.toString() && styles.categoryItemSelected]} onPress={() => { setSelectedSeason(season.id.toString()); setShowSeasonPicker(false); }}>
                          <Text style={[styles.categoryItemText, selectedSeason === season.id.toString() && styles.categoryItemTextSelected]}>{season.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <Text style={styles.inputLabel}>Weather Type *</Text>
                <View>
                  <TouchableOpacity style={styles.categorySelector} onPress={() => setShowWeatherPicker(!showWeatherPicker)}>
                    <Text style={styles.categorySelectorText}>
                      {selectedWeather ? WEATHERS.find(w => w.id === parseInt(selectedWeather))?.name : '🌤️ Select Weather'}
                    </Text>
                    <Text style={styles.categorySelectorArrow}>▼</Text>
                  </TouchableOpacity>
                  {showWeatherPicker && (
                    <ScrollView style={styles.categoryList} nestedScrollEnabled={true}>
                      {WEATHERS.map((weather) => (
                        <TouchableOpacity key={weather.id} style={[styles.categoryItem, selectedWeather === weather.id.toString() && styles.categoryItemSelected]} onPress={() => { setSelectedWeather(weather.id.toString()); setShowWeatherPicker(false); }}>
                          <Text style={[styles.categoryItemText, selectedWeather === weather.id.toString() && styles.categoryItemTextSelected]}>{weather.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <Text style={styles.inputLabel}>Brand (Optional)</Text>
                <TextInput style={styles.input} placeholder="Brand (Optional)" value={newProductBrand} onChangeText={setNewProductBrand} />

                <Text style={styles.inputLabel}>Size (Optional)</Text>
                <TextInput style={styles.input} placeholder="Size (Optional)" value={newProductSize} onChangeText={setNewProductSize} />

                {/* PHOTO UPLOAD */}
                <View style={styles.photoUploadContainer}>
                  <Text style={styles.photoUploadTitle}>📸 Product Photo</Text>
                  <View style={styles.photoButtonsRow}>
                    <TouchableOpacity style={[styles.photoButton, { backgroundColor: '#3498db' }]} onPress={takePhoto}>
                      <Text style={styles.photoButtonText}>📷 Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.photoButton, { backgroundColor: '#2ecc71' }]} onPress={pickImage}>
                      <Text style={styles.photoButtonText}>🖼️ Gallery</Text>
                    </TouchableOpacity>
                  </View>

                  {selectedImage && (
                    <View style={styles.previewContainer}>
                      <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                      {uploadedImageUrl ? (
                        <Text style={styles.previewText}>✅ Uploaded!</Text>
                      ) : isUploading ? (
                        <Text style={styles.uploadingText}>⏳ Uploading...</Text>
                      ) : (
                        <Text style={styles.previewText}>📸 Selected</Text>
                      )}
                    </View>
                  )}

                  {selectedImage && !uploadedImageUrl && (
                    <TouchableOpacity style={[styles.button, { backgroundColor: '#9b59b6', marginTop: 10 }]} onPress={uploadPhoto} disabled={isUploading}>
                      <Text style={styles.buttonText}>{isUploading ? '⏳ Uploading...' : '☁️ Upload Photo'}</Text>
                    </TouchableOpacity>
                  )}

                  {uploadedImageUrl && <Text style={styles.uploadSuccessText}>✅ Photo uploaded successfully!</Text>}
                </View>

                <TouchableOpacity style={[styles.button, { backgroundColor: '#2ecc71', marginTop: 10 }]} onPress={addProduct}>
                  <Text style={styles.buttonText}>✅ Save Product</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* PRODUCT LIST */}
          {clothingItems.length > 0 ? (
            <View style={styles.features}>
              <Text style={styles.featureTitle}>
                👗 Wardrobe Products ({clothingItems.length})
              </Text>

              <ScrollView
                style={styles.productScrollView}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {groupProductsByCategory(filteredItems.length > 0 ? filteredItems : clothingItems).map((group) => (
                  <View key={group.categoryId} style={styles.categoryGroup}>
                    <Text style={styles.categoryGroupTitle}>
                      {group.categoryName} ({group.items.length})
                    </Text>
                    {group.items.map((item, index) => (
                      <View key={index} style={styles.productItem}>
                        <TouchableOpacity style={styles.productContent} onPress={() => openEditModal(item)}>
                          {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.productThumbnail} />}
                          <Text style={styles.productName}>• {item.name || 'Product'}{item.brand ? ` (${item.brand})` : ''}</Text>
                          <View style={styles.productDetails}>
                            {item.color && <Text style={styles.productDetail}>Color: {item.color}</Text>}
                            {item.size && <Text style={styles.productDetail}>Size: {item.size}</Text>}
                          </View>
                        </TouchableOpacity>
                        <View style={styles.productActions}>
                          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => openEditModal(item)}>
                            <Text style={styles.actionButtonText}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => deleteProduct(item.id)}>
                            <Text style={styles.actionButtonText}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>

              {/* Tüm ürün sayısı */}
              <View style={styles.totalCountContainer}>
                <Text style={styles.totalCountText}>
                  Total: {clothingItems.length} products
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>👗</Text>
              <Text style={styles.emptyTitle}>Wardrobe is empty</Text>
              <Text style={styles.emptyText}>Add your first product to get started!</Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#f39c12', marginTop: 15 }]}
                onPress={() => setShowAddForm(true)}
              >
                <Text style={styles.buttonText}>➕ Add Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* PROFİL MODAL */}
      <Modal visible={showProfileModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: '95%' }]}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {userProfile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={styles.profileName}>{userProfile?.fullName || 'User'}</Text>
              <Text style={styles.profileEmail}>{userProfile?.email || 'Email not set'}</Text>
              <Text style={styles.profileDate}>
                Member since: {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>

            <View style={styles.profileCard}>
              <Text style={styles.profileCardTitle}>📊 Subscription</Text>
              <View style={styles.profilePlanRow}>
                <Text style={styles.profilePlanName}>
                  {PLANS.find(p => p.id === userProfile?.plan)?.icon} {PLANS.find(p => p.id === userProfile?.plan)?.name || 'Free'}
                </Text>
                <View style={styles.subscriptionStatus}>
                  <View style={styles.greenTick} />
                  <Text style={styles.subscriptionStatusText}>Active</Text>
                </View>
              </View>
              <View style={styles.profilePhotoStats}>
                <Text style={styles.profilePhotoText}>
                  📸 Used: {userProfile?.usedPhotoCount ?? 0} photos
                </Text>
                <Text style={styles.profilePhotoText}>
                  📸 Limit: {userProfile?.plan === 3 ? '∞' : (userProfile?.monthlyPhotoLimit ?? 20)}
                </Text>
                <Text style={styles.profilePhotoText}>
                  📸 Remaining: {userProfile?.plan === 3 ? '∞' : (userProfile?.remainingPhotoCount ?? 0)}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#9b59b6', marginTop: 10 }]}
                onPress={() => {
                  setShowProfileModal(false);
                  setShowSubscriptionModal(true);
                }}
              >
                <Text style={styles.buttonText}>⬆️ Upgrade Plan</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#e74c3c', marginTop: 10 }]}
              onPress={() => {
                setShowProfileModal(false);
                logout();
              }}
            >
              <Text style={styles.buttonText}>🚪 Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#7f8c8d', marginTop: 10 }]}
              onPress={() => setShowProfileModal(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={showEditModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ Edit Product</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput style={styles.input} placeholder="Product name" value={editName} onChangeText={setEditName} />

              <Text style={styles.inputLabel}>Category *</Text>
              <View>
                <TouchableOpacity style={styles.categorySelector} onPress={() => setShowEditCategoryPicker(!showEditCategoryPicker)}>
                  <Text style={styles.categorySelectorText}>
                    {editCategory ? CATEGORIES.find(c => c.id === parseInt(editCategory))?.name || 'Select Category' : '📂 Select Category *'}
                  </Text>
                  <Text style={styles.categorySelectorArrow}>▼</Text>
                </TouchableOpacity>
                {showEditCategoryPicker && (
                  <ScrollView style={styles.categoryList} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity key={cat.id} style={[styles.categoryItem, editCategory === cat.id.toString() && styles.categoryItemSelected]} onPress={() => selectEditCategory(cat.id)}>
                        <Text style={[styles.categoryItemText, editCategory === cat.id.toString() && styles.categoryItemTextSelected]}>{cat.id}. {cat.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <Text style={styles.inputLabel}>Color *</Text>
              <TextInput style={styles.input} placeholder="Color" value={editColor} onChangeText={setEditColor} />

              <Text style={styles.inputLabel}>Season *</Text>
              <View>
                <TouchableOpacity style={styles.categorySelector} onPress={() => setShowEditSeasonPicker(!showEditSeasonPicker)}>
                  <Text style={styles.categorySelectorText}>
                    {editSeason ? SEASONS.find(s => s.id === parseInt(editSeason))?.name : '📅 Select Season'}
                  </Text>
                  <Text style={styles.categorySelectorArrow}>▼</Text>
                </TouchableOpacity>
                {showEditSeasonPicker && (
                  <ScrollView style={styles.categoryList} nestedScrollEnabled={true}>
                    {SEASONS.map((season) => (
                      <TouchableOpacity key={season.id} style={[styles.categoryItem, editSeason === season.id.toString() && styles.categoryItemSelected]} onPress={() => { setEditSeason(season.id.toString()); setShowEditSeasonPicker(false); }}>
                        <Text style={[styles.categoryItemText, editSeason === season.id.toString() && styles.categoryItemTextSelected]}>{season.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <Text style={styles.inputLabel}>Weather Type *</Text>
              <View>
                <TouchableOpacity style={styles.categorySelector} onPress={() => setShowEditWeatherPicker(!showEditWeatherPicker)}>
                  <Text style={styles.categorySelectorText}>
                    {editWeather ? WEATHERS.find(w => w.id === parseInt(editWeather))?.name : '🌤️ Select Weather'}
                  </Text>
                  <Text style={styles.categorySelectorArrow}>▼</Text>
                </TouchableOpacity>
                {showEditWeatherPicker && (
                  <ScrollView style={styles.categoryList} nestedScrollEnabled={true}>
                    {WEATHERS.map((weather) => (
                      <TouchableOpacity key={weather.id} style={[styles.categoryItem, editWeather === weather.id.toString() && styles.categoryItemSelected]} onPress={() => { setEditWeather(weather.id.toString()); setShowEditWeatherPicker(false); }}>
                        <Text style={[styles.categoryItemText, editWeather === weather.id.toString() && styles.categoryItemTextSelected]}>{weather.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <Text style={styles.inputLabel}>Brand (Optional)</Text>
              <TextInput style={styles.input} placeholder="Brand" value={editBrand} onChangeText={setEditBrand} />

              <Text style={styles.inputLabel}>Size (Optional)</Text>
              <TextInput style={styles.input} placeholder="Size" value={editSize} onChangeText={setEditSize} />

              {selectedProduct?.imageUrl && (
                <View style={styles.editPhotoContainer}>
                  <Text style={styles.inputLabel}>Current Photo</Text>
                  <Image source={{ uri: selectedProduct.imageUrl }} style={styles.editPhoto} />
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setShowEditModal(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={updateProduct}>
                  <Text style={styles.buttonText}>💾 Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* SUBSCRIPTION MODAL */}
      <Modal visible={showSubscriptionModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: '95%' }]}>
            <Text style={styles.modalTitle}>📊 Upgrade Your Plan</Text>
            <Text style={styles.modalSubtitle}>Choose the perfect plan</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {PLANS.map((plan) => {
                const isCurrent = subscription?.plan === plan.id;
                const isFree = plan.isFree;
                return (
                  <View key={plan.id} style={[styles.planCard, isCurrent && styles.planCardCurrent]}>
                    <View style={styles.planHeader}>
                      <Text style={styles.planIcon}>{plan.icon}</Text>
                      <View style={styles.planInfo}>
                        <Text style={[styles.planName, isCurrent && styles.planNameCurrent]}>
                          {plan.name} {isCurrent && '✅'}
                        </Text>
                        <Text style={styles.planPrice}>{isFree ? 'Free' : `₺${plan.price}/mo`}</Text>
                      </View>
                    </View>
                    <View style={styles.planFeatures}>
                      <Text style={styles.planFeature}>📸 {plan.limit === -1 ? 'Unlimited' : `${plan.limit}`} photos</Text>
                      <Text style={styles.planFeature}>🤖 {plan.id === 0 ? 'Basic' : 'Advanced'} AI</Text>
                      {plan.id >= 2 && <Text style={styles.planFeature}>📊 Trend analysis</Text>}
                      {plan.id >= 3 && <Text style={styles.planFeature}>👑 Personal stylist</Text>}
                    </View>
                    {!isCurrent && !isFree ? (
                      <TouchableOpacity style={[styles.planButton, { backgroundColor: plan.color }]} onPress={() => upgradePlan(plan.id)} disabled={isLoading}>
                        <Text style={styles.planButtonText}>{isLoading ? 'Processing...' : `Upgrade to ${plan.name}`}</Text>
                      </TouchableOpacity>
                    ) : isCurrent ? (
                      <Text style={styles.currentPlanText}>✅ Current Plan</Text>
                    ) : null}
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c', marginTop: 10 }]} onPress={() => setShowSubscriptionModal(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI OUTFIT MODAL */}
      <Modal visible={showOutfitModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: '95%' }]}>
            <Text style={styles.modalTitle}>🤖 Outfit Suggestions</Text>
            <Text style={styles.modalSubtitle}>AI-powered combinations</Text>

            {isLoadingSuggestions ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>🧠 AI is thinking...</Text>
                <Text style={styles.loadingSubText}>Creating perfect combinations for you</Text>
              </View>
            ) : outfitSuggestions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>👗</Text>
                <Text style={styles.emptyTitle}>No suggestions yet</Text>
                <Text style={styles.emptyText}>Add more products to your wardrobe</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {outfitSuggestions.map((suggestion, index) => (
                  <View key={index} style={styles.outfitCard}>
                    <View style={styles.outfitHeader}>
                      <Text style={styles.outfitName}>{suggestion.name || `Outfit ${index + 1}`}</Text>
                      <View style={styles.outfitScore}>
                        <Text style={styles.outfitScoreText}>⭐ {suggestion.suitabilityScore || 85}%</Text>
                      </View>
                    </View>
                    <Text style={styles.outfitDescription}>{suggestion.description || 'Perfect combination for you'}</Text>
                    {suggestion.items && suggestion.items.length > 0 && (
                      <View style={styles.outfitItems}>
                        <Text style={styles.outfitItemsTitle}>👔 Items:</Text>
                        {suggestion.items.map((item, idx) => (
                          <View key={idx} style={styles.outfitItem}>
                            <View style={styles.outfitItemContent}>
                              {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.outfitItemImage} />}
                              <View style={styles.outfitItemInfo}>
                                <Text style={styles.outfitItemName}>{item.name || 'Product'}</Text>
                                <Text style={styles.outfitItemDetail}>
                                  {item.category ? `${item.categoryName || item.category}` : ''}
                                  {item.color ? ` • ${item.color}` : ''}
                                </Text>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                    {suggestion.reason && <Text style={styles.outfitReason}>💡 {suggestion.reason}</Text>}
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c', marginTop: 10 }]} onPress={() => setShowOutfitModal(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI PREFERENCE MODAL */}
      <Modal visible={showPreferenceModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: '95%' }]}>
            <Text style={styles.modalTitle}>🤖 AI Outfit Suggestion</Text>
            <Text style={styles.modalSubtitle}>Customize your outfit preferences</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.preferenceLabel}>📍 Occasion</Text>
              <View style={styles.preferenceRow}>
                {['casual', 'formal', 'sport', 'business', 'party'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.preferenceChip,
                      outfitOccasion === item && styles.preferenceChipActive,
                    ]}
                    onPress={() => setOutfitOccasion(item)}
                  >
                    <Text style={[
                      styles.preferenceChipText,
                      outfitOccasion === item && styles.preferenceChipTextActive,
                    ]}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.preferenceLabel}>🕐 Time of Day</Text>
              <View style={styles.preferenceRow}>
                {['morning', 'afternoon', 'evening', 'night'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.preferenceChip,
                      outfitTimeOfDay === item && styles.preferenceChipActive,
                    ]}
                    onPress={() => setOutfitTimeOfDay(item)}
                  >
                    <Text style={[
                      styles.preferenceChipText,
                      outfitTimeOfDay === item && styles.preferenceChipTextActive,
                    ]}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.preferenceLabel}>🌤️ Weather</Text>
              <View style={styles.preferenceRow}>
                {['sunny', 'cloudy', 'rainy', 'snowy', 'windy'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.preferenceChip,
                      outfitWeather === item && styles.preferenceChipActive,
                    ]}
                    onPress={() => setOutfitWeather(item)}
                  >
                    <Text style={[
                      styles.preferenceChipText,
                      outfitWeather === item && styles.preferenceChipTextActive,
                    ]}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.preferenceLabel}>🌡️ Temperature (°C)</Text>
              <TextInput
                style={styles.preferenceInput}
                placeholder="Enter temperature (e.g. 20)"
                value={outfitTemperature}
                onChangeText={setOutfitTemperature}
                keyboardType="numeric"
              />

              <View style={styles.preferenceButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowPreferenceModal(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#9b59b6', flex: 2 }]}
                  onPress={() => {
                    setShowPreferenceModal(false);
                    getOutfitSuggestionWithPreferences();
                  }}
                >
                  <Text style={styles.buttonText}>🤖 Get Suggestion</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

// ================ STYLES ================

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { alignItems: 'center', marginVertical: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2c3e50' },
  subtitle: { fontSize: 16, color: '#7f8c8d', marginTop: 5 },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, marginVertical: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#2c3e50', marginBottom: 5, marginTop: 5 },
  loginButton: { backgroundColor: '#3498db', width: '100%' },
  registerButton: { backgroundColor: '#2ecc71', width: '100%' },
  button: { padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  toggleButton: { marginTop: 15, alignItems: 'center' },
  toggleButtonText: { fontSize: 16, color: '#7f8c8d' },
  toggleButtonHighlight: { color: '#3498db', fontWeight: 'bold', textDecorationLine: 'underline' },
  message: { fontSize: 18, textAlign: 'center', marginBottom: 10, color: '#34495e' },
  backendStatus: { textAlign: 'center', fontSize: 14, marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: '#ecf0f1', color: '#2c3e50' },
  counter: { textAlign: 'center', marginTop: 15, fontSize: 16, color: '#7f8c8d' },

  // Stillerin içine ekleyin
  productScrollView: {
    maxHeight: 500, // 4-5 ürün gösterir, gerisi scroll
  },
  categoryGroup: {
    marginBottom: 15,
  },
  categoryGroupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    paddingHorizontal: 5,
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    borderRadius: 8,
  },
  totalCountContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  totalCountText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },

  // Loading
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#3498db',
    borderTopColor: 'transparent',
  },
  loadingText: {
    marginTop: 10,
    color: 'white',
    fontSize: 16,
  },

  // Profile Styles
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  profileEmail: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 2,
  },
  profileDate: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
  },
  profileCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  profilePlanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePlanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  profilePhotoStats: {
    gap: 4,
  },
  profilePhotoText: {
    fontSize: 14,
    color: '#7f8c8d',
  },

  // Search & Filter
  searchContainer: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#f8f9fa' },
  searchButton: { backgroundColor: '#3498db', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', width: 50 },
  searchButtonText: { fontSize: 18, color: 'white' },
  filterToggleButton: { backgroundColor: '#f39c12', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', width: 50 },
  filterToggleText: { fontSize: 18 },
  filtersContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  filtersTitle: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 10 },
  filterRow: { gap: 10 },
  filterGroup: { marginBottom: 8 },
  filterLabel: { fontSize: 14, fontWeight: '500', color: '#7f8c8d', marginBottom: 5 },
  filterSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', marginRight: 5, marginBottom: 5 },
  filterChipActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
  filterChipText: { fontSize: 12, color: '#7f8c8d' },
  filterChipTextActive: { color: '#fff', fontWeight: '500' },
  filterInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, fontSize: 14, backgroundColor: '#f8f9fa' },
  filterActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
  filterActionButton: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  applyButton: { backgroundColor: '#2ecc71' },
  clearButton: { backgroundColor: '#e74c3c' },
  filterActionButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },

  // Subscription
  subscriptionCard: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 15, marginBottom: 15 },
  subscriptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  subscriptionTitle: { fontSize: 14, fontWeight: '600', color: '#7f8c8d' },
  subscriptionPlanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  subscriptionPlan: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  subscriptionStatus: { flexDirection: 'row', alignItems: 'center' },
  greenTick: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2ecc71', marginRight: 6 },
  subscriptionStatusText: { fontSize: 14, color: '#2ecc71', fontWeight: '500' },
  subscriptionButton: { backgroundColor: '#3498db', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 8 },
  subscriptionButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
  photoLimitContainer: { marginTop: 5 },
  photoLimitBar: { height: 8, backgroundColor: '#ecf0f1', borderRadius: 4, overflow: 'hidden' },
  photoLimitFill: { height: '100%', backgroundColor: '#2ecc71', borderRadius: 4 },
  photoLimitText: { fontSize: 12, color: '#7f8c8d', marginTop: 2, textAlign: 'center' },

  // Product List
  productItem: { backgroundColor: 'white', borderRadius: 10, padding: 12, marginVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productContent: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '500', color: '#2c3e50' },
  productDetails: { marginTop: 3 },
  productDetail: { fontSize: 14, color: '#7f8c8d' },
  productActions: { flexDirection: 'row', gap: 8 },
  actionButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 5 },
  editButton: { backgroundColor: '#f39c12' },
  deleteButton: { backgroundColor: '#e74c3c' },
  actionButtonText: { fontSize: 18 },
  productThumbnail: { width: 40, height: 40, borderRadius: 8, marginRight: 10 },

  // Category Selector
  categorySelector: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  categorySelectorText: { fontSize: 16, color: '#333' },
  categorySelectorArrow: { fontSize: 16, color: '#999' },
  categoryList: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 12, backgroundColor: '#fff', maxHeight: 200 },
  categoryItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  categoryItemSelected: { backgroundColor: '#3498db' },
  categoryItemText: { fontSize: 16, color: '#333' },
  categoryItemTextSelected: { color: '#fff', fontWeight: 'bold' },

  // Photo Upload
  photoUploadContainer: { marginTop: 10, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 10 },
  photoUploadTitle: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 10 },
  photoButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  photoButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  photoButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
  previewContainer: { marginTop: 10, alignItems: 'center' },
  previewImage: { width: 80, height: 80, borderRadius: 10, borderWidth: 2, borderColor: '#2ecc71' },
  previewText: { marginTop: 5, fontSize: 14, color: '#2ecc71', fontWeight: '500' },
  uploadingText: { marginTop: 5, fontSize: 14, color: '#f39c12', fontWeight: '500' },
  uploadSuccessText: { marginTop: 10, fontSize: 14, color: '#2ecc71', fontWeight: 'bold', textAlign: 'center' },

  // Edit Modal
  editPhotoContainer: { marginTop: 10, alignItems: 'center' },
  editPhoto: { width: 100, height: 100, borderRadius: 10, borderWidth: 2, borderColor: '#3498db', marginTop: 5 },

  // AI Outfit
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
  loadingSubText: { fontSize: 16, color: '#7f8c8d', marginTop: 10 },
  emptyContainer: { padding: 40, alignItems: 'center', backgroundColor: 'white', borderRadius: 15, marginVertical: 10 },
  emptyEmoji: { fontSize: 60 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginTop: 10 },
  emptyText: { fontSize: 16, color: '#7f8c8d', marginTop: 5, textAlign: 'center' },
  outfitCard: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e9ecef' },
  outfitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  outfitName: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  outfitScore: { backgroundColor: '#2ecc71', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  outfitScoreText: { fontSize: 14, color: 'white', fontWeight: '600' },
  outfitDescription: { fontSize: 14, color: '#7f8c8d', marginBottom: 12 },
  outfitItems: { marginTop: 8 },
  outfitItemsTitle: { fontSize: 14, fontWeight: '600', color: '#2c3e50', marginBottom: 8 },
  outfitItem: { backgroundColor: 'white', borderRadius: 8, padding: 10, marginBottom: 6, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  outfitItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  outfitItemImage: { width: 40, height: 40, borderRadius: 8, marginRight: 10 },
  outfitItemInfo: { flex: 1 },
  outfitItemName: { fontSize: 14, fontWeight: '500', color: '#2c3e50' },
  outfitItemDetail: { fontSize: 12, color: '#7f8c8d' },
  outfitReason: { marginTop: 10, fontSize: 14, color: '#3498db', fontStyle: 'italic' },

  // Preference
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 15,
    marginBottom: 10,
  },
  preferenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginRight: 6,
    marginBottom: 6,
  },
  preferenceChipActive: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },
  preferenceChipText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  preferenceChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  preferenceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  preferenceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },

  // Modal
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '90%', maxHeight: '95%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: '#7f8c8d', textAlign: 'center', marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelButton: { backgroundColor: '#e74c3c', flex: 1, marginRight: 5 },
  saveButton: { backgroundColor: '#2ecc71', flex: 1, marginLeft: 5 },

  // Plan Cards
  planCard: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  planCardCurrent: { borderColor: '#2ecc71', backgroundColor: '#f0fff4' },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  planIcon: { fontSize: 28, marginRight: 12 },
  planInfo: { flex: 1 },
  planName: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  planNameCurrent: { color: '#2ecc71' },
  planPrice: { fontSize: 14, color: '#7f8c8d' },
  planFeatures: { marginBottom: 10 },
  planFeature: { fontSize: 14, color: '#34495e', paddingVertical: 2 },
  planButton: { padding: 12, borderRadius: 8, alignItems: 'center' },
  planButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  currentPlanText: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#2ecc71', padding: 12 },

  // Features
  features: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginVertical: 10 },
  featureTitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 10 },
  featureItem: { fontSize: 16, color: '#34495e', paddingVertical: 5 },
});