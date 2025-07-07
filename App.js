import React, { useState, useEffect } from 'react';
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
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as MailComposer from 'expo-mail-composer';
import * as Linking from 'expo-linking';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Import date ideas from JSON file
import dateIdeasData from './dateIdeas.json';

// Modern, stylish category configuration
const categories = {
  romantic: { iconSet: 'FontAwesome5', icon: 'heart', color: '#FF6B9D', name: 'Romantic', description: 'Sweet & Intimate' },
  adventurous: { iconSet: 'MaterialCommunityIcons', icon: 'hiking', color: '#4ECDC4', name: 'Adventurous', description: 'Thrilling & Bold' },
  creative: { iconSet: 'MaterialCommunityIcons', icon: 'palette', color: '#45B7D1', name: 'Creative', description: 'Artsy & Crafty' },
  active: { iconSet: 'MaterialCommunityIcons', icon: 'run', color: '#96CEB4', name: 'Active', description: 'Energetic & Sporty' },
  cozy: { iconSet: 'MaterialCommunityIcons', icon: 'home-heart', color: '#FFEAA7', name: 'Cozy', description: 'Comfortable & Warm' },
  fun: { iconSet: 'MaterialCommunityIcons', icon: 'party-popper', color: '#DDA0DD', name: 'Fun', description: 'Playful & Entertaining' },
  foodie: { iconSet: 'MaterialCommunityIcons', icon: 'food', color: '#FF8E8E', name: 'Foodie', description: 'Culinary & Delicious' },
  chill: { iconSet: 'Feather', icon: 'coffee', color: '#87CEEB', name: 'Chill', description: 'Relaxed & Peaceful' },
  cultural: { iconSet: 'MaterialCommunityIcons', icon: 'bank', color: '#DDA0DD', name: 'Cultural', description: 'Educational & Enriching' },
  intellectual: { iconSet: 'MaterialCommunityIcons', icon: 'brain', color: '#98D8C8', name: 'Intellectual', description: 'Thoughtful & Engaging' },
  spontaneous: { iconSet: 'MaterialCommunityIcons', icon: 'dice-multiple', color: '#FFB347', name: 'Spontaneous', description: 'Impulsive & Exciting' },
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
    low: { icon: <FontAwesome5 name="dollar-sign" size={size} color="#4CAF50" />, label: "$", color: "#4CAF50", description: "Budget Friendly" },
    medium: { icon: <FontAwesome5 name="dollar-sign" size={size} color="#FF9800" />, label: "$$", color: "#FF9800", description: "Mid-Range" },
    high: { icon: <FontAwesome5 name="dollar-sign" size={size} color="#E91E63" />, label: "$$$", color: "#E91E63", description: "Premium" }
  };
  const config = budgetConfig[budget];
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
    indoor: <MaterialCommunityIcons name="home" size={size} color="#9C27B0" />,
    outdoor: <MaterialCommunityIcons name="tree" size={size} color="#4CAF50" />,
  };
  return iconMap[location];
};

