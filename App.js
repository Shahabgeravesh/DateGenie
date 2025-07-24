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

import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
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

// Fun font system for card numbers
const getFunFont = (number) => {
  // Group numbers into different fun font categories
  if (number <= 20) {
    return Platform.OS === 'ios' ? 'Marker Felt' : 'cursive'; // Playful marker font
  } else if (number <= 40) {
    return Platform.OS === 'ios' ? 'Chalkboard SE' : 'monospace'; // Chalk-like font
  } else if (number <= 60) {
    return Platform.OS === 'ios' ? 'Bradley Hand' : 'serif'; // Handwritten style
  } else if (number <= 80) {
    return Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif'; // Modern clean
  } else {
    return Platform.OS === 'ios' ? 'Futura' : 'fantasy'; // Futuristic
  }
};

// Fun color system for card numbers
const getFunColor = (number) => {
  const colors = [
    '#FF6B8A', // Romantic pink
    '#7FB069', // Adventurous green
    '#5B9BD5', // Active blue
    '#F4A261', // Cozy orange
    '#E76F51', // Fun red
    '#E9C46A', // Foodie yellow
    '#8B9DC3', // Chill purple
    '#F7931E', // Spontaneous orange
    '#6A994E', // Budget green
    '#C9A87D', // Luxury gold
  ];
  return colors[number % colors.length];
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

// Platform-specific action icons - Updated with stunning, guideline-compliant icons
const getActionIcon = (action, size = 20, color = '#FF6B8A') => {
  const actionIcons = {
    home: {
      ios: 'grid-outline',
      android: 'dashboard'
    },
    random: {
      ios: 'shuffle-outline',
      android: 'shuffle'
    },
    history: {
      ios: 'heart-outline',
      android: 'favorite-border'
    },
    reset: {
      ios: 'refresh-outline',
      android: 'refresh'
    },
    share: {
      ios: 'share-outline',
      android: 'share'
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
    
    // DateGenie specific colors (adapted for dark mode)
  dateGenie: {
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
      title: "Welcome to DateGenie",
      message: "Discover 100 creative date ideas. Tap a card to reveal, filter by category, and save your favorites.",
      iconSet: 'MaterialCommunityIcons',
      icon: 'cards-heart',
      color: "#007AFF"
    },
    {
      title: "Share & Save",
      message: "Found a great idea? Share it via email or message.",
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
          { 
            fontSize: 24, 
            fontWeight: 'bold', 
            textAlign: 'center',
            fontFamily: getFunFont(sequenceNumber),
            color: getFunColor(sequenceNumber),
            textShadowColor: 'rgba(0,0,0,0.1)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          },
          isRevealed && { 
            color: '#007AFF',
            textShadowColor: 'rgba(0,122,255,0.3)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 4,
          }
        ]}>
          {sequenceNumber}
        </Text>
        {isRevealed && (
          <MaterialCommunityIcons 
            name="check-circle" 
            size={16} 
            color="#007AFF" 
            style={{ marginTop: 4 }}
          />
        )}
      </View>
    </CardTouchable>
  );
};

// History Card Component - Shows date idea text
const HistoryCard = ({ item, sequenceNumber, onPress }) => {
  const CardTouchable = Platform.OS === 'ios' ? TouchableHighlight : TouchableOpacity;
  
  // Get the actual date idea text
  const getDateIdeaText = (item) => {
    if (item.idea) return item.idea;
    // Try to find in dateIdeasData as fallback
    const found = dateIdeasData.find(g => g.id === item.id);
    return found && found.idea ? found.idea : `Date idea #${item.id}`;
  };
  
  const dateIdeaText = getDateIdeaText(item);
  
  return (
    <CardTouchable
      onPress={onPress}
      style={[
        styles.historyCard,
        { justifyContent: 'center', alignItems: 'center' }
      ]}
      underlayColor={Platform.OS === 'ios' ? '#f8f9fa' : undefined}
      activeOpacity={Platform.OS === 'android' ? 0.85 : undefined}
    >
      <View style={{ alignItems: 'center', padding: 16, flex: 1, justifyContent: 'space-between' }}>
        <Text style={[
          { 
            fontSize: 18, 
            fontWeight: 'bold', 
            textAlign: 'center',
            fontFamily: getFunFont(sequenceNumber),
            color: getFunColor(sequenceNumber),
            textShadowColor: 'rgba(0,0,0,0.1)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
            marginBottom: 8,
          }
        ]}>
          #{sequenceNumber}
        </Text>
        <ScrollView 
          style={{ flex: 1, width: '100%' }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingVertical: 8 }}
          nestedScrollEnabled={true}
        >
          <Text style={[styles.historyCardText, { textAlign: 'center' }]}>
            {dateIdeaText}
          </Text>
        </ScrollView>
      </View>
    </CardTouchable>
  );
};

// Spinning Wheel Component
const SpinningWheel = ({ visible, onClose, onSelectCard, onSpinStart, excludedCards = [], totalCards = 100 }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setSelectedNumber(null);
      setIsSpinning(false);
      spinAnim.setValue(0);
    }
  }, [visible]);

  // Romantic colors for wheel segments
  const romanticColors = [
    '#FF6B8A', '#FF8E8E', '#FFB347', '#FFD700', '#98FB98', 
    '#87CEEB', '#DDA0DD', '#F0E68C', '#FF69B4', '#00CED1'
  ];

  const spinWheel = () => {
    if (isSpinning) return;
    
    // Clear any previously expanded card immediately when spin starts
    if (onSpinStart) {
      onSpinStart();
    }
    
    setIsSpinning(true);
    setSelectedNumber(null);
    setSpinCount(prev => prev + 1);
    
    // Get available card numbers (excluding already selected ones)
    const availableCards = Array.from({ length: totalCards }, (_, i) => i + 1)
      .filter(cardNumber => !excludedCards.includes(cardNumber));
    
    let randomNumber;
    // If all cards have been selected, reset the selection
    if (availableCards.length === 0) {
      // Reset all cards as available
      const allCards = Array.from({ length: totalCards }, (_, i) => i + 1);
      randomNumber = allCards[Math.floor(Math.random() * allCards.length)];
    } else {
      // Select from available cards
      randomNumber = availableCards[Math.floor(Math.random() * availableCards.length)];
    }
    
    // Calculate the target angle for the selected segment
    const segmentAngle = 360 / 12; // 12 segments for visual wheel
    // Map the selected card number to one of the 12 wheel segments
    const wheelSegment = (randomNumber - 1) % 12;
    const targetAngle = wheelSegment * segmentAngle;
    
    // Add multiple full rotations for dramatic effect
    const fullSpins = 5 + Math.random() * 5; // 5-10 full spins
    const totalRotation = fullSpins * 360 + targetAngle;
    
    // Reset animation value to current position
    spinAnim.setValue(0);
    
    // Smooth spinning animation with easing
    Animated.timing(spinAnim, {
      toValue: totalRotation,
      duration: 3000 + Math.random() * 1000, // 3-4 seconds
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      setIsSpinning(false);
      setSelectedNumber(randomNumber);
      
      // Show result and close after delay
      setTimeout(() => {
        try {
          onSelectCard(randomNumber);
          onClose();
        } catch (error) {
          console.error('Error in wheel callback:', error);
          onClose();
        }
      }, 1500);
    });
  };

  const renderWheelSegments = () => {
    const segments = [];
    const segmentAngle = 360 / 12; // 12 segments for better performance
    
    // Ultra-modern gradient color palette
    const modernColors = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
      '#43e97b', '#38f9d7', '#fa709a', '#fee140', '#a8edea', '#fed6e3'
    ];
    
    for (let i = 0; i < 12; i++) {
      const startAngle = i * segmentAngle;
      const colorIndex = i % modernColors.length;
      
      segments.push(
        <View
          key={i}
          style={[
            styles.wheelSegment,
            {
              transform: [{ rotate: `${startAngle}deg` }],
              borderBottomColor: modernColors[colorIndex],
            }
          ]}
        >
          <View style={styles.wheelSegmentInner}>
            <Text style={styles.wheelSegmentText}>
              {i + 1}
            </Text>
          </View>
        </View>
      );
    }
    return segments;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.wheelOverlay}>
        <View style={styles.wheelContainer}>
          <View style={styles.wheelHeader}>
            <View style={styles.wheelHeaderContent}>
              <Text style={styles.wheelTitle}>Random Date</Text>
              <Text style={styles.wheelSubtitle}>Discover something new</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.wheelCloseButton}>
              <MaterialCommunityIcons name="close" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        
        <View style={styles.wheelContent}>
          <View style={styles.wheelWrapper}>
            <Animated.View
              style={[
                styles.wheel,
                {
                  transform: [
                    { rotate: spinAnim.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }) },
                    { scale: scaleAnim }
                  ],
                  shadowOpacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8],
                  }),
                }
              ]}
            >
              {renderWheelSegments()}
              
              {/* Clean modern center */}
              <View style={styles.wheelCenter}>
                <View style={styles.wheelCenterInner}>
                  <Text style={styles.wheelCenterText}>•</Text>
                </View>
              </View>
            </Animated.View>
          </View>
          
          {selectedNumber && (
            <Animated.View 
              style={[
                styles.resultContainer,
                {
                  transform: [{ scale: scaleAnim }],
                }
              ]}
            >
              <Text style={styles.resultText}>Selected: #{selectedNumber}</Text>
              <Text style={styles.resultSubtext}>Finding your perfect date...</Text>
            </Animated.View>
          )}
          
          <TouchableOpacity 
            style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]}
            onPress={spinWheel}
            disabled={isSpinning}
            activeOpacity={0.8}
          >
            <Text style={styles.spinButtonText}>
              {isSpinning ? 'Finding your date idea...' : 'Find a Date Idea'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.wheelInstructions}>
            <Text style={styles.wheelInstructionText}>Tap to generate a random date idea</Text>
          </View>
        </View>
      </View>
    </View>
    </Modal>
  );
};

