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
  LinearGradient,
  Modal,
  TextInput,
  Easing
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import * as MailComposer from 'expo-mail-composer';
import * as Linking from 'expo-linking';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';

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

// Modern CategoryIcon
const CategoryIcon = ({ category, size = 32, color = null, isSelected = false }) => {
  const { iconSet, icon, color: defaultColor } = categories[category] || {};
  const IconComponent = iconSet === 'FontAwesome5' ? FontAwesome5 : iconSet === 'Feather' ? Feather : MaterialCommunityIcons;
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#fff',
      borderRadius: size / 2,
      width: size + 8,
      height: size + 8,
      shadowColor: color || defaultColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: isSelected ? 1 : 0,
      borderColor: isSelected ? 'rgba(255,255,255,0.3)' : 'transparent',
    }}>
      <IconComponent name={icon} size={size} color={color || defaultColor} />
    </View>
  );
};

// Modern BudgetIcon
const BudgetIcon = ({ budget, size = 20 }) => {
  const budgetConfig = {
    low: { icon: <FontAwesome5 name="dollar-sign" size={size} color="#6A994E" />, label: "$", color: "#6A994E", description: "Budget Friendly" },
    medium: { icon: <FontAwesome5 name="dollar-sign" size={size} color="#F4A261" />, label: "$$", color: "#F4A261", description: "Mid-Range" },
    high: { icon: <FontAwesome5 name="dollar-sign" size={size} color="#C9A87D" />, label: "$$$", color: "#C9A87D", description: "Premium" }
  };
  const config = budgetConfig[budget] || budgetConfig.medium; // Fallback to medium if budget not found
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: config.color + '15',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 8,
    }}>
      {config.icon}
      <Text style={{ fontSize: size * 0.6, fontWeight: 'bold', color: config.color, marginLeft: 2 }}>{config.label}</Text>
    </View>
  );
};

// Modern LocationIcon
const LocationIcon = ({ location, size = 20 }) => {
  const iconMap = {
    indoor: <MaterialCommunityIcons name="home" size={size} color="#8B9DC3" />,
    outdoor: <MaterialCommunityIcons name="tree" size={size} color="#7FB069" />,
  };
  return iconMap[location] || iconMap.indoor; // Fallback to indoor if location not found
};