// Tutorial Component
const Tutorial = ({ visible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const tutorialSteps = [
    {
      title: "🌟 Welcome to DateUnveil! 🌟",
      message: "Your magical journey to discover 100 amazing date ideas starts here! Let's explore together! ✨",
      icon: "💫",
      color: "#FF6B9D"
    },
    {
      title: "🎴 Meet Your Date Cards",
      message: "Each card hides a special date idea! Click any card to reveal the magic inside! ✨",
      icon: "💎",
      color: "#4ECDC4"
    },
    {
      title: "🏷️ Category Magic",
      message: "Use the filter bar to find exactly what you're looking for! Romantic, adventurous, or maybe something cozy? 🎯",
      icon: "🎨",
      color: "#45B7D1"
    },
    {
      title: "💰 Budget & Location",
      message: "See budget levels (💎 to 💎💎💎) and location (🏠 indoor or 🌳 outdoor) at a glance!",
      icon: "💎",
      color: "#96CEB4"
    },
    {
      title: "📱 Share the Love",
      message: "Found the perfect date? Share it via email, message, add to calendar, or set a reminder! 💌",
      icon: "📤",
      color: "#DDA0DD"
    },
    {
      title: "📚 Your Date History",
      message: "Keep track of all your revealed ideas in the history section! Your romantic journey awaits! 📖",
      icon: "💝",
      color: "#FF8E8E"
    },
    {
      title: "🚀 You're All Set!",
      message: "Ready to discover your perfect date? Let the adventure begin! 💕✨",
      icon: "🌟",
      color: "#FFB347"
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
          <View style={[styles.tutorialHeader, { backgroundColor: currentTutorial.color + '10' }]}>
            <View style={[styles.tutorialIconContainer, { backgroundColor: currentTutorial.color }]}>
              <Text style={styles.tutorialIcon}>{currentTutorial.icon}</Text>
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
          
          <View style={styles.tutorialButtons}>
            <TouchableOpacity onPress={skipTutorial} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip Tutorial</Text>
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
        <CategoryIcon category={item.category} size={20} />
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
          <BudgetIcon budget={item.budget} size={14} />
          <LocationIcon location={item.location} size={14} />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Enhanced Category Filter Component
const CategoryFilter = ({ selectedCategory, onCategorySelect, selectedBudget, onBudgetSelect }) => {
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
              color={!selectedCategory ? "#fff" : "#FF6B9D"} 
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
            onPress={() => onCategorySelect(key)}
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
      
      {/* Budget Filter */}
      <View style={styles.budgetFilterContainer}>
        <Text style={styles.budgetFilterTitle}>💰 Budget Filter:</Text>
        <View style={styles.budgetFilterButtons}>
          <TouchableOpacity 
            style={[
              styles.budgetFilterButton,
              !selectedBudget && styles.budgetFilterButtonActive
            ]}
            onPress={() => onBudgetSelect(null)}
          >
            <Text style={[
              styles.budgetFilterText,
              !selectedBudget && { color: '#ffffff' }
            ]}>All Budgets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.budgetFilterButton,
              selectedBudget === 'low' && [styles.budgetFilterButtonActive, { backgroundColor: '#4CAF50' }]
            ]}
            onPress={() => onBudgetSelect('low')}
          >
            <FontAwesome5 name="dollar-sign" size={16} color={selectedBudget === 'low' ? "#fff" : "#4CAF50"} />
            <Text style={[
              styles.budgetFilterText,
              selectedBudget === 'low' && { color: '#ffffff' }
            ]}>Budget ($)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.budgetFilterButton,
              selectedBudget === 'medium' && [styles.budgetFilterButtonActive, { backgroundColor: '#FF9800' }]
            ]}
            onPress={() => onBudgetSelect('medium')}
          >
            <FontAwesome5 name="dollar-sign" size={16} color={selectedBudget === 'medium' ? "#fff" : "#FF9800"} />
            <Text style={[
              styles.budgetFilterText,
              selectedBudget === 'medium' && { color: '#ffffff' }
            ]}>Mid-Range ($$)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.budgetFilterButton,
              selectedBudget === 'high' && [styles.budgetFilterButtonActive, { backgroundColor: '#E91E63' }]
            ]}
            onPress={() => onBudgetSelect('high')}
          >
            <FontAwesome5 name="dollar-sign" size={16} color={selectedBudget === 'high' ? "#fff" : "#E91E63"} />
            <Text style={[
              styles.budgetFilterText,
              selectedBudget === 'high' && { color: '#ffffff' }
            ]}>Premium ($$$)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Enhanced Expanded Card Component
