import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Text, 
  Platform, 
  Alert, 
  Dimensions,
  Animated,
  ScrollView,
  StatusBar as RNStatusBar,
  FlatList,
  Modal,
  TextInput,
  Easing,
  PanResponder,
  TouchableHighlight,
  ActionSheetIOS,
  Appearance,
  Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import * as MailComposer from 'expo-mail-composer';
import * as Linking from 'expo-linking';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';

// Platform-specific icon imports
import { Ionicons } from '@expo/vector-icons'; // SF Symbols equivalent for iOS
import { MaterialIcons } from '@expo/vector-icons'; // Material Icons for Android

const { width, height } = Dimensions.get('window');

// Import date ideas from JSON file
import dateIdeasData from './dateIdeas.json';

// Date-friendly, cohesive color scheme
const categories = {
  romantic: { iconSet: 'FontAwesome5', icon: 'heart', color: '#FF6B8A', name: 'Romantic', description: 'Sweet & Intimate' },
  adventurous: { iconSet: 'MaterialCommunityIcons', icon: 'hiking', color: '#7FB069', name: 'Adventurous', description: 'Thrilling & Bold' },
  active: { iconSet: 'MaterialCommunityIcons', icon: 'run', color: '#5B9BD5', name: 'Active', description: 'Energetic & Sporty' },
  cozy: { iconSet: 'MaterialCommunityIcons', icon: 'home-heart', color: '#F4A261', name: 'Cozy', description: 'Comfortable & Warm' },
  fun: { iconSet: 'MaterialCommunityIcons', icon: 'party-popper', color: '#E76F51', name: 'Fun', description: 'Playful & Entertaining' },
  foodie: { iconSet: 'MaterialCommunityIcons', icon: 'food', color: '#E9C46A', name: 'Foodie', description: 'Culinary & Delicious' },
  chill: { iconSet: 'Feather', icon: 'coffee', color: '#8B9DC3', name: 'Chill', description: 'Relaxed & Peaceful' },
  spontaneous: { iconSet: 'MaterialCommunityIcons', icon: 'dice-multiple', color: '#F7931E', name: 'Spontaneous', description: 'Impulsive & Exciting' },
  budget: { iconSet: 'FontAwesome5', icon: 'dollar-sign', color: '#6A994E', name: 'Budget-Friendly', description: 'Affordable & Smart' },
  luxury: { iconSet: 'MaterialCommunityIcons', icon: 'diamond-stone', color: '#C9A87D', name: 'Luxury', description: 'Premium & Exclusive' },
  random: { iconSet: 'MaterialCommunityIcons', icon: 'slot-machine', color: '#D4A5A5', name: 'Random', description: 'Spin & Discover' },
};

// Platform-specific icon mapping
const getPlatformIcon = (iosIcon, androidIcon, size = 24, color = '#000') => {
  if (Platform.OS === 'ios') {
    return <Ionicons name={iosIcon} size={size} color={color} />;
  } else {
    return <MaterialIcons name={androidIcon} size={size} color={color} />;
  }
};

// Platform-specific category icons
const getCategoryIcon = (category, size = 32, color = null) => {
  const iconMap = {
    romantic: {
      ios: 'heart',
      android: 'favorite',
      fallback: 'heart'
    },
    adventurous: {
      ios: 'trending-up',
      android: 'trending-up',
      fallback: 'hiking'
    },
    active: {
      ios: 'fitness',
      android: 'directions-run',
      fallback: 'run'
    },
    cozy: {
      ios: 'home',
      android: 'home',
      fallback: 'home-heart'
    },
    fun: {
      ios: 'happy',
      android: 'celebration',
      fallback: 'party-popper'
    },
    foodie: {
      ios: 'restaurant',
      android: 'restaurant',
      fallback: 'food'
    },
    chill: {
      ios: 'cafe',
      android: 'local-cafe',
      fallback: 'coffee'
    },
    spontaneous: {
      ios: 'dice',
      android: 'casino',
      fallback: 'dice-multiple'
    },
    budget: {
      ios: 'wallet-outline',
      android: 'account-balance-wallet',
      fallback: 'dollar-sign'
    },
    luxury: {
      ios: 'diamond',
      android: 'diamond',
      fallback: 'diamond-stone'
    },
    random: {
      ios: 'shuffle',
      android: 'shuffle',
      fallback: 'slot-machine'
    }
  };

  const iconConfig = iconMap[category] || iconMap.random;
  const defaultColor = color || categories[category]?.color || '#FF6B8A';

  if (Platform.OS === 'ios') {
    return <Ionicons name={iconConfig.ios} size={size} color={defaultColor} />;
  } else if (Platform.OS === 'android') {
    return <MaterialIcons name={iconConfig.android} size={size} color={defaultColor} />;
  } else {
    // Fallback to original icon system
    const IconComponent = iconConfig.fallback.includes('FontAwesome5') ? FontAwesome5 : 
                         iconConfig.fallback.includes('Feather') ? Feather : MaterialCommunityIcons;
    return <IconComponent name={iconConfig.fallback} size={size} color={defaultColor} />;
  }
};

// Platform-specific budget icons
const getBudgetIcon = (budget, size = 20) => {
  const budgetConfig = {
    low: {
      ios: 'wallet-outline',
      android: 'account-balance-wallet',
      label: '$',
      color: '#6A994E',
      description: 'Budget Friendly'
    },
    medium: {
      ios: 'wallet',
      android: 'account-balance-wallet',
      label: '$$',
      color: '#F4A261',
      description: 'Mid-Range'
    },
    high: {
      ios: 'diamond',
      android: 'diamond',
      label: '$$$',
      color: '#C9A87D',
      description: 'Premium'
    }
  };
  
  const config = budgetConfig[budget] || budgetConfig.medium;
  
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: config.color + '15',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 8,
    }}>
      {Platform.OS === 'ios' ? (
        <Ionicons name={config.ios} size={size} color={config.color} />
      ) : (
        <MaterialIcons name={config.android} size={size} color={config.color} />
      )}
      <Text style={{ fontSize: size * 0.6, fontWeight: 'bold', color: config.color, marginLeft: 2 }}>{config.label}</Text>
    </View>
  );
};

// Platform-specific location icons
const getLocationIcon = (location, size = 20) => {
  const locationConfig = {
    indoor: {
      ios: 'home-outline',
      android: 'home'
    },
    outdoor: {
      ios: 'leaf-outline',
      android: 'park'
    }
  };
  
  const config = locationConfig[location] || locationConfig.indoor;
  
  if (Platform.OS === 'ios') {
    return <Ionicons name={config.ios} size={size} color="#8B93C3" />;
  } else {
    return <MaterialIcons name={config.android} size={size} color="#8B9C3" />;
  }
};

// Platform-specific action icons
const getActionIcon = (action, size = 20, color = '#FF6B8A') => {
  const actionIcons = {
    history: {
      ios: 'time-outline',
      android: 'history'
    },
    reset: {
      ios: 'refresh-outline',
      android: 'refresh'
    },
    share: {
      ios: 'share-outline',
      android: 'share'
    },
    calendar: {
      ios: 'calendar-outline',
      android: 'event'
    },
    reminder: {
      ios: 'notifications-outline',
      android: 'notifications'
    },
    close: {
      ios: 'close',
      android: 'close'
    },
    email: {
      ios: 'mail-outline',
      android: 'email'
    },
    sms: {
      ios: 'chatbubble-outline',
      android: 'sms'
    }
  };
  
  const iconConfig = actionIcons[action] || actionIcons.close;
  
  if (Platform.OS === 'ios') {
    return <Ionicons name={iconConfig.ios} size={size} color={color} />;
  } else {
    return <MaterialIcons name={iconConfig.android} size={size} color={color} />;
  }
};