// Tutorial Component
const Tutorial = ({ visible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const tutorialSteps = [
    {
      title: "Welcome to DateUnveil!",
      message: "Tap any card to reveal a date idea. Use filters to find what you want.",
      iconSet: 'MaterialCommunityIcons',
      icon: 'cards',
      color: "#FF6B8A"
    },
    {
      title: "Share & Save",
      message: "Found a great idea? Share it via email, message, or add to your calendar.",
      iconSet: 'MaterialCommunityIcons',
      icon: 'share-variant',
      color: "#7FB069"
    },
    {
      title: "You're Ready!",
      message: "Start exploring your 100 date ideas!",
      iconSet: 'MaterialCommunityIcons',
      icon: 'rocket-launch',
      color: "#A67DB8"
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
    <View style={styles.tutorialOverlay}>
      <View style={styles.tutorialBackground}>
        <Animated.View 
          style={[
            styles.tutorialContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={{flex: 1, minHeight: 320}}>
            <View style={[styles.tutorialHeader, { backgroundColor: currentTutorial.color + '15' }]}> 
              <View style={[styles.tutorialIconContainer, { backgroundColor: currentTutorial.color }]}> 
                {currentTutorial.iconSet === 'MaterialCommunityIcons' ? ( 
                  <MaterialCommunityIcons name={currentTutorial.icon} size={32} color="#fff" /> 
                ) : currentTutorial.iconSet === 'FontAwesome5' ? ( 
                  <FontAwesome5 name={currentTutorial.icon} size={28} color="#fff" /> 
                ) : ( 
                  <Feather name={currentTutorial.icon} size={28} color="#fff" /> 
                )} 
              </View> 
              <Text style={styles.tutorialTitle}>{currentTutorial.title}</Text> 
            </View>
            <Text style={styles.tutorialMessage}>{currentTutorial.message}</Text>
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
                    <View style={styles.tutorialButtons}>
            <TouchableOpacity onPress={skipTutorial} style={[styles.nextButton, { backgroundColor: currentTutorial.color }]}>
              <Text style={styles.nextButtonText}>Skip Tutorial</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextStep} style={[styles.nextButton, { backgroundColor: currentTutorial.color }]}>
              <Text style={styles.nextButtonText}>
                {currentStep === tutorialSteps.length - 1 ? "Let's Start! 🚀" : "Next ✨"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

// Enhanced Small Card Component
const SmallCard = ({ item, isRevealed, onPress }) => {
  return (
    <TouchableOpacity style={styles.smallCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardNumber}>#{item.id}</Text>
        <CategoryIcon category={item.category} size={16} />
      </View>
      <View style={styles.cardContent}>
        {!isRevealed ? (
          <View style={styles.mysteryContainer}>
            <Text style={styles.mysteryIcon}>💫</Text>
            <Text style={styles.tapToReveal}>Tap to reveal</Text>
          </View>
        ) : (
          <Text style={styles.ideaText} numberOfLines={3}>
            {item.idea}
          </Text>
        )}
      </View>
      {isRevealed && (
        <View style={styles.cardFooter}>
          <BudgetIcon budget={item.budget} size={12} />
          <LocationIcon location={item.location} size={12} />
        </View>
      )}
    </TouchableOpacity>
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

  const handlePanGesture = (event) => {
    if (isSpinning) return;
    
    const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;
    const currentTime = Date.now();
    const timeDelta = currentTime - lastPanTime.current;
    
    // Calculate velocity magnitude
    const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    setVelocity(velocityMagnitude);
    
    // Calculate rotation based on pan gesture
    const panDistance = Math.sqrt(translationX * translationX + translationY * translationY);
    const newRotation = lastPanValue + panDistance * 0.5;
    
    setLastPanValue(newRotation);
    lastPanTime.current = currentTime;
    
    // Update wheel rotation in real-time
    spinAnim.setValue(newRotation);
  };

  const handlePanEnd = () => {
    if (isSpinning) return;
    
    // Start spinning with the calculated velocity
    spinWheel(velocity / 1000);
  };

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
            <PanGestureHandler
              onGestureEvent={handlePanGesture}
              onEnded={handlePanEnd}
              enabled={!isSpinning}
            >
              <Animated.View
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
            </PanGestureHandler>
            
            {/* Center pointer */}
            <View style={styles.wheelPointer} />
          </View>
          
          {selectedNumber && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>🎉 Card #{selectedNumber} Selected! 🎉</Text>
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
          <View style={{ 
            marginBottom: 4,
            backgroundColor: !selectedCategory ? 'rgba(255,255,255,0.2)' : '#fff',
            borderRadius: 14,
            width: 28,
            height: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: !selectedCategory ? 0.2 : 0.1,
            shadowRadius: !selectedCategory ? 3 : 2,
            elevation: !selectedCategory ? 3 : 2,
            borderWidth: !selectedCategory ? 1 : 0,
            borderColor: !selectedCategory ? 'rgba(255,255,255,0.3)' : 'transparent',
          }}>
            <MaterialCommunityIcons 
              name="heart-multiple" 
              size={20} 
              color={!selectedCategory ? "#fff" : "#3F51B5"} 
            />
          </View>
          <Text style={[
            styles.categoryFilterText,
            !selectedCategory && { color: '#ffffff' }
          ]}>All</Text>
        </TouchableOpacity>
        
        {Object.entries(categories).map(([key, category]) => (
          <TouchableOpacity 
            key={key}
            style={[
              styles.categoryFilterButton,
              selectedCategory === key && [styles.categoryFilterButtonActive, { backgroundColor: category.color }]
            ]}
            onPress={() => {
              if (key === 'random') {
                onRandomSelect();
              } else {
                onCategorySelect(key);
              }
            }}
          >
            <View style={{ marginBottom: 4 }}>
              <CategoryIcon 
                category={key} 
                size={20} 
                color={selectedCategory === key ? "#fff" : category.color}
                isSelected={selectedCategory === key}
              />
            </View>
            <Text style={[
              styles.categoryFilterText,
              selectedCategory === key && { color: '#ffffff' }
            ]}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
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
  const categoryInfo = categories[item.category] || categories.romantic; // Fallback to romantic if category not found
  
  return (
    <View style={styles.expandedCardOverlay}>
      <View style={styles.expandedCardContent}>
        {/* Header */}
        <View style={styles.expandedCardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.cardNumber}>#{item.id}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}>
              <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#757575" />
          </TouchableOpacity>
        </View>
        
        {/* Main Content */}
        <View style={[styles.expandedCardBody, { backgroundColor: '#FFF5F7' }]}>
          <Text style={styles.dateIdea}>{item.idea || 'No idea found'}</Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Debug: Card #{item.id}</Text>
          
          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <BudgetIcon budget={item.budget} />
            <LocationIcon location={item.location} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF6B8A' }]} 
            onPress={onShareEmail}
          >
            <MaterialCommunityIcons name="email" size={18} color="#ffffff" />
            <Text style={styles.actionButtonText}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#7FB069' }]} 
            onPress={onShareSMS}
          >
            <MaterialCommunityIcons name="message" size={18} color="#ffffff" />
            <Text style={styles.actionButtonText}>SMS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#F4A261' }]} 
            onPress={onAddToCalendar}
          >
            <MaterialCommunityIcons name="calendar" size={18} color="#ffffff" />
            <Text style={styles.actionButtonText}>Calendar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#A67DB8' }]} 
            onPress={onSetReminder}
          >
            <MaterialCommunityIcons name="bell" size={18} color="#ffffff" />
            <Text style={styles.actionButtonText}>Remind</Text>
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

export default function App() {
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
  
  const [revealedCards, setRevealedCards] = useState(new Set());
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
        const revealed = JSON.parse(data);
        setRevealedCards(new Set(revealed));
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

  const handleCardPress = (item) => {
    if (!revealedCards.has(item.id)) {
      // First time revealing this card
      const newRevealed = new Set([...revealedCards, item.id]);
      setRevealedCards(newRevealed);
      AsyncStorage.setItem('revealedCards', JSON.stringify([...newRevealed]));
    }
    // Expand the card
    setExpandedCard(item);
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
    }).catch(() => Alert.alert('Error', 'Unable to open email composer.'));
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
    Linking.openURL(smsUrl).catch(() => Alert.alert('Error', 'Unable to open SMS app.'));
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
        Alert.alert(
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
      Alert.alert(
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
        Alert.alert(
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
      Alert.alert('Error', 'Unable to set reminder. Please try again.');
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
      
      Alert.alert(
        'Advanced Reminder Set!', 
        `You'll be reminded about "${expandedCard.idea}" ${reminderText}.`,
        [
          { text: 'Great!', style: 'default' },
          { text: 'Set Another', onPress: () => setShowReminderModal(true) },
          { text: 'View All', onPress: () => viewAllReminders() }
        ]
      );
      
    } catch (error) {
      console.error('Schedule reminder error:', error);
      Alert.alert('Error', 'Could not schedule reminder. Please try again.');
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
      
      Alert.alert(
        'Your Date Reminders',
        reminderText,
        [
          { text: 'OK', style: 'default' },
          { text: 'Clear All', onPress: () => clearAllReminders() }
        ]
      );
      
    } catch (error) {
      console.error('View reminders error:', error);
      Alert.alert('Error', 'Unable to view reminders.');
    }
  };
  
  const clearAllReminders = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert('Success', 'All reminders have been cleared.');
    } catch (error) {
      console.error('Clear reminders error:', error);
      Alert.alert('Error', 'Unable to clear reminders.');
    }
  };

  const resetAppData = async () => {
    try {
      await AsyncStorage.multiRemove(['revealedCards', 'tutorialShown']);
      setRevealedCards(new Set());
      setShowTutorial(true);
      setTutorialKey(k => k + 1); // force remount Tutorial
      Alert.alert('Success', 'App data has been reset! The tutorial will appear again.');
    } catch (error) {
      console.error('Reset app data error:', error);
      Alert.alert('Error', 'Unable to reset app data.');
    }
  };

  const handleWheelCardSelect = (cardNumber) => {
    const selectedCard = dateIdeasData.find(item => item.id === cardNumber);
    if (selectedCard) {
      setExpandedCard(selectedCard);
      // Reveal the card if not already revealed
      if (!revealedCards.has(cardNumber)) {
        const newRevealedCards = new Set(revealedCards);
        newRevealedCards.add(cardNumber);
        setRevealedCards(newRevealedCards);
        AsyncStorage.setItem('revealedCards', JSON.stringify(Array.from(newRevealedCards)));
      }
    }
  };

  // Filter data based on selected category and budget
  const filteredData = dateIdeasData.filter(item => {
    const categoryMatch = !selectedCategory || item.category === selectedCategory;
    return categoryMatch;
  });

  const renderCard = ({ item }) => (
    <SmallCard
      item={item}
      isRevealed={revealedCards.has(item.id)}
      onPress={() => handleCardPress(item)}
    />
  );

  const revealedIdeas = dateIdeasData
    .filter(item => revealedCards.has(item.id))
    .map(item => item.idea);

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="light-content" backgroundColor="#FF6B9D" />
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>DateUnveil</Text>
          <Text style={styles.headerSubtitle}>Discover Your Perfect Date Idea</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {revealedCards.size} / 100 Revealed
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(revealedCards.size / 100) * 100}%` }]} />
            </View>
          </View>
        </View>
      </View>

      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        onRandomSelect={() => setShowSpinningWheel(true)}
      />

      <FlatList
        data={filteredData}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={4}
        key="4-column-grid"
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Professional Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        <View style={styles.actionBarContent}>
          <TouchableOpacity 
            style={styles.actionBarButton}
            onPress={() => setShowHistory(true)}
          >
            <MaterialCommunityIcons name="history" size={20} color="#FF6B8A" />
            <Text style={styles.actionBarButtonText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBarButton}
            onPress={resetAppData}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#FF6B8A" />
            <Text style={styles.actionBarButtonText}>Reset</Text>
          </TouchableOpacity>
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
              <Text style={styles.modalTitle}>💕 Your Date History 💕</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.historyList}>
              {revealedIdeas.length === 0 ? (
                <Text style={styles.emptyHistoryText}>No date ideas revealed yet. Start your romantic journey! 💕</Text>
              ) : (
                revealedIdeas.map((idea, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyNumber}>💕 #{index + 1}</Text>
                    <Text style={styles.historyText}>{idea}</Text>
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

      <Tutorial 
        key={tutorialKey}
        visible={showTutorial}
        onComplete={completeTutorial}
      />

      <SpinningWheel
        visible={showSpinningWheel}
        onClose={() => setShowSpinningWheel(false)}
        onSelectCard={handleWheelCardSelect}
      />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7F0',
    paddingTop: 10,
  },
  header: {
    backgroundColor: '#FF6B8A',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#FFF5F7',
    fontWeight: '500',
    marginBottom: 10,
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressText: {
    fontSize: 11,
    color: '#FFF5F7',
    fontWeight: '600',
    marginBottom: 4,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  categoryFilterContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6E0',
    shadowColor: '#FF6B8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryFilter: {
    backgroundColor: '#ffffff',
  },
  categoryFilterContent: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  categoryFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0E6E0',
    marginRight: 10,
    backgroundColor: '#FEF7F0',
    alignItems: 'center',
    minWidth: 80,
  },
  categoryFilterButtonActive: {
    backgroundColor: '#FF6B8A',
    borderColor: '#FF6B8A',
  },

  categoryFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B8A',
  },

  gridContainer: {
    padding: 12,
    paddingBottom: 100,
  },
  smallCard: {
    width: (width - 48) / 4,
    height: 120,
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 4,
    padding: 8,
    shadowColor: '#FF6B8A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0E6E0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  cardNumber: {
    fontSize: 7,
    fontWeight: '500',
    color: '#D4A5A5',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mysteryContainer: {
    alignItems: 'center',
  },
  mysteryIcon: {
    fontSize: 16,
    marginBottom: 3,
  },
  tapToReveal: {
    fontSize: 9,
    color: '#D4A5A5',
    fontWeight: '600',
    textAlign: 'center',
  },
  ideaText: {
    fontSize: 10,
    color: '#FF6B8A',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  revealedCard: {
    backgroundColor: '#FFF5F7',
    borderColor: '#FF6B8A',
    borderWidth: 2,
  },
  expandedCard: {
    backgroundColor: '#FFE8ED',
    borderWidth: 2,
    borderColor: '#FF6B8A',
  },
  smallCardNumber: {
    fontSize: 7,
    fontWeight: '500',
    color: '#D4A5A5',
  },
  smallCardText: {
    fontSize: 9,
    color: '#FF6B8A',
    textAlign: 'center',
    lineHeight: 11,
    fontWeight: '500',
  },
  expandedCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  expandedCardContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: width - 40,
    maxHeight: height * 0.8,
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  expandedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D4A5A5',
    marginRight: 12,
  },
  categoryBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 18,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedCardBody: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  dateIdea: {
    fontSize: 24,
    color: '#FF6B8A',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '700',
    marginBottom: 24,
    backgroundColor: '#FFF5F7',
    padding: 16,
    borderRadius: 12,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 70,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3F51B5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#3F51B5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyButtonText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#757575',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#757575',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButtonText: {
    color: '#757575',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(63, 81, 181, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: width - 40,
    maxHeight: height * 0.7,
    shadowColor: '#3F51B5',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3F51B5',
  },
  historyList: {
    padding: 24,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAF6',
  },
  historyNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginRight: 12,
    minWidth: 30,
  },
  historyText: {
    fontSize: 16,
    color: '#3F51B5',
    flex: 1,
    lineHeight: 22,
  },
  // Enhanced Tutorial Styles
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(63, 81, 181, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  tutorialBackground: {
    width: width - 40,
    maxWidth: 400,
  },
  tutorialContent: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    maxHeight: height * 0.8,
    minHeight: 340,
    shadowColor: '#3F51B5',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  tutorialHeader: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
  },
  tutorialIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  tutorialTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    lineHeight: 32,
  },
  tutorialMessage: {
    fontSize: 16,
    color: '#3F51B5',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  tutorialProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  progressDotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  tutorialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
    alignSelf: 'stretch',
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#757575',
  },
  skipButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    shadowColor: '#3F51B5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Calendar Modal Styles
  calendarModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(63, 81, 181, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  calendarModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: width - 40,
    maxHeight: height * 0.8,
    shadowColor: '#3F51B5',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 3,
    borderColor: '#E0E0E0',
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  calendarModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
  },
  calendarModalBody: {
    padding: 24,
  },
  dateTimeSection: {
    marginBottom: 24,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 16,
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F51B5',
  },
  dateTimeValue: {
    fontSize: 16,
    color: '#3F51B5',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F51B5',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
    color: '#3F51B5',
  },
  calendarModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#757575',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#3F51B5',
    shadowColor: '#3F51B5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scheduleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Picker Styles
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: width - 80,
    alignItems: 'center',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 16,
  },
  pickerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerText: {
    fontSize: 18,
    color: '#FF6B9D',
    marginBottom: 8,
  },
  pickerNote: {
    fontSize: 12,
    color: '#FF8E8E',
    fontStyle: 'italic',
  },
  pickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FF6B9D',
  },
  pickerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Invitation Modal Styles
  invitationModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 157, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  invitationModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: width - 40,
    maxHeight: height * 0.8,
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 3,
    borderColor: '#FFE4E1',
  },
  invitationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4E1',
  },
  invitationModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  invitationModalBody: {
    padding: 24,
  },
  invitationPreview: {
    backgroundColor: '#FFF8FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE4E1',
  },
  invitationPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 8,
  },
  invitationPreviewText: {
    fontSize: 14,
    color: '#FF6B9D',
    marginBottom: 4,
  },
  recipientSection: {
    marginBottom: 24,
  },
  invitationModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#FFE4E1',
  },
  emailButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emailButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  smsButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  smsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Reminder Modal Styles
  reminderModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 157, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  reminderModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: width - 40,
    maxHeight: height * 0.8,
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 3,
    borderColor: '#FFE4E1',
  },
  reminderModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4E1',
  },
  reminderModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  reminderModalBody: {
    padding: 24,
  },
  reminderTypeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 16,
  },
  reminderTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFF8FA',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reminderTypeButtonActive: {
    backgroundColor: '#FFE4E1',
    borderColor: '#FF6B9D',
  },
  reminderTypeIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  reminderTypeContent: {
    flex: 1,
  },
  reminderTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 4,
  },
  reminderTypeDescription: {
    fontSize: 14,
    color: '#FF8E8E',
  },
  quickReminderSection: {
    marginBottom: 24,
  },
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickOptionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF8FA',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quickOptionButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  quickOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  customReminderSection: {
    marginBottom: 24,
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFF8FA',
    borderWidth: 1,
    borderColor: '#FFE4E1',
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  dateTimeValue: {
    fontSize: 16,
    color: '#FF8E8E',
  },
  dateTimeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dateTimeTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  messageSection: {
    marginBottom: 24,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#FFE4E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#FFF8FA',
  },
  reminderModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#FFE4E1',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#FFF8FA',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF8E8E',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8E8E',
  },
  scheduleButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 12,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },



  // Professional Bottom Action Bar Styles
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F0E6E0',
    shadowColor: '#FF6B8A',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  actionBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionBarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 60,
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
  },
  actionBarButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B8A',
    marginTop: 4,
    textAlign: 'center',
  },

  // Spinning Wheel Styles
  wheelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
  },
  wheelContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: width - 40,
    maxHeight: height * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  wheelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6E0',
  },
  wheelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B8A',
  },
  wheelCloseButton: {
    padding: 8,
  },
  wheelContent: {
    padding: 24,
    alignItems: 'center',
  },
  wheelWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  wheel: {
    width: 280,
    height: 280,
    borderRadius: 140,
    position: 'relative',
    borderWidth: 8,
    borderColor: '#FF6B8A',
    backgroundColor: '#FEF7F0',
  },
  wheelSegment: {
    position: 'absolute',
    width: 140,
    height: 2,
    left: 140,
    top: 139,
    transformOrigin: '0 1px',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  wheelNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    transform: [{ rotate: '90deg' }],
  },
  wheelPointer: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF6B8A',
    zIndex: 10,
  },
  resultContainer: {
    backgroundColor: '#FFF5F7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#7FB069',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7FB069',
    textAlign: 'center',
  },
  spinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B8A',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#FF6B8A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  spinButtonDisabled: {
    backgroundColor: '#D4A5A5',
  },
  spinButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  wheelInstructions: {
    backgroundColor: '#FFF5F7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF6B8A',
  },
  wheelInstructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B8A',
    textAlign: 'center',
  },
});