const ExpandedCard = ({ item, onClose, onShareEmail, onShareSMS, onAddToCalendar, onSetReminder }) => {
  const categories = {
    romantic: { name: 'Romantic', icon: '💕', color: '#FF6B9D', description: 'Perfect for couples in love' },
    adventurous: { name: 'Adventurous', icon: '🏔️', color: '#4CAF50', description: 'For thrill-seekers and explorers' },
    creative: { name: 'Creative', icon: '🎨', color: '#9C27B0', description: 'Express your artistic side together' },
    active: { name: 'Active', icon: '⚡', color: '#FF9800', description: 'Get moving and stay energized' },
    cozy: { name: 'Cozy', icon: '🏠', color: '#795548', description: 'Comfortable and intimate moments' },
    fun: { name: 'Fun', icon: '🎉', color: '#E91E63', description: 'Laugh and enjoy together' },
    foodie: { name: 'Foodie', icon: '🍕', color: '#FF5722', description: 'Culinary adventures for food lovers' },
    chill: { name: 'Chill', icon: '😌', color: '#607D8B', description: 'Relaxed and laid-back vibes' },
    cultural: { name: 'Cultural', icon: '🏛️', color: '#3F51B5', description: 'Explore art, history, and culture' },
    intellectual: { name: 'Intellectual', icon: '🧠', color: '#673AB7', description: 'Stimulate your minds together' },
    spontaneous: { name: 'Spontaneous', icon: '🎲', color: '#00BCD4', description: 'Go with the flow and surprise each other' },
  };
  const categoryInfo = categories[item.category];
  
  return (
    <View style={styles.expandedCardOverlay}>
      <View style={styles.expandedCardContent}>
        <View style={styles.expandedCardHeader}>
          <View style={styles.expandedCardTitleContainer}>
            <View style={styles.expandedCardTitleRow}>
              <Text style={styles.expandedCardTitle}>💕 DateUnveil 💕</Text>
              <View style={[styles.categoryBadgeLarge, { backgroundColor: categoryInfo.color }]}>
                <Text style={styles.categoryEmojiLarge}>{categoryInfo.icon}</Text>
                <Text style={styles.categoryNameLarge}>{categoryInfo.name}</Text>
              </View>
            </View>
            <Text style={styles.categoryDescription}>{categoryInfo.description}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={16} color="#FF8E8E" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.expandedCardBody}>
          <View style={styles.cardIdContainer}>
            <Text style={styles.expandedCardNumber}>#{item.id}</Text>
          </View>
          <Text style={styles.expandedCardIdea}>{item.idea}</Text>
          
          <View style={styles.expandedCardDetails}>
            <View style={styles.detailRow}>
              <BudgetIcon budget={item.budget} />
              <LocationIcon location={item.location} />
            </View>
          </View>
        </View>

        <View style={styles.expandedCardActions}>
          <Text style={styles.actionsTitle}>💌 Share & Plan Your Date</Text>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FF6B9D' }]} 
              onPress={onShareEmail}
            >
              <MaterialCommunityIcons name="email-send" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FF8E8E' }]} 
              onPress={onShareSMS}
            >
              <MaterialCommunityIcons name="message-text" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FFB3D9' }]} 
              onPress={onAddToCalendar}
            >
              <Feather name="calendar" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FFC0CB' }]} 
              onPress={onSetReminder}
            >
              <Feather name="bell" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// Advanced Calendar Modal Component
const CalendarModal = ({ visible, onClose, onSchedule, dateIdea }) => {
  const categories = {
    romantic: { name: 'Romantic', icon: '💕', color: '#FF6B9D' },
    adventurous: { name: 'Adventurous', icon: '🏔️', color: '#4CAF50' },
    creative: { name: 'Creative', icon: '🎨', color: '#9C27B0' },
    active: { name: 'Active', icon: '⚡', color: '#FF9800' },
    cozy: { name: 'Cozy', icon: '🏠', color: '#795548' },
    fun: { name: 'Fun', icon: '🎉', color: '#E91E63' },
    foodie: { name: 'Foodie', icon: '🍕', color: '#FF5722' },
    chill: { name: 'Chill', icon: '😌', color: '#607D8B' },
    cultural: { name: 'Cultural', icon: '🏛️', color: '#3F51B5' },
    intellectual: { name: 'Intellectual', icon: '🧠', color: '#673AB7' },
    spontaneous: { name: 'Spontaneous', icon: '🎲', color: '#00BCD4' },
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
      setCustomTitle(`DateUnveil: ${dateIdea.idea}`);
      setCustomLocation('Your chosen location');
      setCustomNotes(`Category: ${categories[dateIdea.category].name}\nBudget: ${dateIdea.budget === 'low' ? '$' : dateIdea.budget === 'medium' ? '$$' : '$$$'}\nLocation: ${dateIdea.location}`);
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
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
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
                <Text style={styles.dateTimeLabel}>Date:</Text>
                <Text style={styles.dateTimeValue}>{formatDate(selectedDate)}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeLabel}>Time:</Text>
                <Text style={styles.dateTimeValue}>{formatTime(selectedTime)}</Text>
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
                  {/* Simple date picker - in a real app you'd use a proper date picker library */}
                  <Text style={styles.pickerText}>Date: {formatDate(selectedDate)}</Text>
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
                  <Text style={styles.pickerText}>Time: {formatTime(selectedTime)}</Text>
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
    romantic: { name: 'Romantic', icon: '💕', color: '#FF6B9D' },
    adventurous: { name: 'Adventurous', icon: '🏔️', color: '#4CAF50' },
    creative: { name: 'Creative', icon: '🎨', color: '#9C27B0' },
    active: { name: 'Active', icon: '⚡', color: '#FF9800' },
    cozy: { name: 'Cozy', icon: '🏠', color: '#795548' },
    fun: { name: 'Fun', icon: '🎉', color: '#E91E63' },
    foodie: { name: 'Foodie', icon: '🍕', color: '#FF5722' },
    chill: { name: 'Chill', icon: '😌', color: '#607D8B' },
    cultural: { name: 'Cultural', icon: '🏛️', color: '#3F51B5' },
    intellectual: { name: 'Intellectual', icon: '🧠', color: '#673AB7' },
    spontaneous: { name: 'Spontaneous', icon: '🎲', color: '#00BCD4' },
  };
  
  const [revealedCards, setRevealedCards] = useState(new Set());
  const [expandedCard, setExpandedCard] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [invitationData, setInvitationData] = useState(null);

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
    MailComposer.composeAsync({
      subject: 'DateUnveil: Amazing Date Idea',
      body: `I just discovered this amazing date idea: ${expandedCard.idea}\n\nCategory: ${categories[expandedCard.category].name}\nBudget: ${expandedCard.budget === 'low' ? '$' : expandedCard.budget === 'medium' ? '$$' : '$$$'}\nLocation: ${expandedCard.location}\n\nShared via DateUnveil\n\nLet's make it happen!`,
    }).catch(() => Alert.alert('Error', 'Unable to open email composer.'));
  };

  const shareBySMS = () => {
    if (!expandedCard) return;
    let smsUrl = '';
    const message = `I just discovered this amazing date idea: ${expandedCard.idea}\n\nCategory: ${categories[expandedCard.category].name}\nBudget: ${expandedCard.budget === 'low' ? '$' : expandedCard.budget === 'medium' ? '$$' : '$$$'}\nLocation: ${expandedCard.location}\n\nShared via DateUnveil\n\nLet's make it happen!`;
    
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
      Alert.alert('Success', 'App data has been reset! The tutorial will appear again.');
    } catch (error) {
      console.error('Reset app data error:', error);
      Alert.alert('Error', 'Unable to reset app data.');
    }
  };

  // Filter data based on selected category and budget
  const filteredData = dateIdeasData.filter(item => {
    const categoryMatch = !selectedCategory || item.category === selectedCategory;
    const budgetMatch = !selectedBudget || item.budget === selectedBudget;
    return categoryMatch && budgetMatch;
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
          <Text style={styles.headerTitle}>💕 DateUnveil 💕</Text>
          <Text style={styles.headerSubtitle}>Discover Your Perfect Date Idea</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {revealedCards.size} / 100 Cards Revealed
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
        selectedBudget={selectedBudget}
        onBudgetSelect={setSelectedBudget}
      />

      <FlatList
        data={filteredData}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        key="3-column-grid"
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => setShowHistory(true)}
        >
          <Text style={styles.historyButtonText}>💕 View Date History 💕</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={resetAppData}
        >
          <Text style={styles.resetButtonText}>🔄 Reset App Data</Text>
        </TouchableOpacity>
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
        visible={showTutorial}
        onComplete={completeTutorial}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6F0',
    paddingTop: 10,
  },
  header: {
    backgroundColor: '#FF6B9D',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFE4E1',
    fontWeight: '500',
    marginBottom: 12,
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressText: {
    fontSize: 12,
    color: '#FFE4E1',
    fontWeight: '600',
    marginBottom: 6,
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
    borderBottomColor: '#FFE4E1',
    shadowColor: '#FF6B9D',
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
    borderColor: '#FFE4E1',
    marginRight: 10,
    backgroundColor: '#FFF8FA',
    alignItems: 'center',
    minWidth: 80,
  },
  categoryFilterButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },

  categoryFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  budgetFilterContainer: {
    backgroundColor: '#FFF8FA',
    borderTopWidth: 1,
    borderTopColor: '#FFE4E1',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  budgetFilterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 8,
  },
  budgetFilterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetFilterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE4E1',
    backgroundColor: '#FFF',
    marginHorizontal: 4,
  },
  budgetFilterButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  budgetFilterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6B9D',
    marginLeft: 4,
  },
  gridContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  smallCard: {
    width: (width - 60) / 3,
    height: 140,
    backgroundColor: '#FFF',
    borderRadius: 16,
    margin: 6,
    padding: 12,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FFE4E1',
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
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF6B9D',
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
    fontSize: 20,
    marginBottom: 4,
  },
  tapToReveal: {
    fontSize: 10,
    color: '#B0A8B9',
    fontWeight: '600',
    textAlign: 'center',
  },
  ideaText: {
    fontSize: 11,
    color: '#FF6B9D',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  revealedCard: {
    backgroundColor: '#FFF0F5',
    borderColor: '#FF6B9D',
    borderWidth: 2,
  },
  expandedCard: {
    backgroundColor: '#FFB3D9',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  smallCardNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  smallCardText: {
    fontSize: 10,
    color: '#FF6B9D',
    textAlign: 'center',
    lineHeight: 12,
    fontWeight: '500',
  },
  expandedCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 157, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  expandedCardContent: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
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
  expandedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4E1',
  },
  expandedCardTitleContainer: {
    flex: 1,
  },
  expandedCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  expandedCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginRight: 12,
  },
  categoryBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryEmojiLarge: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryNameLarge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#FF8E8E',
    fontStyle: 'italic',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FF8E8E',
    fontWeight: 'bold',
  },
  expandedCardBody: {
    padding: 24,
    alignItems: 'center',
  },
  cardIdContainer: {
    backgroundColor: '#FF6B9D',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  expandedCardNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  expandedCardIdea: {
    fontSize: 20,
    color: '#FF6B9D',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
    marginBottom: 20,
  },
  expandedCardDetails: {
    width: '100%',
    backgroundColor: '#FFF8FA',
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  expandedCardActions: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#FFE4E1',
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B9D',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B9D',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyButtonText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF8E8E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FF8E8E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButtonText: {
    color: '#FF8E8E',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 157, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: width - 40,
    maxHeight: height * 0.7,
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 2,
    borderColor: '#FFE4E1',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4E1',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  historyList: {
    padding: 24,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#FF8E8E',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF0F5',
  },
  historyNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginRight: 12,
    minWidth: 30,
  },
  historyText: {
    fontSize: 16,
    color: '#FF6B9D',
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
    backgroundColor: 'rgba(255, 107, 157, 0.95)',
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
    padding: 32,
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
  tutorialHeader: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
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
  tutorialIcon: {
    fontSize: 32,
  },
  tutorialTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF6B9D',
    textAlign: 'center',
    lineHeight: 32,
  },
  tutorialMessage: {
    fontSize: 18,
    color: '#FF6B9D',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 28,
  },
  tutorialProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFE4E1',
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
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF8E8E',
  },
  skipButtonText: {
    color: '#FF8E8E',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 20,
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Calendar Modal Styles
  calendarModalOverlay: {
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
  calendarModalContent: {
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
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4E1',
  },
  calendarModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9D',
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
    backgroundColor: '#FFF8FA',
    borderRadius: 12,
    marginBottom: 8,
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
    color: '#FF6B9D',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#FFE4E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF8FA',
    color: '#FF6B9D',
  },
  calendarModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#FFE4E1',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF8E8E',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#FF8E8E',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
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
});