// Modern CategoryIcon - Updated to use platform-specific icons
const CategoryIcon = ({ category, size = 32, color = null, isSelected = false }) => {
  const { color: defaultColor } = categories[category] || {};
  const iconColor = color || defaultColor;
  
  return (
    <View style={[
      styles.categoryIconContainer,
      {
        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#fff',
        borderColor: isSelected ? 'rgba(255,255,255,0.3)' : 'transparent',
      }
    ]}>
      {getCategoryIcon(category, size, iconColor)}
    </View>
  );
};

// Modern BudgetIcon
const BudgetIcon = ({ budget, size = 20 }) => {
  return getBudgetIcon(budget, size);
};

// Modern LocationIcon
const LocationIcon = ({ location, size = 20 }) => {
  return getLocationIcon(location, size);
};

// Platform-specific color themes
const createTheme = (colorScheme) => {
  const isDark = colorScheme === 'dark';
  
  return {
    // Platform-specific base colors
    primary: Platform.select({
      ios: isDark ? '#07F' : '#007AFF', // iOS blue
      android: isDark ? '#BB86FC' : '#6200EE', // Material Design purple
      default: isDark ? '#07F' : '#007AFF'
    }),    
    secondary: Platform.select({
      ios: isDark ? '#5856D6' : '#5856D6', // iOS secondary blue
      android: isDark ? '#3DAC6D' : '#3DAC6D', // Material Design teal
      default: isDark ? '#5856D6' : '#5856D6'
    }),
    
    // Background colors
    background: Platform.select({
      ios: isDark ? '#000' : '#F2F2F7', // iOS system background
      android: isDark ? '#121212' : '#FAFAFA', // Material Design background
      default: isDark ? '#000' : '#F2F2F7'
    }),
    
    surface: Platform.select({
      ios: isDark ? '#11E' : '#FFFFFF', // iOS secondary background
      android: isDark ? '#110E' : '#FFFFFF', // Material Design surface
      default: isDark ? '#11E' : '#FFFFFF'
    }),
    
    // Text colors
    text: Platform.select({
      ios: isDark ? '#FFFFFF' : '#000000', // iOS label
      android: isDark ? '#FFFFFF' : '#000000', // Material Design on-surface
      default: isDark ? '#FFFFFF' : '#000000'
    }),
    
    textSecondary: Platform.select({
      ios: isDark ? '#8E8E93' : '#8E8E93', // iOS secondary label
      android: isDark ? '#B3FFFFFF' : '#990000', // Material Design on-surface variant
      default: isDark ? '#8E8E93' : '#8E8E93'
    }),
    
    // Card colors
    card: Platform.select({
      ios: isDark ? '#22E' : '#FFFFFF', // iOS tertiary background
      android: isDark ? '#22D' : '#FFFFFF', // Material Design surface variant
      default: isDark ? '#22E' : '#FFFFFF'
    }),
    
    // Border colors
    border: Platform.select({
      ios: isDark ? '#38383A' : '#C6C6C8', // iOS separator
      android: isDark ? '#22D' : '#E0E0E0', // Material Design outline
      default: isDark ? '#38383A' : '#C6C6C8'
    }),
    
    // Status colors
    success: Platform.select({
      ios: isDark ? '#34C759' : '#34C759', // iOS green
      android: isDark ? '#4AF50A' : '#4AF50A', // Material Design green
      default: isDark ? '#34C759' : '#34C759'
    }),
    
    error: Platform.select({
      ios: isDark ? '#FF3B30' : '#FF3B30', // iOS red
      android: isDark ? '#F44336' : '#F44336', // Material Design red
      default: isDark ? '#FF3B30' : '#FF3B30'
    }),
    
    warning: Platform.select({
      ios: isDark ? '#FF9500' : '#FF9500', // iOS orange
      android: isDark ? '#FF9800' : '#FF9800', // Material Design orange
      default: isDark ? '#FF9500' : '#FF9500'
    }),
    
    // DateUnveil specific colors (adapted for dark mode)
    dateUnveil: {
      romantic: isDark ? '#FF6B8A' : '#FF6B8A',
      adventurous: isDark ? '#7FB069' : '#7FB069',
      active: isDark ? '#5B9BD5' : '#5B9BD5',
      cozy: isDark ? '#F4A261' : '#F4A261',
      fun: isDark ? '#E76F51' : '#E76F51',
      foodie: isDark ? '#E9C46A' : '#E9C46A',
      chill: isDark ? '#8B9DC3' : '#8B9DC3',
      spontaneous: isDark ? '#F7931E' : '#F7931E',
      budget: isDark ? '#6A994E' : '#6A994E',
      luxury: isDark ? '#C9A87D' : '#C9A87D',
      random: isDark ? '#D4A5A5' : '#D4A5A5'
    }
  };
};

// Custom hook for color scheme
const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });
    
    return () => subscription?.remove();
  }, []);
  
  return colorScheme;
};

// Platform-specific alert/action sheet helper
const showPlatformAlert = (title, message, options, onSelect) => {
  if (Platform.OS === 'ios') {
    const actionSheetOptions = [...options.map(opt => opt.text), 'Cancel'];
    const cancelButtonIndex = actionSheetOptions.length - 1;
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: actionSheetOptions,
        cancelButtonIndex,
        title,
        message,
      },
      (buttonIndex) => {
        if (buttonIndex !== cancelButtonIndex && onSelect) {
          onSelect(options[buttonIndex]);
        }
      }
    );
  } else {
    Alert.alert(title, message, options, onSelect);
  }
};

// Platform-specific sharing helper
const showShareOptions = (idea, categoryInfo, onEmailShare, onSMSShare) => {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Share via Email', 'Share via SMS', 'Cancel'],
        cancelButtonIndex: 2,
        title: 'Share Date Idea',
        message: 'Choose how you\'d like to share this amazing date idea',
      },
      (buttonIndex) => {
        if (buttonIndex === 0) onEmailShare();
        if (buttonIndex === 1) onSMSShare();
      }
    );
  } else {
    Alert.alert(
      'Share Date Idea',
      'Choose how you\'d like to share this amazing date idea',
      [
        { text: 'Email', onPress: onEmailShare },
        { text: 'SMS', onPress: onSMSShare },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }
};

// Platform-specific confirmation helper
const showConfirmation = (title, message, onConfirm, onCancel) => {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Confirm', 'Cancel'],
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
        title,
        message,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) onConfirm();
        if (buttonIndex === 1) onCancel();
      }
    );
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'Confirm', onPress: onConfirm },
      ]
    );
  }
};