// Enhanced Category Filter Component
const CategoryFilter = ({ selectedCategory, onCategorySelect }) => {
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
        
        {Object.entries(categories).filter(([key]) => key !== 'random').map(([key, category]) => (
          <TouchableOpacity 
            key={key}
            style={[
              styles.categoryFilterButton,
              selectedCategory === key && styles.categoryFilterButtonActive
            ]}
            onPress={() => onCategorySelect(key)}
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
    const shareMessage = `I just discovered this amazing date idea: ${item.idea}\n\nCategory: ${categoryInfo.name}\nBudget: ${item.budget === 'low' ? '$' : item.budget === 'medium' ? '$$' : '$$$'}\nLocation: ${item.location}\n\nShared via DateGenie\n\nLet's make it happen!`;
    
    await Share.share({
      message: shareMessage,
      title: 'Amazing Date Idea',
    });
  } catch (error) {
    console.error('Share error:', error);
  }
};

// Enhanced Expanded Card Component with detailed descriptions
const ExpandedCard = ({ item, onClose, onShareEmail, onShareSMS, onSetReminder }) => {
  const categories = {
    romantic: { name: 'Romantic', icon: '', color: '#FF6B8A', description: '' },
    adventurous: { name: 'Adventurous', icon: '', color: '#7FB069', description: '' },
    active: { name: 'Active', icon: '', color: '#5B9BD5', description: '' },
    cozy: { name: 'Cozy', icon: '', color: '#F4A261', description: '' },
    fun: { name: 'Fun', icon: '', color: '#E76F51', description: '' },
    foodie: { name: 'Foodie', icon: '', color: '#E9C46A', description: '' },
    chill: { name: 'Chill', icon: '', color: '#8B9DC3', description: '' },
    creative: { name: 'Creative', icon: '', color: '#9B59B6', description: '' },
    cultural: { name: 'Cultural', icon: '', color: '#34495E', description: '' },
    spontaneous: { name: 'Spontaneous', icon: '', color: '#F7931E', description: '' },
    budget: { name: 'Budget-Friendly', icon: '', color: '#6A994E', description: '' },
    luxury: { name: 'Luxury', icon: '', color: '#C9A87D', description: '' },
    random: { name: 'Random', icon: '', color: '#D4A5A5', description: '' },
  };
  const categoryInfo = categories[item.category] || categories.random;


  
  return (
    <TouchableOpacity 
      style={styles.expandedCardOverlay} 
      activeOpacity={1} 
      onPress={onClose}
    >
      <TouchableOpacity 
        style={styles.expandedCardContent} 
        activeOpacity={1} 
        onPress={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <View style={styles.expandedCardHeader}>
          <View style={styles.headerLeft}>
            <Text style={[
              styles.expandedCardNumber,
              {
                fontFamily: getFunFont(item.sequenceNumber),
                color: getFunColor(item.sequenceNumber),
                textShadowColor: 'rgba(0,0,0,0.1)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }
            ]}>#{item.sequenceNumber}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#86868B" />
          </TouchableOpacity>
        </View>
        
        {/* Main Content */}
        <ScrollView 
          style={styles.expandedCardBody} 
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 24 }}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          alwaysBounceVertical={false}
        >
          {/* Date Idea Title */}
          <Text style={styles.dateIdeaText}>
            {item.placeholder ? 'Date idea coming soon!' : (item.idea || 'No idea found')}
          </Text>




          
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
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={[styles.infoValue, { color: categoryInfo.color }]}>
                {categoryInfo.name}
              </Text>
            </View>
          </View>


        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.expandedActionButtons, { flexDirection: 'row', gap: 12, marginTop: 16 }]}> 
          <TouchableOpacity 
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 12, backgroundColor: '#007AFF' }} 
            onPress={() => shareDateIdea(item)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="share-variant" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'System' }}>Share</Text>
          </TouchableOpacity>

        </View>
      </TouchableOpacity>
    </TouchableOpacity>
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
  const totalCards = dateIdeasData.length;
  
  if (!theme || !platformStyles) {
    return (
      <View style={styles.header}> 
        <View style={styles.headerContent}>
          {/* Removed app name and subtitle for a clean header */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {revealedCount} / {totalCards} Revealed
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(revealedCount / totalCards) * 100}%` }]} />
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
            {revealedCount} / {totalCards} Revealed
          </Text>
          <View style={[styles.progressBar, { backgroundColor: '#E5E5E7' }]}> 
            <View style={[styles.progressFill, { 
              backgroundColor: '#007AFF',
              width: `${(revealedCount / totalCards) * 100}%` 
            }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

// Modern Advanced Tab Button with animations and haptic feedback
const ModernTabButton = ({ onPress, icon, label, isActive, badgeCount }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  const badgeScaleAnim = useRef(new Animated.Value(badgeCount > 0 ? 1 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(opacityAnim, {
        toValue: isActive ? 1 : 0.7,
        useNativeDriver: true,
        tension: 120,
        friction: 10,
      }),
      Animated.spring(badgeScaleAnim, {
        toValue: badgeCount > 0 ? 1 : 0,
        useNativeDriver: true,
        tension: 180,
        friction: 12,
      }),
    ]).start();
  }, [isActive, badgeCount]);

  const handlePress = () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Button press animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        tension: 250,
        friction: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 250,
        friction: 10,
      }),
    ]).start();

    // Icon bounce animation
    Animated.sequence([
      Animated.spring(iconScaleAnim, {
        toValue: 1.3,
        useNativeDriver: true,
        tension: 350,
        friction: 8,
      }),
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 350,
        friction: 8,
      }),
    ]).start();

    onPress();
  };

  const getIconComponent = (iconName, size, color) => {
    const iconMap = {
      home: { component: Ionicons, name: isActive ? 'home' : 'home-outline' },
      shuffle: { component: Ionicons, name: isActive ? 'shuffle' : 'shuffle-outline' },
      heart: { component: Ionicons, name: isActive ? 'heart' : 'heart-outline' },
      settings: { component: Ionicons, name: isActive ? 'settings' : 'settings-outline' },
    };

    const iconConfig = iconMap[iconName] || iconMap.home;
    const IconComponent = iconConfig.component;
    
    return <IconComponent name={iconConfig.name} size={size} color={color} />;
  };

  const activeColor = '#FF6B8A';
  const inactiveColor = '#8E8E93';
  const textColor = isActive ? activeColor : inactiveColor;
  const backgroundColor = isActive ? 'rgba(255, 107, 138, 0.08)' : 'transparent';
  const borderColor = isActive ? 'rgba(255, 107, 138, 0.2)' : 'transparent';

  return (
    <Animated.View
      style={[
        styles.modernTabButton,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.modernTabButtonContent,
          {
            backgroundColor,
            borderWidth: isActive ? 1 : 0,
            borderColor,

          },
        ]}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.modernTabIconContainer,
            {
              transform: [{ scale: iconScaleAnim }],
            },
          ]}
        >
          <View
            style={[
              {
                ...(isActive && {
                  shadowColor: '#FF6B8A',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 6,
                }),
              },
            ]}
          >
            {getIconComponent(icon, 26, textColor)}
          </View>
          
          {/* Modern Badge */}
          {badgeCount > 0 && (
            <Animated.View
              style={[
                styles.modernBadge,
                {
                  transform: [{ scale: badgeScaleAnim }],
                },
              ]}
            >
              <Text style={styles.modernBadgeText}>
                {badgeCount > 99 ? '99+' : badgeCount.toString()}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
        
        <Text style={[
          styles.modernTabLabel,
          {
            color: textColor,
            fontWeight: isActive ? '600' : '400',
          },
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Helper function to get consistent tab colors
const getTabColors = (tabName, isActive) => {
  const colors = {
    home: '#007AFF',
    random: '#FF9500', 
    history: '#FF3B30',
    reset: '#34C759'
  };
  
  return {
    buttonColor: colors[tabName] || '#FF6B8A',
    iconColor: isActive ? colors[tabName] || '#FF6B8A' : '#86868B'
  };
};

// Helper functions for history stats
const getMostPopularCategory = (revealedCards) => {
  if (revealedCards.length === 0) return 'None';
  
  const categoryCount = {};
  revealedCards.forEach(card => {
    if (card.category) {
      categoryCount[card.category] = (categoryCount[card.category] || 0) + 1;
    }
  });
  
  const mostPopular = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
  return mostPopular ? mostPopular[0].charAt(0).toUpperCase() + mostPopular[0].slice(1) : 'None';
};

const getAverageBudget = (revealedCards) => {
  if (revealedCards.length === 0) return 'None';
  
  const budgetValues = { low: 1, medium: 2, high: 3 };
  const total = revealedCards.reduce((sum, card) => {
    return sum + (budgetValues[card.budget] || 2);
  }, 0);
  
  const average = total / revealedCards.length;
  if (average <= 1.3) return '$';
  if (average <= 2.3) return '$$';
  return '$$$';
};

const getLocationPreference = (revealedCards) => {
  if (revealedCards.length === 0) return 'None';
  
  const locationCount = {};
  revealedCards.forEach(card => {
    if (card.location) {
      locationCount[card.location] = (locationCount[card.location] || 0) + 1;
    }
  });
  
  const mostPopular = Object.entries(locationCount).sort((a, b) => b[1] - a[1])[0];
  return mostPopular ? mostPopular[0].charAt(0).toUpperCase() + mostPopular[0].slice(1) : 'None';
};

// Settings Screen Component
const SettingsScreen = ({ onClose, onReset, revealedCardsCount }) => {
  return (
    <View style={styles.settingsPage}>
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
          <RNStatusBar 
            barStyle="dark-content" 
            backgroundColor={'#FFFFFF'} 
          />
          <StatusBar style="dark" />
          
          {/* Settings Header */}
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#86868B" />
            </TouchableOpacity>
          </View>

          {/* Settings Content */}
          <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
            
            {/* App Info Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>App Information</Text>
              <View style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <MaterialCommunityIcons name="information" size={24} color="#FF6B8A" />
                  <View style={styles.settingsItemText}>
                    <Text style={styles.settingsItemTitle}>DateGenie</Text>
                    <Text style={styles.settingsItemSubtitle}>Version 1.0.0</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <MaterialCommunityIcons name="heart" size={24} color="#FF6B8A" />
                  <View style={styles.settingsItemText}>
                    <Text style={styles.settingsItemTitle}>Revealed Ideas</Text>
                    <Text style={styles.settingsItemSubtitle}>{revealedCardsCount} date ideas discovered</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Data Management Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Data Management</Text>
              
              <TouchableOpacity 
                style={[styles.settingsItem, styles.dangerItem]}
                onPress={onReset}
              >
                <View style={styles.settingsItemLeft}>
                  <MaterialCommunityIcons name="delete" size={24} color="#FF3B30" />
                  <View style={styles.settingsItemText}>
                    <Text style={[styles.settingsItemTitle, styles.dangerText]}>Reset App Data</Text>
                    <Text style={styles.settingsItemSubtitle}>Clear all revealed ideas and start fresh</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
              </TouchableOpacity>
            </View>

            {/* Support Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Support</Text>
              
              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <MaterialCommunityIcons name="help-circle" size={24} color="#FF6B8A" />
                  <View style={styles.settingsItemText}>
                    <Text style={styles.settingsItemTitle}>Help & FAQ</Text>
                    <Text style={styles.settingsItemSubtitle}>Get help and answers</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <MaterialCommunityIcons name="email" size={24} color="#FF6B8A" />
                  <View style={styles.settingsItemText}>
                    <Text style={styles.settingsItemTitle}>Contact Us</Text>
                    <Text style={styles.settingsItemSubtitle}>Send feedback or report issues</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
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

  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [tutorialKey, setTutorialKey] = useState(0);
  const [showSpinningWheel, setShowSpinningWheel] = useState(false);
  const [wheelSelectedCards, setWheelSelectedCards] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

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
    
    // Load wheel selected cards from AsyncStorage
    AsyncStorage.getItem('wheelSelectedCards').then(data => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setWheelSelectedCards(parsed);
        } catch {
          setWheelSelectedCards([]);
        }
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
      subject: 'DateGenie: Amazing Date Idea',
      body: `I just discovered this amazing date idea: ${expandedCard.idea}\n\nCategory: ${categoryInfo.name}\nBudget: ${expandedCard.budget === 'low' ? '$' : expandedCard.budget === 'medium' ? '$$' : '$$$'}\nLocation: ${expandedCard.location}\n\nShared via DateGenie\n\nLet's make it happen!`,
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
    const message = `I just discovered this amazing date idea: ${expandedCard.idea}\n\nCategory: ${categoryInfo.name}\nBudget: ${expandedCard.budget === 'low' ? '$' : expandedCard.budget === 'medium' ? '$$' : '$$$'}\nLocation: ${expandedCard.location}\n\nShared via DateGenie\n\nLet's make it happen!`;
    
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
          title: 'DateGenie Reminder',
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
      await AsyncStorage.multiRemove(['revealedCards', 'tutorialShown', 'wheelSelectedCards']);
      
      // Reset all state
      setRevealedCards([]);
      setExpandedCard(null);
      setShowHistory(false);
      setShowInvitationModal(false);
      setShowReminderModal(false);
      setShowSpinningWheel(false);
      setSelectedCategory(null);
      setWheelSelectedCards([]);
      
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
    try {
      console.log('Wheel selected card:', cardNumber);
      const selectedCard = dateIdeasData.find(item => item.id === cardNumber);
      if (selectedCard) {
        setExpandedCard(selectedCard);
        
        // Add to wheel selected cards to prevent re-selection
        setWheelSelectedCards(prev => {
          const newSelected = [...prev, cardNumber];
          // Store in AsyncStorage for persistence
          AsyncStorage.setItem('wheelSelectedCards', JSON.stringify(newSelected));
          return newSelected;
        });
        
        // Reveal the card if not already revealed
        if (!revealedCards.some(card => card.id === cardNumber)) {
          const newRevealedCards = [...revealedCards, { ...selectedCard, sequenceNumber: cardNumber }];
          setRevealedCards(newRevealedCards);
          AsyncStorage.setItem('revealedCards', JSON.stringify(newRevealedCards));
        }
      } else {
        console.log('Card not found for number:', cardNumber);
      }
    } catch (error) {
      console.error('Error in handleWheelCardSelect:', error);
    }
  };

  // New gridData logic for category filtering
  let gridData;
  if (!selectedCategory) {
    // No filter: show all actual cards from dateIdeasData
    gridData = dateIdeasData.map((item, idx) => ({ 
      ...item, 
      sequenceNumber: idx + 1 
    }));
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
      sequenceNumber={item.id}
      isRevealed={revealedCards.some(card => card.id === item.id)}
      onPress={() => handleCardPress(item, item.id)}
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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
          onCategorySelect={(key) => {
            console.log('Category selected:', key);
            if (key !== selectedCategory) {
              setShowHistory(false);
              setShowSpinningWheel(false); // Ensure wheel is hidden for non-random categories
              setSelectedCategory(key);
            }
          }}
        />
        <FlatList
          data={gridData}
          renderItem={renderCard}
          keyExtractor={(item, idx) => item.id ? item.id.toString() : `placeholder-${idx}`}
          numColumns={4}
          key="4-column-grid"
          contentContainerStyle={[styles.gridContainer, { backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 8 }]}
          showsVerticalScrollIndicator={true}
        />
        {/* Modern Advanced Tab Bar */}
        <View style={styles.modernTabBar}>
          <View style={styles.modernTabBarBackground} />
          <View style={styles.modernTabBarContent}>
            <ModernTabButton
              onPress={() => {
                setExpandedCard(null);
                setShowInvitationModal(false);
                setShowReminderModal(false);
                setShowSpinningWheel(false);
                setShowHistory(false);
                setSelectedCategory(null);
              }}
              icon="home"
              label="Home"
              isActive={!showHistory && !showSpinningWheel && !expandedCard}
              badgeCount={0}
            />
            <ModernTabButton
              onPress={() => {
                setExpandedCard(null);
                setShowInvitationModal(false);
                setShowReminderModal(false);
                setShowHistory(false);
                setShowSpinningWheel(true);
                setSelectedCategory(null);
              }}
              icon="shuffle"
              label="Random"
              isActive={showSpinningWheel}
              badgeCount={0}
            />
            <ModernTabButton
              onPress={() => {
                setExpandedCard(null);
                setShowInvitationModal(false);
                setShowReminderModal(false);
                setShowSpinningWheel(false);
                setShowHistory(true);
              }}
              icon="heart"
              label="History"
              isActive={showHistory}
              badgeCount={revealedCards.length}
            />
            <ModernTabButton
              onPress={resetAppData}
              icon="settings"
              label="Settings"
              isActive={false}
              badgeCount={0}
            />
          </View>
        </View>
        {expandedCard && (
          <ExpandedCard
            item={expandedCard}
            onClose={closeExpandedCard}
            onShareEmail={shareByEmail}
            onShareSMS={shareBySMS}

            onSetReminder={setReminder}
          />
        )}
        {showHistory && (
          <View style={styles.historyPage}>
            <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
              <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
                <RNStatusBar 
                  barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
                  backgroundColor={'#FFFFFF'} 
                />
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                


                {/* History Content */}
                {revealedCards.length === 0 ? (
                  <View style={styles.emptyHistoryContainer}>
                    <View style={styles.emptyHistoryIconContainer}>
                      <MaterialCommunityIcons name="heart-outline" size={48} color="#FF6B8A" />
                    </View>
                    <Text style={styles.emptyHistoryTitle}>No Date Ideas Yet</Text>
                    <Text style={styles.emptyHistoryText}>
                      Start discovering date ideas by using the Random button or exploring categories.
                    </Text>
                    <View style={styles.emptyHistoryActionContainer}>
                      <TouchableOpacity 
                        style={styles.emptyHistoryActionButton}
                        onPress={() => {
                          setShowHistory(false);
                          setShowSpinningWheel(true);
                        }}
                      >
                        <MaterialCommunityIcons name="dice-multiple" size={20} color="#FF6B8A" />
                        <Text style={styles.emptyHistoryActionText}>Try Random</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.historyContentWrapper}>
                    <FlatList
                      data={revealedCards}
                      renderItem={({ item, index }) => (
                        <HistoryCard
                          item={item}
                          sequenceNumber={item.id}
                          onPress={() => handleCardPress(item, item.id)}
                        />
                      )}
                      keyExtractor={(item, index) => item.id ? item.id.toString() : `history-${index}`}
                      numColumns={2}
                      key="history-grid"
                      contentContainerStyle={styles.historyGridContainer}
                      showsVerticalScrollIndicator={true}
                    />
                  </View>
                )}

                {/* Modern Advanced Tab Bar - Always Visible */}
                <View style={styles.modernTabBar}>
                  <View style={styles.modernTabBarBackground} />
                  <View style={styles.modernTabBarContent}>
                    <ModernTabButton
                      onPress={() => {
                        setExpandedCard(null);
                        setShowInvitationModal(false);
                        setShowReminderModal(false);
                        setShowSpinningWheel(false);
                        setShowHistory(false);
                        setSelectedCategory(null);
                      }}
                      icon="home"
                      label="Home"
                      isActive={!showHistory && !showSpinningWheel && !expandedCard}
                      badgeCount={0}
                    />
                    <ModernTabButton
                      onPress={() => {
                        setExpandedCard(null);
                        setShowInvitationModal(false);
                        setShowReminderModal(false);
                        setShowHistory(false);
                        setShowSpinningWheel(true);
                        setSelectedCategory(null);
                      }}
                      icon="shuffle"
                      label="Random"
                      isActive={showSpinningWheel}
                      badgeCount={0}
                    />
                    <ModernTabButton
                      onPress={() => {
                        setExpandedCard(null);
                        setShowInvitationModal(false);
                        setShowReminderModal(false);
                        setShowSpinningWheel(false);
                        setShowHistory(true);
                      }}
                      icon="heart"
                      label="History"
                      isActive={showHistory}
                      badgeCount={revealedCards.length}
                    />
                    <ModernTabButton
                      onPress={() => {
                        setExpandedCard(null);
                        setShowInvitationModal(false);
                        setShowReminderModal(false);
                        setShowSpinningWheel(false);
                        setShowHistory(false);
                        setShowSettings(true);
                        setSelectedCategory(null);
                      }}
                      icon="settings"
                      label="Settings"
                      isActive={showSettings}
                      badgeCount={0}
                    />
                  </View>
                </View>

              </SafeAreaView>
            </View>
          </View>
        )}
        {showSettings && (
          <SettingsScreen
            onClose={() => setShowSettings(false)}
            onReset={resetAppData}
            revealedCardsCount={revealedCards.length}
          />
        )}

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
          onSpinStart={closeExpandedCard}
          excludedCards={wheelSelectedCards}
          totalCards={dateIdeasData.length}
        />
      </SafeAreaView>
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
  historyCard: {
    width: (width - 48) / 2,
    height: 200,
    margin: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  historyCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    flexWrap: 'wrap',
  },
  historyContentWrapper: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 16,
  },
  historyGridContainer: {
    padding: 16,
    paddingBottom: 120,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
    maxHeight: height * 0.5,
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
  // New History Page Styles
  historyPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F9FA',
    zIndex: 1000,
  },
  historyTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  historyTitleContainer: {
    flex: 1,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyTitleIcon: {
    marginRight: 8,
  },
  historyPageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF6B8A',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: -0.8,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 107, 138, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  historyPageSubtitle: {
    fontSize: 13,
    fontWeight: 400,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginTop: 2,
    textAlign: 'center',
  },
  historyStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyStatText: {
    fontSize: 13,
    fontWeight: 500,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginLeft: 4,
  },
  historyStatDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E5E7',
    marginHorizontal: 12,
  },
  historyCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  emptyHistoryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyHistoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyHistoryTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHistoryActionContainer: {
    marginTop: 24,
  },
  emptyHistoryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B8A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#FF6B8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyHistoryActionText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginLeft: 8,
  },
  historyStatsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 700,
    color: '#FF6B8A',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textAlign: 'center',
  },
  historyContentContainer: {
    flex: 1,
  },
  historySectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 4,
  },
  historySectionSubtitle: {
    fontSize: 13,
    fontWeight: 400,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 10,
    left: 16,
    right: 16,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  tabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 24,
  },
  tabBarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 48,
  },
  tabBarButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  tabBarIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    position: 'relative',
  },
  tabBarBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tabBarBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textAlign: 'center',
    lineHeight: 14,
  },
  // Advanced Professional Tab Bar Styles
  modernTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 92 : 68,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
    zIndex: 1000,
  },
  modernTabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modernTabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  modernTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  modernTabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    minHeight: 52,
  },
  modernTabIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  modernTabLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  modernBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  modernBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textAlign: 'center',
    lineHeight: 14,
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
    paddingVertical: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'System',
    marginBottom: 4,
  },
  textInput: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'System',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: 'System',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'System',
    marginBottom: 4,
  },
  textInput: {
    fontSize: 16,
    color: '#1D1D1F',
    fontFamily: 'System',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
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
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: height * 0.8,
  },
  wheelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  wheelHeaderContent: {
    flex: 1,
  },
  wheelTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    fontFamily: 'System',
    marginBottom: 2,
  },
  wheelSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'System',
  },
  wheelCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  wheelContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  wheelStats: {
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  wheelStatsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: 'System',
  },
  wheelWrapper: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  wheel: {
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 6,
    borderColor: '#FFFFFF',
  },
  wheelPointer: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -10 }],
    width: 20,
    height: 20,
    backgroundColor: '#667eea',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  wheelPointerInner: {
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  resultContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    fontFamily: 'System',
    textAlign: 'center',
  },
  resultSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'System',
    marginTop: 4,
    textAlign: 'center',
  },
  wheelSegment: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 110,
    borderRightWidth: 110,
    borderBottomWidth: 110,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#667eea', // Default modern color
    transform: [{ rotate: '0deg' }],
  },
  wheelSegmentInner: {
    position: 'absolute',
    top: 45,
    left: -12,
    width: 24,
    alignItems: 'center',
  },
  wheelSegmentText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  wheelCenter: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  wheelCenterInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  wheelCenterText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  spinButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  spinButtonDisabled: {
    backgroundColor: '#A0A0A0',
    shadowOpacity: 0.1,
  },
  spinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    textAlign: 'center',
  },
  wheelInstructions: {
    marginBottom: 16,
  },
  wheelInstructionText: {
    fontSize: 13,
    color: '#8E8E93',
    fontFamily: 'System',
    textAlign: 'center',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    width: width - 16,
    height: height * 0.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  expandedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
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
    padding: 19,
    flex: 1,
    minHeight: 0,
  },
  dateIdeaText: {
    fontSize: 21,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 27,
    marginBottom: 19,
    textAlign: 'left',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  categoryDescriptionContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  categoryDescriptionText: {
    fontSize: 17,
    color: '#6C757D',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textAlign: 'left',
    fontStyle: 'italic',
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#495057',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipBullet: {
    fontSize: 16,
    color: '#FFC107',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#495057',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 20,
    flex: 1,
  },
  quickInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 18,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 500,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  expandedActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
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
    fontWeight: 500,
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
  // Settings Styles
  settingsPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F9FA',
    zIndex: 1000,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    marginLeft: 12,
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  dangerText: {
    color: '#FF3B30',
  },
});