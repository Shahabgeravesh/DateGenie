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
  Share,
  Image
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
import GenieIcon from './GenieIcon';

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
  random: { iconSet: 'MaterialCommunityIcons', icon: 'slot-machine', color: '#D4A5A5', name: 'GeniePick', description: 'Spin & Discover' },
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
      ios: 'shuffle',
      android: 'shuffle',
      fallback: 'dice-multiple'
    },
    budget: {
      ios: 'card',
      android: 'credit-card',
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

  const iconConfig = iconMap[category] || iconMap.romantic;

  if (Platform.OS === 'ios') {
    return <Ionicons name={iconConfig.ios} size={size} color={color || '#000'} />;
  } else if (Platform.OS === 'android') {
    return <MaterialIcons name={iconConfig.android} size={size} color={color || '#000'} />;
  } else {
    // Fallback to MaterialCommunityIcons for web or other platforms
    return <MaterialCommunityIcons name={iconConfig.fallback} size={size} color={color || '#000'} />;
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
  // All numbers 1-100 use the same font as number 4 (Marker Felt/cursive)
  return Platform.OS === 'ios' ? 'Marker Felt' : 'cursive'; // Playful marker font
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
      ios: isDark ? '#07F' : '#FF6B8A', // DateGenie pink
      android: isDark ? '#BB86FC' : '#FF6B8A', // DateGenie pink
      default: isDark ? '#07F' : '#FF6B8A'
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

// Simple Tutorial Component
const Tutorial = ({ visible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const tutorialSteps = [
    {
      title: "Welcome to DateGenie",
      message: "Your personal genie for discovering creative date ideas. Tap any card to reveal a surprise.",
      icon: 'cards',
      color: "#FF6B8A"
    },
    {
      title: "Explore",
      message: "Use categories to find exactly what you're looking for - romantic, adventurous, cozy, and more.",
      icon: 'filter-variant',
      color: "#FF6B8A"
    },
    {
      title: "Share & Save",
      message: "Found the perfect date? Share it with your partner via email or message instantly.",
      icon: 'share-variant',
      color: "#FF6B8A"
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

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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


        {/* Main Content */}
        <View style={styles.tutorialMainContent}>
          {/* Icon Section */}
          <View style={styles.tutorialIconSection}>
            {currentStep === 0 ? (
              <View style={styles.genieGlowContainer}>
                <Image 
                  source={require('./assets/Genie.png')} 
                  style={styles.genieImage}
                />
                {/* Yellow Glitters */}
                <View style={styles.glitterContainer}>
                  <MaterialCommunityIcons name="star" size={12} color="#FFD700" style={styles.glitter1} />
                  <MaterialCommunityIcons name="star" size={8} color="#FFD700" style={styles.glitter2} />
                  <MaterialCommunityIcons name="star" size={10} color="#FFD700" style={styles.glitter3} />
                  <MaterialCommunityIcons name="star" size={14} color="#FFD700" style={styles.glitter4} />
                  <MaterialCommunityIcons name="star" size={9} color="#FFD700" style={styles.glitter5} />
                  <MaterialCommunityIcons name="star" size={11} color="#FFD700" style={styles.glitter6} />
                </View>
              </View>
            ) : (
              <View style={styles.genieGlowContainer}>
                <View style={[styles.iconContainer, { backgroundColor: currentTutorial.color }]}>
                  <MaterialCommunityIcons 
                    name={currentTutorial.icon} 
                    size={48} 
                    color="#FFFFFF" 
                  />
                </View>
              </View>
            )}
          </View>

          {/* Text Section */}
          <View style={styles.tutorialTextSection}>
            <Text style={styles.tutorialTitle}>{currentTutorial.title}</Text>
            <Text style={styles.tutorialMessage}>{currentTutorial.message}</Text>
          </View>

          {/* Progress Dots */}
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
        </View>

        {/* Navigation Buttons */}
        <View style={styles.tutorialNavigation}>
          <TouchableOpacity 
            onPress={previousStep} 
            style={[styles.navButton, { opacity: currentStep > 0 ? 1 : 0 }]}
            disabled={currentStep === 0}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#8E8E93" />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={nextStep} style={[styles.primaryButton, { backgroundColor: currentTutorial.color }]}>
            <Text style={styles.primaryButtonText}>
              {currentStep === tutorialSteps.length - 1 ? "Get Started" : "Next"}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// Enhanced Small Card Component
// Scratch Card Component - Creates realistic scratch-off experience
const ScratchCard = ({ item, sequenceNumber, onReveal, onClose }) => {
  const [isScratched, setIsScratched] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [scratchPoints, setScratchPoints] = useState([]);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedAreas, setScratchedAreas] = useState([]);
  const cardRef = useRef(null);

  // Create pan responder for scratch detection
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setScratchPoints([{ x: locationX, y: locationY }]);
        setIsScratching(true);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setScratchPoints(prev => [...prev, { x: locationX, y: locationY }]);
        
        // Add multiple scratched areas for precision
        setScratchedAreas(prev => {
          // Create multiple small areas around the touch point for precision
          const newAreas = [];
          for (let i = 0; i < 2; i++) {
            const offsetX = (Math.random() - 0.5) * 4;
            const offsetY = (Math.random() - 0.5) * 4;
            newAreas.push({ 
              x: locationX + offsetX, 
              y: locationY + offsetY, 
              radius: 2 + Math.random() * 2 
            });
          }
          
          const updatedAreas = [...prev, ...newAreas];
          
          // Trigger haptic feedback less frequently for precision
          if (updatedAreas.length % 10 === 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          
          return updatedAreas;
        });
      },
      onPanResponderRelease: () => {
        setIsScratching(false);
      }
    })
  ).current;

  // Update progress and check for reveal when scratched areas change
  useEffect(() => {
    const totalScratched = scratchedAreas.length;
    const newProgress = Math.min((totalScratched / 200) * 100, 100);
    setScratchProgress(newProgress);
    
    // Reveal when enough is scratched
    if (newProgress >= 85 && !isScratched) {
      setIsScratched(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onReveal();
    }
  }, [scratchedAreas, isScratched, onReveal]);

  // Get the date idea text
  const getDateIdeaText = (item) => {
    if (item.idea) return item.idea;
    const found = dateIdeasData.find(g => g.id === item.id);
    return found && found.idea ? found.idea : `Date idea #${item.id}`;
  };

  const dateIdeaText = getDateIdeaText(item);
  const categoryInfo = categories[item.category] || categories.romantic;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.scratchModalOverlay}>
        <View style={styles.scratchCardContainer}>
          {/* Close button */}
          <TouchableOpacity 
            style={styles.scratchCloseButton} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={24} color="#666" />
          </TouchableOpacity>

          {/* Progress indicator at top */}
          <View style={styles.scratchProgressContainer}>
            <View style={styles.scratchProgressBar}>
              <View 
                style={[
                  styles.scratchProgressFill,
                  { width: `${scratchProgress}%` }
                ]}
              />
            </View>
            <Text style={styles.scratchProgressText}>{Math.round(scratchProgress)}% scratched</Text>
          </View>

          {/* Scratch Card */}
          <View 
            ref={cardRef}
            style={styles.scratchCard}
          >
            {/* Date Idea Content */}
            <View style={styles.scratchCardContent}>
              <View style={styles.scratchCardHeader}>
                <View style={styles.scratchCardNumber}>
                  <Text style={styles.scratchCardNumberText}>#{sequenceNumber}</Text>
                </View>
                <View style={styles.scratchCardCategory}>
                  {getCategoryIcon(item.category, 24, categoryInfo.color)}
                  <Text style={styles.scratchCardCategoryText}>{categoryInfo.name}</Text>
                </View>
              </View>
              
              {/* Date Idea Text with Scratch Layer */}
              <View style={styles.scratchIdeaContainer}>
                {/* Text that shows through scratched areas */}
                <Text style={styles.scratchCardIdeaText}>{dateIdeaText}</Text>
                
                {/* Scratch Layer - completely covers the text */}
                <View 
                  style={[
                    styles.scratchLayer,
                    {
                      transform: [{ scale: isScratching ? 1.02 : 1 }]
                    }
                  ]}
                  {...panResponder.panHandlers}
                >
                  {/* Solid gray background that completely covers text */}
                  <View style={styles.scratchBackground} />
                  
                  {/* Scratch pattern overlay - more precise */}
                  <View style={styles.scratchPattern}>
                    {Array.from({ length: 80 }).map((_, i) => (
                      <View 
                        key={i}
                        style={[
                          styles.scratchLine,
                          {
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            transform: [{ rotate: `${Math.random() * 360}deg` }],
                            opacity: Math.random() * 0.3 + 0.05,
                            width: Math.random() * 1 + 0.3,
                            height: Math.random() * 15 + 6
                          }
                        ]}
                      />
                    ))}
                  </View>
                  
                  {/* Scratch instruction */}
                  <View style={styles.scratchInstruction}>
                    <MaterialCommunityIcons name="hand-pointing-up" size={32} color="#999" />
                    <Text style={styles.scratchInstructionText}>Scratch to reveal</Text>
                  </View>
                  
                  {/* Scratched areas - create holes by covering with transparent circles */}
                  {scratchedAreas.slice(-100).map((area, index) => (
                    <View
                      key={index}
                      style={[
                        styles.scratchHole,
                        {
                          left: area.x - area.radius,
                          top: area.y - area.radius,
                          width: area.radius * 2,
                          height: area.radius * 2,
                          borderRadius: area.radius,
                          backgroundColor: 'transparent',
                          borderWidth: 0,
                          // Use a very subtle shadow to create a hole effect
                          shadowColor: 'transparent',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0,
                          shadowRadius: 0,
                          elevation: 0,
                        }
                      ]}
                    />
                  ))}
                </View>

                {/* Scratch trail visualization - more precise */}
                {scratchPoints.slice(-30).map((point, index) => (
                  <View
                    key={index}
                    style={[
                      styles.scratchPoint,
                      {
                        left: point.x - 1,
                        top: point.y - 1,
                        opacity: Math.max(0, 1 - (index / 30)),
                        width: Math.random() * 2 + 1,
                        height: Math.random() * 2 + 1,
                        borderRadius: Math.random() * 1 + 0.5
                      }
                    ]}
                  />
                ))}
              </View>
              
              <View style={styles.scratchCardFooter}>
                <View style={styles.scratchCardInfo}>
                  <MaterialCommunityIcons name="currency-usd" size={16} color="#666" />
                  <Text style={styles.scratchCardInfoText}>
                    {item.budget === 'low' ? '$' : item.budget === 'medium' ? '$$' : '$$$'}
                  </Text>
                </View>
                <View style={styles.scratchCardInfo}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                  <Text style={styles.scratchCardInfoText}>{item.location}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
          borderColor: '#5B21B6',
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
            color: '#FF6B8A',
            textShadowColor: 'rgba(255,107,138,0.3)',
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
            color="#FF6B8A" 
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
              <View style={styles.wheelTitleSparkles}>
                <MaterialCommunityIcons name="star" size={12} color="rgba(233, 30, 99, 0.7)" style={styles.wheelTitleSparkle1} />
                <MaterialCommunityIcons name="star" size={10} color="rgba(156, 39, 176, 0.6)" style={styles.wheelTitleSparkle2} />
              </View>
              <View style={styles.wheelTitleContainer}>
                <Text style={[styles.wheelTitle, { color: '#E91E63' }]}>G</Text>
                <Text style={[styles.wheelTitle, { color: '#8B5CF6' }]}>e</Text>
                <Text style={[styles.wheelTitle, { color: '#E91E63' }]}>n</Text>
                <Text style={[styles.wheelTitle, { color: '#8B5CF6' }]}>i</Text>
                <Text style={[styles.wheelTitle, { color: '#E91E63' }]}>e</Text>
                <Text style={[styles.wheelTitle, { color: '#8B5CF6' }]}> </Text>
                <Text style={[styles.wheelTitle, { color: '#E91E63' }]}>P</Text>
                <Text style={[styles.wheelTitle, { color: '#8B5CF6' }]}>i</Text>
                <Text style={[styles.wheelTitle, { color: '#E91E63' }]}>c</Text>
                <Text style={[styles.wheelTitle, { color: '#8B5CF6' }]}>k</Text>
              </View>
              <View style={styles.wheelTitleSparkles}>
                <MaterialCommunityIcons name="star" size={10} color="rgba(156, 39, 176, 0.6)" style={styles.wheelTitleSparkle3} />
                <MaterialCommunityIcons name="star" size={12} color="rgba(233, 30, 99, 0.7)" style={styles.wheelTitleSparkle4} />
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.wheelCloseButton}>
              <MaterialCommunityIcons name="close" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          
          {/* Genie Image with Glitters */}
          <View style={styles.wheelGenieSection}>
            <View style={styles.wheelGenieGlowContainer}>
              <Image 
                source={require('./assets/Genie 2.jpeg')} 
                style={styles.wheelGenieImage}
              />
              {/* Yellow Glitters */}
              <View style={styles.wheelGlitterContainer}>
                <MaterialCommunityIcons name="star" size={8} color="#FFD700" style={styles.wheelGlitter1} />
                <MaterialCommunityIcons name="star" size={6} color="#FFD700" style={styles.wheelGlitter2} />
                <MaterialCommunityIcons name="star" size={7} color="#FFD700" style={styles.wheelGlitter3} />
                <MaterialCommunityIcons name="star" size={9} color="#FFD700" style={styles.wheelGlitter4} />
                <MaterialCommunityIcons name="star" size={6} color="#FFD700" style={styles.wheelGlitter5} />
                <MaterialCommunityIcons name="star" size={8} color="#FFD700" style={styles.wheelGlitter6} />
              </View>
            </View>
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
              {isSpinning ? 'Finding your date idea...' : 'Let Genie Pick your Date'}
            </Text>
          </TouchableOpacity>
          

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
    random: { name: 'GeniePick', icon: '', color: '#D4A5A5', description: '' },
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
          contentContainerStyle={{ paddingBottom: 12 }}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          alwaysBounceVertical={false}
        >
          {/* Date Idea Title */}
          <Text style={[
            styles.dateIdeaText,
            {
              fontFamily: getFunFont(item.sequenceNumber),
              color: getFunColor(item.sequenceNumber),
            }
          ]}>
            {item.placeholder ? 'Date idea coming soon!' : (item.idea || 'No idea found')}
          </Text>




          
          {/* Quick Info */}
          <View style={styles.quickInfoContainer}>
            <View style={styles.infoItem}>
              <Text style={[
                styles.infoLabel,
                { fontFamily: getFunFont(item.sequenceNumber) }
              ]}>Budget</Text>
              <Text style={[
                styles.infoValue,
                { fontFamily: getFunFont(item.sequenceNumber) }
              ]}>
                {item.budget === 'low' ? '$' : item.budget === 'medium' ? '$$' : '$$$'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[
                styles.infoLabel,
                { fontFamily: getFunFont(item.sequenceNumber) }
              ]}>Location</Text>
              <Text style={[
                styles.infoValue,
                { fontFamily: getFunFont(item.sequenceNumber) }
              ]}>
                {item.location === 'indoor' ? 'Indoor' : 'Outdoor'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[
                styles.infoLabel,
                { fontFamily: getFunFont(item.sequenceNumber) }
              ]}>Category</Text>
              <Text style={[
                styles.infoValue,
                { color: categoryInfo.color, fontFamily: getFunFont(item.sequenceNumber) }
              ]}>
                {categoryInfo.name}
              </Text>
            </View>
          </View>

          {/* Share Button - Centered */}
          <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 4 }}>
          <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: 40, 
                paddingHorizontal: 24,
                borderRadius: 20, 
                backgroundColor: '#FF6B8A',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }} 
            onPress={() => shareDateIdea(item)}
            activeOpacity={0.85}
          >
              <MaterialCommunityIcons name="share-variant" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', fontFamily: 'System' }}>Share</Text>
          </TouchableOpacity>
        </View>

        </ScrollView>
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
const SubscriptionModal = ({ visible, onClose, onSubscribe, email, name, setName, setEmail }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim() || !name.trim()) {
      showPlatformAlert('Missing Information', 'Please enter both your name and email address.', [
        { text: 'OK', style: 'default' }
      ]);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showPlatformAlert('Invalid Email', 'Please enter a valid email address (e.g., user@example.com).', [
        { text: 'OK', style: 'default' }
      ]);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Store locally first (always works)
      const subscriptions = await AsyncStorage.getItem('subscriptions') || '[]';
      const subscriptionList = JSON.parse(subscriptions);
      const newSubscription = {
        name: name.trim(),
        email: email.trim(),
        timestamp: new Date().toISOString(),
        source: 'DateGenie App'
      };
      subscriptionList.push(newSubscription);
      await AsyncStorage.setItem('subscriptions', JSON.stringify(subscriptionList));
      
      // Send to Google Sheets via GET request (non-blocking)
      const params = new URLSearchParams({
        name: newSubscription.name,
        email: newSubscription.email,
        timestamp: newSubscription.timestamp,
        source: newSubscription.source
      });
      
      // Make the request non-blocking so it doesn't freeze the app
      console.log('Sending to Google Sheets:', params.toString());
      fetch(`https://script.google.com/macros/s/AKfycbwg4qYCvv9FSifjpBpk9AgnEGeuVgzYSvJ03wAE2NaQpcuQkkwIiUbYov4Vs3grA4DQ/exec?${params}`, {
        method: 'GET'
      })
      .then(response => {
        console.log('Google Sheets response status:', response.status);
        console.log('Google Sheets response ok:', response.ok);
        if (response.ok) {
          return response.text();
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      })
      .then(responseText => {
        console.log('Google Sheets response text:', responseText);
        console.log('Successfully sent to Google Sheets');
      })
      .catch(error => {
        console.log('Google Sheets submission failed, but data is saved locally:', error.message);
      });
      
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Show success message and close after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setEmail('');
        setName('');
        // Call onSubscribe after modal is closed to avoid conflicts
        setTimeout(() => {
          onSubscribe();
        }, 100);
      }, 2000);
      
    } catch (error) {
      console.error('Subscription error:', error);
      setIsSubmitting(false);
      
      // Even if everything fails, show success to user
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setEmail('');
        setName('');
        // Call onSubscribe after modal is closed to avoid conflicts
        setTimeout(() => {
          onSubscribe();
        }, 100);
      }, 2000);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.subscriptionModal}>
          {!showSuccess ? (
            <>
              <View style={styles.subscriptionHeader}>
                <MaterialCommunityIcons name="email-outline" size={32} color="#8B5CF6" />
                <Text style={styles.subscriptionTitle}>Stay in Contact with Genie</Text>
                <Text style={styles.subscriptionSubtitle}>Get magical date ideas delivered to your inbox</Text>
              </View>

              <View style={styles.subscriptionForm}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Your Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.subscriptionActions}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.subscribeButton,
                    isSubmitting && styles.subscribeButtonDisabled
                  ]} 
                  onPress={handleSubscribe}
                  activeOpacity={0.7}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Text style={styles.subscribeButtonText}>Connecting...</Text>
                  ) : (
                    <Text style={styles.subscribeButtonText}>Connect with Genie</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <MaterialCommunityIcons name="check-circle" size={64} color="#8B5CF6" />
              <Text style={styles.successTitle}>Connected with Genie!</Text>
              <Text style={styles.successMessage}>
                You're now connected with your magical Genie friend.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

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
          <Text style={[styles.progressText, { color: '#8B5CF6', fontFamily: 'System' }]}> 
            {revealedCount} / {totalCards} Revealed
          </Text>
          <View style={[styles.progressBar, { backgroundColor: '#D1D5DB' }]}> 
            <View style={[styles.progressFill, { 
              backgroundColor: '#8B5CF6',
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
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(opacityAnim, {
        toValue: isActive ? 1 : 0.85,
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
      genie: { component: 'image', source: require('./assets/GenieTabIcon.png') },
    };

    const iconConfig = iconMap[iconName] || iconMap.home;
    
    if (iconConfig.component === 'image') {
      return (
        <Image 
          source={iconConfig.source} 
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      );
    }
    
    const IconComponent = iconConfig.component;
    return <IconComponent name={iconConfig.name} size={size} color={color} />;
  };

  const activeColor = '#FF6B8A';
  const inactiveColor = '#4C1D95';
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
        
        <Text 
          style={[
            styles.modernTabLabel,
            {
              color: textColor,
              fontWeight: isActive ? '600' : '400',
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Helper function to get consistent tab colors
const getTabColors = (tabName, isActive) => {
  const colors = {
    home: '#FF6B8A',
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
const SettingsScreen = ({ onClose, onReset, revealedCardsCount, onNavigateHome, onNavigateRandom, onNavigateHistory, showHistory, showSpinningWheel, expandedCard, showSettings, onSubscribeNewsletter }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.settingsPage}>
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
          <RNStatusBar 
            barStyle="dark-content" 
            backgroundColor={'#FFFFFF'} 
          />
          <StatusBar style="dark" />
          
          {/* Settings Content */}
          <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
            
            {/* App Info Section */}
            <Animated.View 
              style={[
                styles.settingsSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <View style={styles.appInfoCard}>
                <View style={styles.appInfoHeader}>
                  <View style={[styles.appIconContainer, { backgroundColor: 'transparent', borderRadius: 0 }]}>
                    <Image 
                      source={require('./assets/Genie 2.jpeg')} 
                      style={{ width: 48, height: 48 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.appInfoText}>
                    <Text style={styles.appName}>DateGenie</Text>
                  </View>
                </View>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{revealedCardsCount}</Text>
                    <Text style={styles.statLabel}>Ideas Discovered</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>100</Text>
                    <Text style={styles.statLabel}>Total Ideas</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Data Management Section */}
            <Animated.View 
              style={[
                styles.settingsSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.resetCard}
                onPress={onReset}
                activeOpacity={0.8}
              >
                <View style={styles.resetIconContainer}>
                  <MaterialCommunityIcons name="refresh" size={24} color="#FF3B30" />
                </View>
                <View style={styles.resetContent}>
                  <Text style={styles.resetTitle}>Reset App Data</Text>
                  <Text style={styles.resetSubtitle}>Clear all revealed ideas and start fresh</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            </Animated.View>

            {/* Newsletter Section */}
            <Animated.View 
              style={[
                styles.settingsSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <View style={styles.newsletterCard}>
                <View style={styles.newsletterIconContainer}>
                  <MaterialCommunityIcons name="email-outline" size={28} color="#8B5CF6" />
                </View>
                <View style={styles.newsletterContent}>
                  <Text style={styles.newsletterTitle}>Stay in Contact with Genie</Text>
                  <Text style={styles.newsletterSubtitle}>Keep the magic alive with fresh date ideas</Text>
                </View>
                <TouchableOpacity 
                  style={styles.newsletterButton} 
                  activeOpacity={0.8}
                  onPress={onSubscribeNewsletter}
                >
                  <Text style={styles.newsletterButtonText}>Subscribe</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
              </TouchableOpacity>
                </View>
            </Animated.View>

          </ScrollView>

          {/* Modern Advanced Tab Bar - Always Visible */}
          <View style={styles.modernTabBar}>
            <View style={styles.modernTabBarBackground} />
            <View style={styles.modernTabBarContent}>
              <ModernTabButton
                onPress={onNavigateHome}
                icon="home"
                label="Home"
                isActive={!showHistory && !showSpinningWheel && !expandedCard && !showSettings}
                badgeCount={0}
              />
              <ModernTabButton
                onPress={onNavigateRandom}
                icon="genie"
                label="Genie Pick"
                isActive={showSpinningWheel}
                badgeCount={0}
              />
              <ModernTabButton
                onPress={onNavigateHistory}
                icon="heart"
                label="History"
                isActive={showHistory}
                badgeCount={0}
              />
              <ModernTabButton
                onPress={() => {}} // Settings is already active
                icon="settings"
                label="Settings"
                isActive={true}
                badgeCount={0}
              />
            </View>
          </View>
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
  const [scratchCard, setScratchCard] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true); // Force tutorial to show

  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [tutorialKey, setTutorialKey] = useState(0);
  const [showSpinningWheel, setShowSpinningWheel] = useState(false);
  const [wheelSelectedCards, setWheelSelectedCards] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [subscriptionName, setSubscriptionName] = useState('');


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
    // AsyncStorage.getItem('tutorialShown').then(data => {
    //   if (!data) {
    //     setShowTutorial(true);
    //   }
    // });
    
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
    const isAlreadyRevealed = revealedCards.some(card => card.id === item.id);
    
    if (!isAlreadyRevealed) {
      // New card - show scratch card (don't add to revealed cards yet)
      setScratchCard({ ...item, sequenceNumber });
    } else {
      // Already revealed card - show expanded card directly
      setExpandedCard({ ...item, sequenceNumber });
    }
  };

  const closeExpandedCard = () => {
    setExpandedCard(null);
  };

  const closeScratchCard = () => {
    setScratchCard(null);
  };

  const handleScratchReveal = () => {
    // The scratch card will automatically close after reveal
    // and show the expanded card with full details
    if (scratchCard) {
      // Add the card to revealed cards only after successful scratch
      const newRevealed = [...revealedCards, { ...scratchCard }];
      setRevealedCards(newRevealed);
      AsyncStorage.setItem('revealedCards', JSON.stringify(newRevealed));
      
      setExpandedCard(scratchCard);
      setScratchCard(null);
    }
  };

  const handleSubscribeNewsletter = () => {
    setShowSubscriptionModal(true);
  };

  const onSubscriptionComplete = () => {
    // Success is already shown in the modal, no need for additional alert
    console.log('Subscription completed successfully');
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
      
      // Reset completed successfully - no need for success alert since user already confirmed
      console.log('App data reset successfully');
    } catch (error) {
      console.error('Reset app data error:', error);
      showPlatformAlert('Error', 'Unable to reset app data.', [
        { text: 'OK', style: 'default' }
      ], null);
    }
  };

  const handleResetWithConfirmation = () => {
    showConfirmation(
      'Reset App Data',
      'This will permanently delete all your revealed date ideas and reset the app to its initial state. This action cannot be undone.',
      () => {
        // User confirmed - proceed with reset
        resetAppData();
      },
      () => {
        // User cancelled - do nothing
        console.log('Reset cancelled by user');
      }
    );
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
              icon="genie"
              label="Genie Pick"
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
              badgeCount={0}
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
        {expandedCard && (
          <ExpandedCard
            item={expandedCard}
            onClose={closeExpandedCard}
            onShareEmail={shareByEmail}
            onShareSMS={shareBySMS}

            onSetReminder={setReminder}
          />
        )}
        {scratchCard && (
          <ScratchCard
            item={scratchCard}
            sequenceNumber={scratchCard.sequenceNumber}
            onReveal={handleScratchReveal}
            onClose={closeScratchCard}
          />
        )}

        {/* Subscription Modal */}
        <SubscriptionModal
          visible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={onSubscriptionComplete}
          email={subscriptionEmail}
          name={subscriptionName}
          setEmail={setSubscriptionEmail}
          setName={setSubscriptionName}
        />
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
                      Start discovering date ideas by using the GeniePick button or exploring categories.
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
                        <Text style={styles.emptyHistoryActionText}>Try GeniePick</Text>
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
                      icon="genie"
                      label="Genie Pick"
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
                      badgeCount={0}
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
            onReset={handleResetWithConfirmation}
            onSubscribeNewsletter={handleSubscribeNewsletter}
            revealedCardsCount={revealedCards.length}
            onNavigateHome={() => {
              setShowSettings(false);
              setExpandedCard(null);
              setShowInvitationModal(false);
              setShowReminderModal(false);
              setShowSpinningWheel(false);
              setShowHistory(false);
              setSelectedCategory(null);
            }}
            onNavigateRandom={() => {
              setShowSettings(false);
              setExpandedCard(null);
              setShowInvitationModal(false);
              setShowReminderModal(false);
              setShowHistory(false);
              setShowSpinningWheel(true);
              setSelectedCategory(null);
            }}
            onNavigateHistory={() => {
              setShowSettings(false);
              setExpandedCard(null);
              setShowInvitationModal(false);
              setShowReminderModal(false);
              setShowSpinningWheel(false);
              setShowHistory(true);
            }}
            showHistory={showHistory}
            showSpinningWheel={showSpinningWheel}
            expandedCard={expandedCard}
            showSettings={showSettings}
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
    backgroundColor: '#D1D5DB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
    backgroundColor: '#8B5CF6',
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
    backgroundColor: '#FF6B8A',
    borderColor: '#FF6B8A',
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
    color: '#FF6B8A',
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
    color: '#FF6B8A',
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
    paddingHorizontal: 16,
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
    paddingHorizontal: 12,
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
    fontSize: 11,
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
    width: '92%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 20,
    maxHeight: height * 0.85,
    overflow: 'hidden',
  },
  wheelHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  wheelHeaderContent: {
    flex: 1,
  },
  wheelTitleContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 8,
  },
  wheelTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelTitle: {
    fontSize: 26,
    fontWeight: '900',
    fontFamily: 'System',
    fontStyle: 'italic',
    marginBottom: 0,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(233, 30, 99, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  wheelTitleSparkles: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  wheelTitleSparkle1: {
    position: 'absolute',
    top: -5,
    left: -20,
  },
  wheelTitleSparkle2: {
    position: 'absolute',
    top: 5,
    left: -15,
  },
  wheelTitleSparkle3: {
    position: 'absolute',
    top: -5,
    right: -20,
  },
  wheelTitleSparkle4: {
    position: 'absolute',
    top: 5,
    right: -15,
  },
  wheelSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: 'System',
    fontWeight: '500',
  },
  wheelCloseButton: {
    padding: 10,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  wheelGenieSection: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: '#FFFFFF',
  },
  wheelGenieGlowContainer: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelGenieImage: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },
  wheelGlitterContainer: {
    position: 'absolute',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelGlitter1: {
    position: 'absolute',
    top: -10,
    right: -15,
  },
  wheelGlitter2: {
    position: 'absolute',
    bottom: -8,
    left: -12,
  },
  wheelGlitter3: {
    position: 'absolute',
    top: 15,
    left: -10,
  },
  wheelGlitter4: {
    position: 'absolute',
    bottom: 10,
    right: -8,
  },
  wheelGlitter5: {
    position: 'absolute',
    top: -5,
    left: -5,
  },
  wheelGlitter6: {
    position: 'absolute',
    bottom: -12,
    right: -3,
  },
  wheelContent: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
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
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  wheel: {
    width: 260,
    height: 260,
    borderRadius: 130,
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
    marginBottom: 16,
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
    paddingVertical: 18,
    paddingHorizontal: 44,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 200,
  },
  spinButtonDisabled: {
    backgroundColor: '#A0A0A0',
    shadowOpacity: 0.1,
  },
  spinButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  wheelInstructions: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  wheelInstructionText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'System',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
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
    padding: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandedCardNumber: {
    fontSize: 18,
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
    padding: 8,
    flex: 1,
    minHeight: 0,
  },
  dateIdeaText: {
    fontSize: 17,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 22,
    marginBottom: 8,
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
    marginBottom: 8,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'Roboto' : 'System',
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
  // Professional Tutorial Styles
  tutorialFullScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialContent: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },

  tutorialMainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  tutorialIconSection: {
    marginBottom: 40,
    alignItems: 'center',
  },

  genieGlowContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genieImage: {
    width: 260,
    height: 260,
    resizeMode: 'contain',
  },
  glitterContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glitter1: {
    position: 'absolute',
    top: -20,
    right: -30,
  },
  glitter2: {
    position: 'absolute',
    bottom: -15,
    left: -25,
  },
  glitter3: {
    position: 'absolute',
    top: 30,
    left: -20,
  },
  glitter4: {
    position: 'absolute',
    bottom: 20,
    right: -15,
  },
  glitter5: {
    position: 'absolute',
    top: -10,
    left: -10,
  },
  glitter6: {
    position: 'absolute',
    bottom: -25,
    right: -5,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  tutorialTextSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  tutorialTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: -0.5,
  },
  tutorialMessage: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: -0.1,
  },
  tutorialProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
    backgroundColor: '#E5E5E7',
  },
  progressDotActive: {
    backgroundColor: '#FF6B8A',
    shadowColor: '#FF6B8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tutorialNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: '#F2F2F7',
    minWidth: 100,
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 120,
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: -0.2,
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 16,
    marginLeft: 4,
  },
  // App Info Card Styles
  appInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(91, 33, 182, 0.1)',
  },
  appInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  appIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 107, 138, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appInfoText: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5B21B6',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  appVersion: {
    fontSize: 15,
    color: '#8B5CF6',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 33, 182, 0.08)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(91, 33, 182, 0.15)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5B21B6',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginTop: 6,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(91, 33, 182, 0.2)',
    marginHorizontal: 24,
  },
  // Reset Card Styles
  resetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.15)',
  },
  resetIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  resetContent: {
    flex: 1,
  },
  resetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FF3B30',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 3,
  },
  resetSubtitle: {
    fontSize: 14,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  // Newsletter Card Styles
  newsletterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  newsletterIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  newsletterContent: {
    marginBottom: 20,
  },
  newsletterTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5B21B6',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 6,
  },
  newsletterSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 22,
  },
  newsletterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  newsletterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginRight: 8,
  },
  // Support Card Styles
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 138, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#86868B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  // Help & FAQ Styles
  helpPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F9FA',
    zIndex: 1000,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  helpContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  helpWelcomeSection: {
    alignItems: 'center',
    marginBottom: 36,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  helpWelcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 8,
    textAlign: 'center',
  },
  helpWelcomeText: {
    fontSize: 17,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    letterSpacing: -0.1,
  },
  faqSection: {
    marginBottom: 32,
  },
  faqSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  faqItemExpanded: {
    borderColor: 'rgba(255, 107, 138, 0.2)',
    shadowColor: '#FF6B8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  faqTouchable: {
    padding: 20,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    flex: 1,
    marginRight: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  faqChevronContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  faqAnswerContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  faqAnswer: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 22,
    letterSpacing: -0.1,
  },

  // Scratch Card Styles
  scratchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scratchCardContainer: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  scratchCloseButton: {
    position: 'absolute',
    top: -50,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  scratchCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  scratchCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  scratchIdeaContainer: {
    position: 'relative',
    marginBottom: 20,
    minHeight: 80,
    overflow: 'hidden',
  },
  scratchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scratchCardNumber: {
    backgroundColor: '#FF6B8A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scratchCardNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  scratchCardCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scratchCardCategoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B21B6',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginLeft: 6,
  },
  scratchCardIdeaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 26,
    marginBottom: 20,
    textAlign: 'center',
  },
  scratchCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scratchCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scratchCardInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginLeft: 4,
  },
  scratchLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  scratchBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(80, 80, 80, 1)',
    borderRadius: 12,
  },
  scratchPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scratchLine: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  scratchInstruction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scratchInstructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginTop: 8,
    textAlign: 'center',
  },
  scratchPoint: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 3,
  },
  scratchHole: {
    position: 'absolute',
    zIndex: 3,
    // This creates a hole in the scratch layer to reveal text underneath
  },
  scratchProgressContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  scratchProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  scratchProgressFill: {
    height: '100%',
    backgroundColor: '#FF6B8A',
    borderRadius: 3,
  },
  scratchProgressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Subscription Modal Styles
  subscriptionModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    maxWidth: 400,
    alignSelf: 'center',
  },
  subscriptionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subscriptionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  subscriptionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textAlign: 'center',
    lineHeight: 22,
  },
  subscriptionForm: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    backgroundColor: '#F9FAFB',
  },
  subscriptionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  subscribeButton: {
    flex: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  subscribeButtonDisabled: {
    backgroundColor: '#A78BFA',
    opacity: 0.7,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textAlign: 'center',
    lineHeight: 22,
  },


});