// Tutorial Component
const Tutorial = ({ visible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const tutorialSteps = [
    {
      title: "Welcome to DateUnveil",
      message: "Discover 100 creative date ideas. Tap a card to reveal, filter by category, and save your favorites.",
      iconSet: 'MaterialCommunityIcons',
      icon: 'cards-heart',
      color: "#007AFF"
    },
    {
      title: "Share & Save",
      message: "Found a great idea? Share it via email, message, or add to your calendar.",
      iconSet: 'MaterialCommunityIcons',
      icon: 'share-variant',
      color: "#34C759"
    },
    {
      title: "You're Ready!",
      message: "Start exploring your 100 date ideas now.",
      iconSet: 'MaterialCommunityIcons',
      icon: 'rocket-launch',
      color: "#FF9500"
    }
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, currentStep]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipTutorial = () => {
    onComplete();
  };

  if (!visible) return null;

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <View style={styles.tutorialFullScreen}>
      <Animated.View 
        style={[
          styles.tutorialContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.tutorialHeader}> 
          <View style={[styles.tutorialIconContainer, { backgroundColor: currentTutorial.color }]}> 
            {currentTutorial.iconSet === 'MaterialCommunityIcons' ? ( 
              <MaterialCommunityIcons name={currentTutorial.icon} size={44} color="#FFFFFF" /> 
            ) : currentTutorial.iconSet === 'FontAwesome5' ? ( 
              <FontAwesome5 name={currentTutorial.icon} size={40} color="#FFFFFF" /> 
            ) : ( 
              <Feather name={currentTutorial.icon} size={40} color="#FFFFFF" /> 
            )} 
          </View> 
          <Text style={styles.tutorialTitle}>{currentTutorial.title}</Text> 
          <Text style={styles.tutorialSubtitle}>{currentTutorial.message}</Text>
        </View>
        
        <View style={styles.tutorialProgress}>
          {tutorialSteps.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.progressDot,
                index === currentStep && [styles.progressDotActive, { backgroundColor: currentTutorial.color }]
              ]} 
            />
          ))}
        </View>
        
        <View style={styles.tutorialButtons}>
          <TouchableOpacity onPress={skipTutorial} style={[styles.nextButton, { backgroundColor: '#F2F2F7' }]}> 
            <Text style={[styles.nextButtonText, { color: '#1D1D1F' }]}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={nextStep} style={[styles.nextButton, { backgroundColor: currentTutorial.color }]}> 
            <Text style={styles.nextButtonText}>
              {currentStep === tutorialSteps.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// Enhanced Small Card Component
const SmallCard = ({ item, sequenceNumber, isRevealed, onPress }) => {
  const CardTouchable = Platform.OS === 'ios' ? TouchableHighlight : TouchableOpacity;
  return (
    <CardTouchable
      onPress={onPress}
      style={[
        styles.smallCard,
        { justifyContent: 'center', alignItems: 'center' },
        isRevealed && {
          backgroundColor: '#F0F0F0',
          opacity: 0.8,
          borderColor: '#7FB069',
          borderWidth: 2
        }
      ]}
      underlayColor={Platform.OS === 'ios' ? '#f0f0f0' : undefined}
      activeOpacity={Platform.OS === 'android' ? 0.85 : undefined}
    >
      <View style={{ alignItems: 'center' }}>
        <Text style={[
          { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
          isRevealed && { color: '#07F' }
        ]}>
          {sequenceNumber}
        </Text>
        {isRevealed && (
          <MaterialCommunityIcons 
            name="check-circle" 
            size={16} 
            color="#007F" 
            style={{ marginTop: 4 }}
          />
        )}
      </View>
    </CardTouchable>
  );
};

// Spinning Wheel Component
const SpinningWheel = ({ visible, onClose, onSelectCard }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [lastPanValue, setLastPanValue] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const lastPanTime = useRef(Date.now());
  const lastPanPosition = useRef({ x: 0, y: 0 });

  const spinWheel = (initialVelocity = 0) => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedNumber(null);
    
    // Random number between 1-100
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    
    // Calculate rotation based on velocity or use default
    const baseVelocity = Math.abs(initialVelocity) > 0.5 ? Math.abs(initialVelocity) * 2000 : 1500;
    const fullSpins = 3 + Math.random() * 4; // 3-7 full spins
    const targetAngle = (randomNumber - 1) * 3.6; // 360° / 100 = 3.6° per number
    const totalRotation = fullSpins * 360 + targetAngle;
    
    Animated.timing(spinAnim, {
      toValue: totalRotation,
      duration: baseVelocity,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      setIsSpinning(false);
      setSelectedNumber(randomNumber);
      
      // Auto-close after showing result
      setTimeout(() => {
        onSelectCard(randomNumber);
        onClose();
      }, 2000);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isSpinning,
      onMoveShouldSetPanResponder: () => !isSpinning,
      onPanResponderGrant: (evt) => {
        lastPanPosition.current = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
        lastPanTime.current = Date.now();
      },
      onPanResponderMove: (evt) => {
        if (isSpinning) return;
        
        const currentPosition = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
        const currentTime = Date.now();
        
        // Calculate distance moved
        const deltaX = currentPosition.x - lastPanPosition.current.x;
        const deltaY = currentPosition.y - lastPanPosition.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Calculate velocity
        const timeDelta = currentTime - lastPanTime.current;
        const velocityMagnitude = timeDelta > 0 ? distance / timeDelta : 0;
        setVelocity(velocityMagnitude);
        
        // Calculate rotation based on movement
        const newRotation = lastPanValue + distance * 0.3;
        setLastPanValue(newRotation);
        
        // Update wheel rotation in real-time
        spinAnim.setValue(newRotation);
        
        lastPanPosition.current = currentPosition;
        lastPanTime.current = currentTime;
      },
      onPanResponderRelease: () => {
        if (isSpinning) return;
        
        // Start spinning with the calculated velocity
        spinWheel(velocity / 50);
      },
    })
  ).current;

  const renderWheelSegments = () => {
    const segments = [];
    for (let i = 1; i <= 100; i++) {
      const angle = (i - 1) * 3.6;
      const isEven = i % 2 === 0;
      
      segments.push(
        <View
          key={i}
          style={[
            styles.wheelSegment,
            {
              transform: [{ rotate: `${angle}deg` }],
              backgroundColor: isEven ? '#FF6B9D' : '#FF8E8E',
            }
          ]}
        >
          <Text style={styles.wheelNumber}>{i}</Text>
        </View>
      );
    }
    return segments;
  };

  if (!visible) return null;

  return (
    <View style={styles.wheelOverlay}>
      <View style={styles.wheelContainer}>
        <View style={styles.wheelHeader}>
          <Text style={styles.wheelTitle}>🎰 Spin the Wheel! 🎰</Text>
          <TouchableOpacity onPress={onClose} style={styles.wheelCloseButton}>
            <MaterialCommunityIcons name="close" size={24} color="#3F51B5" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.wheelContent}>
          <View style={styles.wheelWrapper}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.wheel,
                {
                  transform: [{ rotate: spinAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }) }],
                }
              ]}
            >
              {renderWheelSegments()}
            </Animated.View>
            
            {/* Center pointer */}
            <View style={styles.wheelPointer} />
          </View>
          
          {selectedNumber && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>🎉 Card {selectedNumber} Selected! 🎉</Text>
            </View>
          )}
          
          <View style={styles.wheelInstructions}>
            <Text style={styles.wheelInstructionText}>👆 Swipe to spin the wheel!</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Enhanced Category Filter Component
const CategoryFilter = ({ selectedCategory, onCategorySelect, onRandomSelect }) => {
  return (
    <View style={styles.categoryFilterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        <TouchableOpacity 
          style={[
            styles.categoryFilterButton, 
            !selectedCategory && styles.categoryFilterButtonActive
          ]}
          onPress={() => onCategorySelect(null)}
        >
          <Text style={[
            styles.categoryFilterText,
            !selectedCategory && styles.categoryFilterTextActive
          ]}>All</Text>
        </TouchableOpacity>
        
        {Object.entries(categories).map(([key, category]) => (
          <TouchableOpacity 
            key={key}
            style={[
              styles.categoryFilterButton,
              selectedCategory === key && styles.categoryFilterButtonActive
            ]}
            onPress={() => {
              if (key === 'random') {
                onRandomSelect();
              } else {
                onCategorySelect(key);
              }
            }}
          >
            <Text style={[
              styles.categoryFilterText,
              selectedCategory === key && styles.categoryFilterTextActive
            ]}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Add share function
const shareDateIdea = async (item) => {
  try {
    const categoryInfo = categories[item.category] || categories.romantic;
    const shareMessage = `I just discovered this amazing date idea: ${item.idea}\n\nCategory: ${categoryInfo.name}\nBudget: ${item.budget === 'low' ? '$' : item.budget === 'medium' ? '$$' : '$$$'}\nLocation: ${item.location}\n\nShared via DateUnveil\n\nLet's make it happen!`;
    
    await Share.share({
      message: shareMessage,
      title: 'Amazing Date Idea',
    });
  } catch (error) {
    console.error('Share error:', error);
  }
};

// Enhanced Expanded Card Component
const ExpandedCard = ({ item, onClose, onShareEmail, onShareSMS, onAddToCalendar, onSetReminder }) => {
  const categories = {
    romantic: { name: 'Romantic', icon: '💕', color: '#FF6B8A' },
    adventurous: { name: 'Adventurous', icon: '🏔️', color: '#7FB069' },
    active: { name: 'Active', icon: '⚡', color: '#5B9BD5' },
    cozy: { name: 'Cozy', icon: '🏠', color: '#F4A261' },
    fun: { name: 'Fun', icon: '🎉', color: '#E76F51' },
    foodie: { name: 'Foodie', icon: '🍕', color: '#E9C46A' },
    chill: { name: 'Chill', icon: '😌', color: '#8B9DC3' },
    spontaneous: { name: 'Spontaneous', icon: '🎲', color: '#F7931E' },
    budget: { name: 'Budget-Friendly', icon: '💰', color: '#6A994E' },
    luxury: { name: 'Luxury', icon: '💎', color: '#C9A87D' },
    random: { name: 'Random', icon: '🎰', color: '#D4A5A5' },
  };
  const categoryInfo = categories[item.category] || categories.random;
  
  return (
    <View style={styles.expandedCardOverlay}>
      <View style={styles.expandedCardContent}>
        {/* Header */}
        <View style={styles.expandedCardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.expandedCardNumber}>#{item.sequenceNumber}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}> 
              <Text style={styles.categoryBadgeText}>{categoryInfo.icon}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#86868B" />
          </TouchableOpacity>
        </View>
        
        {/* Main Content */}
        <View style={styles.expandedCardBody}>
          {typeof item.idea === 'undefined' ? (
            <Text style={styles.dateIdeaText}>Loading...</Text>
          ) : (
            <Text style={styles.dateIdeaText}>
              {item.placeholder ? 'Date idea coming soon!' : (item.idea || 'No idea found')}
            </Text>
          )}
          
          {/* Quick Info */}
          <View style={styles.quickInfoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Budget</Text>
              <Text style={styles.infoValue}>
                {item.budget === 'low' ? '$' : item.budget === 'medium' ? '$$' : '$$$'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {item.location === 'indoor' ? 'Indoor' : 'Outdoor'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.expandedActionButtons}>
          <TouchableOpacity 
            style={[styles.expandedActionButton, { backgroundColor: '#007AFF' }]} 
            onPress={() => shareDateIdea(item)}
          >
            <MaterialCommunityIcons name="share-variant" size={18} color="#FFFFFF" />
            <Text style={styles.expandedActionButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.expandedActionButton, { backgroundColor: '#FF9500' }]} 
            onPress={onAddToCalendar}
          >
            <MaterialCommunityIcons name="calendar" size={18} color="#FFFFFF" />
            <Text style={styles.expandedActionButtonText}>Calendar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.expandedActionButton, { backgroundColor: '#AF52DE' }]} 
            onPress={onSetReminder}
          >
            <MaterialCommunityIcons name="bell" size={18} color="#FFFFFF" />
            <Text style={styles.expandedActionButtonText}>Remind</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Advanced Calendar Modal Component
const CalendarModal = ({ visible, onClose, onSchedule, dateIdea }) => {
  const categories = {
    romantic: { name: 'Romantic', icon: '💕', color: '#FF6B8A' },
    adventurous: { name: 'Adventurous', icon: '🏔️', color: '#7FB069' },
    active: { name: 'Active', icon: '⚡', color: '#5B9BD5' },
    cozy: { name: 'Cozy', icon: '🏠', color: '#F4A261' },
    fun: { name: 'Fun', icon: '🎉', color: '#E76F51' },
    foodie: { name: 'Foodie', icon: '🍕', color: '#E9C46A' },
    chill: { name: 'Chill', icon: '😌', color: '#8B9DC3' },
    spontaneous: { name: 'Spontaneous', icon: '🎲', color: '#F7931E' },
    budget: { name: 'Budget-Friendly', icon: '💰', color: '#6A994E' },
    luxury: { name: 'Luxury', icon: '💎', color: '#C9A87D' },
    random: { name: 'Random', icon: '🎰', color: '#D4A5A5' },
  };
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [customTitle, setCustomTitle] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible && dateIdea) {
      const categoryInfo = categories[dateIdea.category] || categories.romantic;
      setCustomTitle(`DateUnveil: ${dateIdea.idea}`);
      setCustomLocation('Your chosen location');
      setCustomNotes(`Category: ${categoryInfo.name}\nBudget: ${dateIdea.budget === 'low' ? '$' : dateIdea.budget === 'medium' ? '$$' : '$$$'}\nLocation: ${dateIdea.location}`);
    }
  }, [visible, dateIdea]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSchedule = () => {
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(selectedTime.getHours());
    scheduledDateTime.setMinutes(selectedTime.getMinutes());
    
    onSchedule({
      title: customTitle,
      location: customLocation,
      notes: customNotes,
      startDate: scheduledDateTime,
      endDate: new Date(scheduledDateTime.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
    });
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      setSelectedTime(time);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.calendarModalOverlay}>
        <View style={styles.calendarModalContent}>
          <View style={styles.calendarModalHeader}>
            <Text style={styles.calendarModalTitle}>Schedule Your Date</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={16} color="#FF8E8E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.calendarModalBody}>
            <View style={styles.dateTimeSection}>
              <Text style={styles.sectionTitle}>📅 Date & Time</Text>
              
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateTimeButtonContent}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#FF6B8A" />
                  <View style={styles.dateTimeTextContainer}>
                    <Text style={styles.dateTimeLabel}>Date</Text>
                    <Text style={styles.dateTimeValue}>{formatDate(selectedDate)}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#FF6B8A" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <View style={styles.dateTimeButtonContent}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#FF6B8A" />
                  <View style={styles.dateTimeTextContainer}>
                    <Text style={styles.dateTimeLabel}>Time</Text>
                    <Text style={styles.dateTimeValue}>{formatTime(selectedTime)}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#FF6B8A" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>📝 Event Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title:</Text>
                <TextInput
                  style={styles.textInput}
                  value={customTitle}
                  onChangeText={setCustomTitle}
                  placeholder="Enter event title"
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location:</Text>
                <TextInput
                  style={styles.textInput}
                  value={customLocation}
                  onChangeText={setCustomLocation}
                  placeholder="Enter location"
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes:</Text>
                <TextInput
                  style={styles.textInput}
                  value={customNotes}
                  onChangeText={setCustomNotes}
                  placeholder="Add any additional notes"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.calendarModalActions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSchedule} style={styles.scheduleButton}>
              <Text style={styles.scheduleButtonText}>Schedule Date</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
            maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year from now
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            is24Hour={false}
          />
        )}
      </View>
    </Modal>
  );
};

// Invitation Modal Component
const InvitationModal = ({ visible, onClose, invitationData }) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');

  const sendEmailInvitation = () => {
    if (!recipientEmail.trim()) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    const subject = `Date Invitation: ${invitationData.title}`;
    const body = `Hi there!

I'd love to invite you on a special date:

${invitationData.title}
Date: ${invitationData.startDate.toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Time: ${invitationData.startDate.toLocaleTimeString('en-US', { 
  hour: 'numeric', 
  minute: '2-digit',
  hour12: true 
})}
Location: ${invitationData.location}

${personalMessage ? `\nPersonal Message:\n${personalMessage}\n` : ''}

${invitationData.notes}

I'm looking forward to spending time with you!

Best regards,
[Your name]

---
Sent via DateUnveil`;

    MailComposer.composeAsync({
      recipients: [recipientEmail],
      subject: subject,
      body: body,
    }).catch(() => Alert.alert('Error', 'Unable to open email composer.'));
  };

  const sendSMSInvitation = () => {
    if (!recipientPhone.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    const message = `Hi! I'd love to invite you on a special date:

${invitationData.title}
Date: ${invitationData.startDate.toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Time: ${invitationData.startDate.toLocaleTimeString('en-US', { 
  hour: 'numeric', 
  minute: '2-digit',
  hour12: true 
})}
Location: ${invitationData.location}

${personalMessage ? `\nPersonal Message:\n${personalMessage}\n` : ''}

${invitationData.notes}

Looking forward to it!

---
Sent via DateUnveil`;

    let smsUrl = '';
    if (Platform.OS === 'ios') {
      smsUrl = `sms:${recipientPhone}&body=${encodeURIComponent(message)}`;
    } else {
      smsUrl = `sms:${recipientPhone}?body=${encodeURIComponent(message)}`;
    }
    Linking.openURL(smsUrl).catch(() => Alert.alert('Error', 'Unable to open SMS app.'));
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.invitationModalOverlay}>
        <View style={styles.invitationModalContent}>
          <View style={styles.invitationModalHeader}>
            <Text style={styles.invitationModalTitle}>Send Invitation</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={16} color="#FF8E8E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.invitationModalBody}>
            <View style={styles.invitationPreview}>
              <Text style={styles.invitationPreviewTitle}>Preview:</Text>
              <Text style={styles.invitationPreviewText}>{invitationData.title}</Text>
              <Text style={styles.invitationPreviewText}>
                {invitationData.startDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <Text style={styles.invitationPreviewText}>
                {invitationData.startDate.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </Text>
              <Text style={styles.invitationPreviewText}>{invitationData.location}</Text>
            </View>

            <View style={styles.recipientSection}>
              <Text style={styles.sectionTitle}>📧 Recipient Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address:</Text>
                <TextInput
                  style={styles.textInput}
                  value={recipientEmail}
                  onChangeText={setRecipientEmail}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number:</Text>
                <TextInput
                  style={styles.textInput}
                  value={recipientPhone}
                  onChangeText={setRecipientPhone}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Personal Message (Optional):</Text>
                <TextInput
                  style={styles.textInput}
                  value={personalMessage}
                  onChangeText={setPersonalMessage}
                  placeholder="Add a personal touch to your invitation"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.invitationModalActions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={sendEmailInvitation} style={styles.emailButton}>
              <MaterialCommunityIcons name="email-send" size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.emailButtonText}>Send Email</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={sendSMSInvitation} style={styles.smsButton}>
              <MaterialCommunityIcons name="message-text" size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.smsButtonText}>Send SMS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Advanced Reminder Modal Component
const ReminderModal = ({ visible, onClose, onSchedule, dateIdea }) => {
  const [selectedReminderType, setSelectedReminderType] = useState('quick');
  const [quickMinutes, setQuickMinutes] = useState(30);
  const [customDate, setCustomDate] = useState(new Date());
  const [customTime, setCustomTime] = useState(new Date());
  const [customMessage, setCustomMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible && dateIdea) {
      setCustomMessage(`Don't forget your romantic date: ${dateIdea.idea}`);
    }
  }, [visible, dateIdea]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleScheduleReminder = () => {
    let reminderConfig = {
      message: customMessage
    };

    switch (selectedReminderType) {
      case 'quick':
        reminderConfig = {
          ...reminderConfig,
          type: 'quick',
          value: quickMinutes
        };
        break;
      case 'custom':
        reminderConfig = {
          ...reminderConfig,
          type: 'custom',
          customDate: customDate,
          customTime: customTime
        };
        break;
      case 'smart':
        reminderConfig = {
          ...reminderConfig,
          type: 'smart'
        };
        break;
    }

    onSchedule(reminderConfig);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.reminderModalOverlay}>
        <View style={styles.reminderModalContent}>
          <View style={styles.reminderModalHeader}>
            <Text style={styles.reminderModalTitle}>Advanced Reminder</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={16} color="#FF8E8E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.reminderModalBody}>
            <View style={styles.reminderTypeSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Feather name="bell" size={18} color="#FF6B9D" style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Reminder Type</Text>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.reminderTypeButton,
                  selectedReminderType === 'quick' && styles.reminderTypeButtonActive
                ]}
                onPress={() => setSelectedReminderType('quick')}
              >
                <Feather name="zap" size={28} color="#FF6B9D" style={{ marginRight: 16 }} />
                <View style={styles.reminderTypeContent}>
                  <Text style={styles.reminderTypeTitle}>Quick Reminder</Text>
                  <Text style={styles.reminderTypeDescription}>Remind me in a few minutes</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.reminderTypeButton,
                  selectedReminderType === 'custom' && styles.reminderTypeButtonActive
                ]}
                onPress={() => setSelectedReminderType('custom')}
              >
                <Feather name="calendar" size={28} color="#FF6B9D" style={{ marginRight: 16 }} />
                <View style={styles.reminderTypeContent}>
                  <Text style={styles.reminderTypeTitle}>Custom Date & Time</Text>
                  <Text style={styles.reminderTypeDescription}>Choose specific date and time</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.reminderTypeButton,
                  selectedReminderType === 'smart' && styles.reminderTypeButtonActive
                ]}
                onPress={() => setSelectedReminderType('smart')}
              >
                <MaterialCommunityIcons name="brain" size={28} color="#FF6B9D" style={{ marginRight: 16 }} />
                <View style={styles.reminderTypeContent}>
                  <Text style={styles.reminderTypeTitle}>Smart Reminder</Text>
                  <Text style={styles.reminderTypeDescription}>Tomorrow at 6 PM (recommended)</Text>
                </View>
              </TouchableOpacity>
            </View>

            {selectedReminderType === 'quick' && (
              <View style={styles.quickReminderSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Feather name="zap" size={18} color="#FF6B9D" style={{ marginRight: 8 }} />
                  <Text style={styles.sectionTitle}>Quick Options</Text>
                </View>
                <View style={styles.quickOptions}>
                  {[15, 30, 60, 120, 240].map(minutes => (
                    <TouchableOpacity
                      key={minutes}
                      style={[
                        styles.quickOptionButton,
                        quickMinutes === minutes && styles.quickOptionButtonActive
                      ]}
                      onPress={() => setQuickMinutes(minutes)}
                    >
                      <Text style={styles.quickOptionText}>
                        {minutes < 60 ? `${minutes}m` : `${minutes/60}h`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {selectedReminderType === 'custom' && (
              <View style={styles.customReminderSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Feather name="calendar" size={18} color="#FF6B9D" style={{ marginRight: 8 }} />
                  <Text style={styles.sectionTitle}>Custom Date & Time</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateTimeLabel}>Date:</Text>
                  <Text style={styles.dateTimeValue}>{formatDate(customDate)}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.dateTimeLabel}>Time:</Text>
                  <Text style={styles.dateTimeValue}>{formatTime(customTime)}</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.messageSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Feather name="message-circle" size={18} color="#FF6B9D" style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Custom Message</Text>
              </View>
              <TextInput
                style={styles.messageInput}
                value={customMessage}
                onChangeText={setCustomMessage}
                placeholder="Enter your reminder message"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.reminderModalActions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleScheduleReminder} style={styles.scheduleButton}>
              <Text style={styles.scheduleButtonText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerTitle}>Select Date</Text>
                <View style={styles.pickerContent}>
                  <Text style={styles.pickerText}>Date: {formatDate(customDate)}</Text>
                  <Text style={styles.pickerNote}>(Date picker would be implemented here)</Text>
                </View>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.pickerButton}>
                  <Text style={styles.pickerButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <Modal
            visible={showTimePicker}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerTitle}>Select Time</Text>
                <View style={styles.pickerContent}>
                  <Text style={styles.pickerText}>Time: {formatTime(customTime)}</Text>
                  <Text style={styles.pickerNote}>(Time picker would be implemented here)</Text>
                </View>
                <TouchableOpacity onPress={() => setShowTimePicker(false)} style={styles.pickerButton}>
                  <Text style={styles.pickerButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
};

// Refactored Header - Fix theme integration
const AppHeader = ({ revealedCards, theme, platformStyles }) => {
  const revealedCount = revealedCards?.length || 0;
  
  if (!theme || !platformStyles) {
    return (
      <View style={styles.header}> 
        <View style={styles.headerContent}>
          {/* Removed app name and subtitle for a clean header */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {revealedCount} / 100 Revealed
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(revealedCount / 100) * 100}%` }]} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.header, { backgroundColor: '#fff' }]}> 
      <View style={styles.headerContent}>
        {/* Removed app name and subtitle for a clean header */}
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: '#1D1D1F', fontFamily: 'System' }]}> 
            {revealedCount} / 100 Revealed
          </Text>
          <View style={[styles.progressBar, { backgroundColor: '#E5E5E7' }]}> 
            <View style={[styles.progressFill, { 
              backgroundColor: '#007AFF',
              width: `${(revealedCount / 100) * 100}%` 
            }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

// Refactored Button - Fix TouchableHighlight child issue and theme access
const PlatformButton = ({ onPress, children, style, icon, iconColor, theme, platformStyles, buttonColor }) => {
  const buttonContent = (
    <View style={[
      styles.tabBarButton, 
      style
    ]}> 
      {icon && (
        <View style={styles.tabBarIconContainer}>
          {icon}
        </View>
      )}
      <Text style={[
        styles.tabBarButtonText, 
        { 
          fontFamily: 'System',
          color: '#800000000',
          fontWeight: '400',
          fontSize: 10,
          marginTop:2
        }
      ]}> 
        {children}
      </Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center' }}
      activeOpacity={0.7}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

export default function App() {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  
  // Replace revealedCards state with an array to preserve order
  const [revealedCards, setRevealedCards] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [tutorialKey, setTutorialKey] = useState(0);
  const [showSpinningWheel, setShowSpinningWheel] = useState(false);

  useEffect(() => {
    // Load revealed cards from AsyncStorage on mount
    AsyncStorage.getItem('revealedCards').then(data => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          // If old format (array of ids), convert to array of card objects
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'number') {
            // Map ids to card objects using dateIdeasData
            const converted = parsed.map(id => {
              const found = dateIdeasData.find(card => card.id === id);
              return found ? { ...found } : { id, idea: `Date idea #${id} - Coming soon!` };
            });
            setRevealedCards(converted);
            AsyncStorage.setItem('revealedCards', JSON.stringify(converted));
          } else {
            setRevealedCards(parsed);
          }
        } catch {
          setRevealedCards([]);
        }
      }
    });
    
    // Check if tutorial has been shown before
    AsyncStorage.getItem('tutorialShown').then(data => {
      if (!data) {
        setShowTutorial(true);
      }
    });
    
    // Request notification permissions on mount
    Notifications.requestPermissionsAsync();
  }, []);

  const handleCardPress = (item, sequenceNumber) => {
    // Check if card is already revealed by id
    if (!revealedCards.some(card => card.id === item.id)) {
      const newRevealed = [...revealedCards, { ...item, sequenceNumber }];
      setRevealedCards(newRevealed);
      AsyncStorage.setItem('revealedCards', JSON.stringify(newRevealed));
    }
    setExpandedCard({ ...item, sequenceNumber });
  };

  const closeExpandedCard = () => {
    setExpandedCard(null);
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    AsyncStorage.setItem('tutorialShown', 'true');
  };

  const shareByEmail = () => {
    if (!expandedCard) return;
    const categoryInfo = categories[expandedCard.category] || categories.romantic;
    MailComposer.composeAsync({
      subject: 'DateUnveil: Amazing Date Idea',
      body: `I just discovered this amazing date idea: ${expandedCard.idea}\n\nCategory: ${categoryInfo.name}\nBudget: ${expandedCard.budget === 'low' ? '$' : expandedCard.budget === 'medium' ? '$$' : '$$$'}\nLocation: ${expandedCard.location}\n\nShared via DateUnveil\n\nLet's make it happen!`,
    }).catch(() => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['OK'],
            title: 'Error',
            message: 'Unable to open email composer.',
          },
          () => {}
        );
      } else {
        Alert.alert('Error', 'Unable to open email composer.');
      }
    });
  };

  const shareBySMS = () => {
    if (!expandedCard) return;
    let smsUrl = '';
    const categoryInfo = categories[expandedCard.category] || categories.romantic;
    const message = `I just discovered this amazing date idea: ${expandedCard.idea}\n\nCategory: ${categoryInfo.name}\nBudget: ${expandedCard.budget === 'low' ? '$' : expandedCard.budget === 'medium' ? '$$' : '$$$'}\nLocation: ${expandedCard.location}\n\nShared via DateUnveil\n\nLet's make it happen!`;
    
    if (Platform.OS === 'ios') {
      smsUrl = `sms:&body=${encodeURIComponent(message)}`;
    } else {
      smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    }
    Linking.openURL(smsUrl).catch(() => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['OK'],
            title: 'Error',
            message: 'Unable to open SMS app.',
          },
          () => {}
        );
      } else {
        Alert.alert('Error', 'Unable to open SMS app.');
      }
    });
  };

  const addToCalendar = async (eventDetails) => {
    try {
      // Check if calendar permissions are already granted
      const { status: existingStatus } = await Calendar.getCalendarPermissionsAsync();
      let finalStatus = existingStatus;
      
      // If permissions not granted, request them
      if (existingStatus !== 'granted') {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        showPlatformAlert(
          'Calendar Permission Required', 
          'Please enable calendar access in your device settings to add date ideas to your calendar.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
      
      // Get available calendars
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const writableCalendars = calendars.filter(cal => cal.allowsModifications);
      
      if (writableCalendars.length === 0) {
        Alert.alert('No Writable Calendar', 'No calendar found that allows adding events. Please check your calendar settings.');
        return;
      }
      
      // Use the first writable calendar (usually the default)
      const selectedCalendar = writableCalendars[0];
      
      const eventDetailsForCalendar = {
        title: eventDetails.title,
        startDate: eventDetails.startDate,
        endDate: eventDetails.endDate,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        location: eventDetails.location,
        notes: eventDetails.notes,
        alarms: [{ relativeOffset: -60 }], // Reminder 1 hour before
      };
      
      const eventId = await Calendar.createEventAsync(selectedCalendar.id, eventDetailsForCalendar);
      
      if (eventId) {
        Alert.alert(
          'Date Scheduled Successfully!', 
          `"${eventDetails.title}" has been added to your calendar.`,
          [
            { text: 'Great!', style: 'default' },
            { text: 'Send Invitation', onPress: () => {
              setInvitationData(eventDetails);
              setShowInvitationModal(true);
            }}
          ]
        );
      } else {
        throw new Error('Failed to create event');
      }
      
    } catch (error) {
      console.error('Calendar error:', error);
      showPlatformAlert(
        'Calendar Error', 
        'Unable to add to calendar. Please check your calendar app and try again.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Open Calendar', onPress: () => Linking.openURL('calshow://') }
        ]
      );
    }
  };

  const handleScheduleDate = (eventDetails) => {
    setShowCalendarModal(false);
    addToCalendar(eventDetails);
  };

  const setReminder = async () => {
    if (!expandedCard) return;
    
    try {
      // Request notification permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        showPlatformAlert(
          'Notification Permission Required',
          'Please enable notifications in your device settings to set reminders.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
      
      // Show advanced reminder options
      setShowReminderModal(true);
      
    } catch (error) {
      console.error('Reminder error:', error);
      showPlatformAlert('Error', 'Unable to set reminder. Please try again.', [
        { text: 'OK', style: 'default' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() }
      ], null);
    }
  };
  
  const scheduleAdvancedReminder = async (reminderConfig) => {
    try {
      const { type, value, customDate, customTime, message } = reminderConfig;
      let triggerTime;
      let reminderText;
      
      switch (type) {
        case 'quick':
          triggerTime = new Date(Date.now() + value * 60 * 1000);
          reminderText = `in ${value} minutes`;
          break;
        case 'custom':
          const scheduledDate = new Date(customDate);
          scheduledDate.setHours(customTime.getHours());
          scheduledDate.setMinutes(customTime.getMinutes());
          triggerTime = scheduledDate;
          reminderText = `on ${scheduledDate.toLocaleDateString()} at ${customTime.toLocaleTimeString()}`;
          break;
        case 'smart':
          // Smart reminders based on date type
          const now = new Date();
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(18, 0, 0, 0); // 6 PM tomorrow
          triggerTime = tomorrow;
          reminderText = 'tomorrow at 6 PM';
          break;
        default:
          throw new Error('Invalid reminder type');
      }
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'DateUnveil Reminder',
          body: message || `Don't forget your romantic date: ${expandedCard.idea}`,
          data: { 
            dateIdea: expandedCard.idea,
            category: expandedCard.category,
            budget: expandedCard.budget,
            location: expandedCard.location
          },
          sound: 'default',
          priority: 'high',
        },
        trigger: { date: triggerTime },
      });
      
      showPlatformAlert(
        'Advanced Reminder Set!', 
        `You'll be reminded about "${expandedCard.idea}" ${reminderText}.`,
        [
          { text: 'Great!', style: 'default' },
          { text: 'Set Another', onPress: () => setShowReminderModal(true) },
          { text: 'View All', onPress: () => viewAllReminders() }
        ],
        null
      );
      
    } catch (error) {
      console.error('Schedule reminder error:', error);
      showPlatformAlert('Error', 'Could not schedule reminder. Please try again.', [
        { text: 'OK', style: 'default' },
        { text: 'Set Another', onPress: () => setShowReminderModal(true) },
        { text: 'View All', onPress: () => viewAllReminders() }
      ], null);
    }
  };
  
  const viewAllReminders = async () => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      if (scheduledNotifications.length === 0) {
        Alert.alert('No Reminders', 'You have no scheduled reminders.');
        return;
      }
      
      const reminderList = scheduledNotifications
        .filter(notification => notification.content.data?.dateIdea)
        .map(notification => ({
          id: notification.identifier,
          title: notification.content.title,
          body: notification.content.body,
          date: new Date(notification.trigger.date),
          dateIdea: notification.content.data.dateIdea
        }))
        .sort((a, b) => a.date - b.date);
      
      if (reminderList.length === 0) {
        Alert.alert('No Date Reminders', 'You have no date-related reminders scheduled.');
        return;
      }
      
      const reminderText = reminderList.map(reminder => 
        `• ${reminder.dateIdea}\n  ${reminder.date.toLocaleDateString()} at ${reminder.date.toLocaleTimeString()}`
      ).join('\n\n');
      
      showPlatformAlert(
        'Your Date Reminders',
        reminderText,
        [
          { text: 'OK', style: 'default' },
          { text: 'Clear All', onPress: () => clearAllReminders() }
        ],
        null
      );
      
    } catch (error) {
      console.error('View reminders error:', error);
      showPlatformAlert('Error', 'Unable to view reminders.', [
        { text: 'OK', style: 'default' },
        { text: 'Set Another', onPress: () => setShowReminderModal(true) },
        { text: 'View All', onPress: () => viewAllReminders() }
      ], null);
    }
  };
  
  const clearAllReminders = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      showPlatformAlert('Success', 'All reminders have been cleared.', [
        { text: 'OK', style: 'default' },
        { text: 'Set Another', onPress: () => setShowReminderModal(true) },
        { text: 'View All', onPress: () => viewAllReminders() }
      ], null);
    } catch (error) {
      console.error('Clear reminders error:', error);
      showPlatformAlert('Error', 'Unable to clear reminders.', [
        { text: 'OK', style: 'default' },
        { text: 'Set Another', onPress: () => setShowReminderModal(true) },
        { text: 'View All', onPress: () => viewAllReminders() }
      ], null);
    }
  };

  const resetAppData = async () => {
    try {
      // Clear all stored data
      await AsyncStorage.multiRemove(['revealedCards', 'tutorialShown']);
      
      // Reset all state
      setRevealedCards([]);
      setExpandedCard(null);
      setShowHistory(false);
      setShowCalendarModal(false);
      setShowInvitationModal(false);
      setShowReminderModal(false);
      setShowSpinningWheel(false);
      setSelectedCategory(null);
      
      // Ensure tutorial is completely disabled
      setShowTutorial(false);
      setTutorialKey(prev => prev + 1);
      
      showPlatformAlert('Success', 'App data has been reset! The tutorial will appear again the next time you open the app.', [
        { text: 'OK', style: 'default' }
      ], null);
    } catch (error) {
      console.error('Reset app data error:', error);
      showPlatformAlert('Error', 'Unable to reset app data.', [
        { text: 'OK', style: 'default' }
      ], null);
    }
  };

  const handleWheelCardSelect = (cardNumber) => {
    const selectedCard = dateIdeasData.find(item => item.id === cardNumber);
    if (selectedCard) {
      setExpandedCard(selectedCard);
      // Reveal the card if not already revealed
      if (!revealedCards.some(card => card.id === cardNumber)) {
        const newRevealedCards = [...revealedCards, { ...selectedCard, sequenceNumber: cardNumber }];
        setRevealedCards(newRevealedCards);
        AsyncStorage.setItem('revealedCards', JSON.stringify(newRevealedCards));
      }
    }
  };

  // New gridData logic for category filtering
  let gridData;
  if (!selectedCategory) {
    // No filter: show all 100 cards
    gridData = Array.from({ length: 100 }, (_, i) => {
      const sequenceNumber = i + 1;
      const existingItem = dateIdeasData.find(item => item.id === sequenceNumber);
      if (existingItem) {
        return { ...existingItem, sequenceNumber };
      } else {
        return {
          id: sequenceNumber,
          sequenceNumber: sequenceNumber,
          idea: `Date idea #${sequenceNumber} - Coming soon!`,
          category: 'random',
          budget: 'medium',
          location: 'indoor',
          placeholder: true
        };
      }
    });
  } else {
    // Filtered: show only cards for the selected category
    gridData = dateIdeasData
      .filter(item => item.category === selectedCategory)
      .map((item, idx) => ({ ...item, sequenceNumber: idx + 1 }));
  }

  // Update renderCard to always show a tappable card
  const renderCard = ({ item, index }) => (
    <SmallCard
      item={item}
      sequenceNumber={index + 1}
      isRevealed={revealedCards.some(card => card.id === item.id)}
      onPress={() => handleCardPress(item, index + 1)}
    />
  );

  // For the history modal, show all revealed cards in order
  const revealedIdeas = revealedCards.map(card => {
    if (!card) return 'No idea found';
    if (card.idea) return card.idea;
    // Try to find in dateIdeasData as fallback
    const found = dateIdeasData.find(g => g.id === card.id);
    return found && found.idea ? found.idea : `Date idea #${card.id} - Coming soon!`;
  });

  // Show tutorial first if it hasn't been completed
  if (showTutorial) {
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={["#f8fafc", "#fceabb", "#f8fafc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <RNStatusBar 
              barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
              backgroundColor={'#FFFFFF'} 
            />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Tutorial 
              key={tutorialKey}
              visible={true}
              onComplete={completeTutorial}
            />
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  // Main app content
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#f8fafc", "#fceabb", "#f8fafc"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <RNStatusBar 
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
            backgroundColor={'#FFFFFF'} 
          />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <AppHeader 
            revealedCards={revealedCards}
            theme={theme}
            platformStyles={{ fontFamily: 'System' }}
          />
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onRandomSelect={() => setShowSpinningWheel(true)}
          />
          <FlatList
            data={gridData}
            renderItem={renderCard}
            keyExtractor={(item, idx) => item.id ? item.id.toString() : `placeholder-${idx}`}
            numColumns={4}
            key="4-column-grid"
            contentContainerStyle={[styles.gridContainer, { backgroundColor: 'rgba(255, 245, 230, 0.25)', borderRadius: 18, marginHorizontal: 8 }]}
            showsVerticalScrollIndicator={false}
          />
          {/* Professional Bottom Action Bar */}
          <View style={[styles.tabBar, { backgroundColor: '#fffbe6', borderTopColor: '#ffe082' }]}>
            <View style={styles.tabBarContent}>
              <PlatformButton
                onPress={() => setShowHistory(true)}
                style={{}}
                theme={theme}
                platformStyles={{ fontFamily: 'System' }}
                buttonColor="#FFB300"
              >
                {getActionIcon('history', 24, '#FFB300')}
                History
              </PlatformButton>
              <PlatformButton
                onPress={resetAppData}
                style={{}}
                theme={theme}
                platformStyles={{ fontFamily: 'System' }}
                buttonColor="#FFB300"
              >
                {getActionIcon('reset', 24, '#FFB300')}
                Reset
              </PlatformButton>
            </View>
          </View>
          {expandedCard && (
            <ExpandedCard
              item={expandedCard}
              onClose={closeExpandedCard}
              onShareEmail={shareByEmail}
              onShareSMS={shareBySMS}
              onAddToCalendar={() => setShowCalendarModal(true)}
              onSetReminder={setReminder}
            />
          )}
          {showHistory && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Your Date History</Text>
                  <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.historyList}>
                  {revealedCards.length === 0 ? (
                    <Text style={styles.emptyHistoryText}>No date ideas revealed yet. Start exploring to discover amazing date ideas.</Text>
                  ) : (
                    revealedCards.map((card, index) => (
                      <View key={index} style={styles.historyItem}>
                        <Text style={styles.historyNumber}>#{card.sequenceNumber || card.id}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.historyText}>
                            {card.idea || `Date idea #${card.id} - Coming soon!`}
                          </Text>
                          {card.category && (
                            <View style={[styles.historyCategory, { backgroundColor: categories[card.category]?.color + '20' }]}> 
                              <Text style={[styles.historyCategoryText, { color: categories[card.category]?.color }]}> 
                                {categories[card.category]?.name || card.category}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            </View>
          )}
          <CalendarModal
            visible={showCalendarModal}
            onClose={() => setShowCalendarModal(false)}
            onSchedule={handleScheduleDate}
            dateIdea={expandedCard}
          />
          <InvitationModal
            visible={showInvitationModal}
            onClose={() => setShowInvitationModal(false)}
            invitationData={invitationData}
          />
          <ReminderModal
            visible={showReminderModal}
            onClose={() => setShowReminderModal(false)}
            onSchedule={scheduleAdvancedReminder}
            dateIdea={expandedCard}
          />
          <SpinningWheel
            visible={showSpinningWheel}
            onClose={() => setShowSpinningWheel(false)}
            onSelectCard={handleWheelCardSelect}
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: Platform.OS === 'ios' ? 44 : 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E7', // fixed from '#E500000'
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: 40,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 50,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 4,
  },
  progressBar: {
    width: 120,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#E5E5E7',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
    backgroundColor: '#007AFF',
  },
  categoryFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E7',
  },
  categoryFilter: {
    flexGrow: 1,
  },
  categoryFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
  },
  categoryFilterButton: {
    minWidth: 80,
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryFilterButtonActive: {
    backgroundColor: '#07F',
    borderColor: '#007AFF',
  },
  categoryFilterText: {
    fontSize: 13,
    fontWeight: 500,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  categoryFilterTextActive: {
    color: '#FFFFFF',
  },
  gridContainer: {
    padding: 8,
    paddingBottom: 100,
  },
  smallCard: {
    width: (width - 64) / 4,
    height: 88,
    margin: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#F2F2F7',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  categoryIcon: {
    fontSize: 16,
    color: '#007AFF',
  },
  actionBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 44,
  },
  actionBarButtonText: {
    fontSize: 15,
    fontWeight: 500,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#07F',
    shadowColor: '#07F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 44,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginLeft: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 60,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 32,
    maxHeight: height * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  historyList: {
    padding: 20,
    maxHeight: 30,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  historyNumber: {
    fontSize: 15,
    fontWeight: 60,
    color: '#007AFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginRight: 12,
    minWidth: 24,
  },
  historyText: {
    fontSize: 15,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    flex: 1,
    lineHeight: 20,
  },
  emptyHistoryText: {
    fontSize: 15,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  historyCategory: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  historyCategoryText: {
    fontSize: 11,
    fontWeight: 500,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 49,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E500000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0, // Safe area for home indicator
  },
  tabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 49,
    paddingHorizontal: 20,
  },
  tabBarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: 44,
  },
  tabBarButtonText: {
    fontSize: 10,
    fontWeight: 400,
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginTop: 2,
    textAlign: 'center',
  },
  tabBarIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateTimeSection: {
    marginBottom: 24,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 16,
  },
  dateTimeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
  },
  dateTimeTextContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'System',
  },
  dateTimeValue: {
    fontSize: 14,
    color: '#222',
    fontFamily: 'System',
  },
  detailsSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'System',
    marginBottom: 4,
  },
  textInput: {
    fontSize: 14,
    color: '#222',
    fontFamily: 'System',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'System',
  },
  calendarModalBody: {
    marginBottom: 24,
  },
  calendarModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'System',
  },
  scheduleButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FF6B8A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'System',
  },
  invitationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invitationModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  invitationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  invitationModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'System',
  },
  invitationModalBody: {
    marginBottom: 24,
  },
  invitationPreview: {
    marginBottom: 16,
  },
  invitationPreviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'System',
    marginBottom: 8,
  },
  invitationPreviewText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'System',
  },
  recipientSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'System',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'System',
    marginBottom: 4,
  },
  textInput: {
    fontSize: 14,
    color: '#222',
    fontFamily: 'System',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  invitationModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FF6B8A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'System',
    marginLeft: 8,
  },
  smsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#7FB069',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smsButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'System',
    marginLeft: 8,
  },
  reminderModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  reminderModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'System',
  },
  reminderModalBody: {
    marginBottom: 24,
  },
  reminderTypeSection: {
    marginBottom: 16,
  },
  reminderTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
  },
  reminderTypeButtonActive: {
    borderColor: '#FF6B9D',
  },
  reminderTypeContent: {
    flex: 1,
  },
  reminderTypeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'System',
    marginBottom: 4,
  },
  reminderTypeDescription: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'System',
  },
  quickReminderSection: {
    marginBottom: 16,
  },
  quickOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickOptionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickOptionButtonActive: {
    borderColor: '#FF6B9D',
  },
  quickOptionText: {
    fontSize: 12,
    color: '#222',
    fontFamily: 'System',
  },
  messageSection: {
    marginBottom: 16,
  },
  messageInput: {
    fontSize: 14,
    color: '#222',
    fontFamily: 'System',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  reminderModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'System',
    marginBottom: 16,
  },
  pickerContent: {
    marginBottom: 16,
  },
  pickerText: {
    fontSize: 14,
    color: '#222',
    fontFamily: 'System',
  },
  pickerNote: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'System',
    textAlign: 'center',
  },
  pickerButton: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'System',
  },
  wheelOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  wheelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wheelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'System',
  },
  wheelCloseButton: {
    padding: 8,
    borderRadius: 16,
  },
  wheelContent: {
    alignItems: 'center',
  },
  wheelWrapper: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheel: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelPointer: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B8A',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -5 }, { translateY: -5 }],
  },
  resultContainer: {
    marginBottom: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FF6B8A',
    borderRadius: 8,
    backgroundColor: '#FFF5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 14,
    color: '#FF6B8A',
    fontFamily: 'System',
  },
  wheelInstructions: {
    marginBottom: 16,
  },
  wheelInstructionText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'System',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FF6B8A',
    marginLeft: 8,
  },
  expandedCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  expandedCardContent: {
    width: width - 32,
    maxHeight: height * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  expandedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandedCardNumber: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginRight: 12,
  },
  categoryBadgeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  closeButton: {
    padding: 8,
    borderRadius: 16,
  },
  expandedCardBody: {
    padding: 20,
    flex: 1,
  },
  dateIdeaText: {
    fontSize: 18,
    fontWeight: 500,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  quickInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 50,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  expandedActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 8,
  },
  expandedActionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 44,
  },
  expandedActionButtonText: {
    fontSize: 13,
    fontWeight: 50,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginTop: 4,
    textAlign: 'center',
  },
  tutorialFullScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  tutorialContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  tutorialHeader: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 16,
  },
  tutorialIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tutorialIcon: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  tutorialTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  tutorialSubtitle: {
    fontSize: 16,
    color: '#86868B',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  tutorialProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 80,
    alignItems: 'center',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
    backgroundColor: '#E5E5E7',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tutorialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});