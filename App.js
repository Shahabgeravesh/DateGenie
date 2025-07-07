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
  LinearGradient
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as MailComposer from 'expo-mail-composer';
import * as Linking from 'expo-linking';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';

const { width, height } = Dimensions.get('window');

// Import date ideas from JSON file
import dateIdeasData from './dateIdeas.json';

// Advanced Category configuration with sophisticated icons and colors
const categories = {
  romantic: { 
    icon: '💝', 
    color: '#FF6B9D', 
    gradient: ['#FF6B9D', '#FF8E8E'],
    name: 'Romantic',
    description: 'Sweet & Intimate'
  },
  adventurous: { 
    icon: '🏔️', 
    color: '#4ECDC4', 
    gradient: ['#4ECDC4', '#44A08D'],
    name: 'Adventurous',
    description: 'Thrilling & Bold'
  },
  creative: { 
    icon: '🎨', 
    color: '#45B7D1', 
    gradient: ['#45B7D1', '#96C93D'],
    name: 'Creative',
    description: 'Artsy & Crafty'
  },
  active: { 
    icon: '⚡', 
    color: '#96CEB4', 
    gradient: ['#96CEB4', '#FFEAA7'],
    name: 'Active',
    description: 'Energetic & Sporty'
  },
  cozy: { 
    icon: '🛋️', 
    color: '#FFEAA7', 
    gradient: ['#FFEAA7', '#DDA0DD'],
    name: 'Cozy',
    description: 'Comfortable & Warm'
  },
  fun: { 
    icon: '🎉', 
    color: '#DDA0DD', 
    gradient: ['#DDA0DD', '#87CEEB'],
    name: 'Fun',
    description: 'Playful & Entertaining'
  },
  foodie: { 
    icon: '🍽️', 
    color: '#FF8E8E', 
    gradient: ['#FF8E8E', '#FFB347'],
    name: 'Foodie',
    description: 'Culinary & Delicious'
  },
  chill: { 
    icon: '😌', 
    color: '#87CEEB', 
    gradient: ['#87CEEB', '#98D8C8'],
    name: 'Chill',
    description: 'Relaxed & Peaceful'
  },
  cultural: { 
    icon: '🏛️', 
    color: '#DDA0DD', 
    gradient: ['#DDA0DD', '#FFB6C1'],
    name: 'Cultural',
    description: 'Educational & Enriching'
  },
  intellectual: { 
    icon: '🧠', 
    color: '#98D8C8', 
    gradient: ['#98D8C8', '#FFD93D'],
    name: 'Intellectual',
    description: 'Thoughtful & Engaging'
  },
  spontaneous: { 
    icon: '⚡', 
    color: '#FFB347', 
    gradient: ['#FFB347', '#FF6B6B'],
    name: 'Spontaneous',
    description: 'Impulsive & Exciting'
  }
};

// Advanced Icon Components
const CategoryIcon = ({ category, size = 'medium' }) => {
  const categoryInfo = categories[category];
  const iconSizes = {
    small: 16,
    medium: 24,
    large: 32
  };
  
  return (
    <View style={[
      styles.categoryIconContainer,
      { 
        width: iconSizes[size] + 8,
        height: iconSizes[size] + 8,
        backgroundColor: categoryInfo.color + '20'
      }
    ]}>
      <Text style={[styles.categoryIcon, { fontSize: iconSizes[size] }]}>
        {categoryInfo.icon}
      </Text>
    </View>
  );
};

const BudgetIcon = ({ budget }) => {
  const budgetConfig = {
    low: { icon: '💎', color: '#4CAF50', label: 'Budget' },
    medium: { icon: '💎💎', color: '#FF9800', label: 'Mid-Range' },
    high: { icon: '💎💎💎', color: '#E91E63', label: 'Premium' }
  };
  
  const config = budgetConfig[budget];
  
  return (
    <View style={[styles.budgetContainer, { backgroundColor: config.color + '15' }]}>
      <Text style={[styles.budgetIcon, { color: config.color }]}>{config.icon}</Text>
      <Text style={[styles.budgetLabel, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const LocationIcon = ({ location }) => {
  const locationConfig = {
    indoor: { icon: '🏠', color: '#9C27B0', label: 'Indoor' },
    outdoor: { icon: '🌳', color: '#4CAF50', label: 'Outdoor' }
  };
  
  const config = locationConfig[location];
  
  return (
    <View style={[styles.locationContainer, { backgroundColor: config.color + '15' }]}>
      <Text style={[styles.locationIcon, { color: config.color }]}>{config.icon}</Text>
      <Text style={[styles.locationLabel, { color: config.color }]}>{config.label}</Text>
    </View>
  );
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
const SmallCard = ({ item, isRevealed, onPress, isExpanded }) => {
  const cardStyle = [
    styles.smallCard,
    isRevealed && styles.revealedCard,
    isExpanded && styles.expandedCard
  ];

  const categoryInfo = categories[item.category];

  return (
    <TouchableOpacity 
      style={cardStyle} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardNumberContainer}>
          <Text style={styles.smallCardNumber}>#{item.id}</Text>
        </View>
        <CategoryIcon category={item.category} size="small" />
      </View>
      
      <View style={styles.cardContent}>
        {isRevealed && (
          <Text style={styles.smallCardText} numberOfLines={2}>
            {item.idea}
          </Text>
        )}
        {!isRevealed && (
          <View style={styles.mysteryContainer}>
            <Text style={styles.mysteryIcon}>💫</Text>
            <Text style={styles.mysteryText}>Tap to reveal</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardFooter}>
        <BudgetIcon budget={item.budget} />
        <LocationIcon location={item.location} />
      </View>
    </TouchableOpacity>
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
          <Text style={styles.categoryFilterIcon}>💕</Text>
          <Text style={styles.categoryFilterText}>All</Text>
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
            <Text style={styles.categoryFilterIcon}>{category.icon}</Text>
            <Text style={styles.categoryFilterText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Enhanced Expanded Card Component
const ExpandedCard = ({ item, onClose, onShareEmail, onShareSMS, onAddToCalendar, onSetReminder }) => {
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
            <Text style={styles.closeButtonText}>✕</Text>
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
              <Text style={styles.actionButtonIcon}>💌</Text>
              <Text style={styles.actionButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FF8E8E' }]} 
              onPress={onShareSMS}
            >
              <Text style={styles.actionButtonIcon}>💬</Text>
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FFB3D9' }]} 
              onPress={onAddToCalendar}
            >
              <Text style={styles.actionButtonIcon}>📅</Text>
              <Text style={styles.actionButtonText}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FFC0CB' }]} 
              onPress={onSetReminder}
            >
              <Text style={styles.actionButtonIcon}>⏰</Text>
              <Text style={styles.actionButtonText}>Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function App() {
  const [revealedCards, setRevealedCards] = useState(new Set());
  const [expandedCard, setExpandedCard] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

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
      subject: '💕 DateUnveil: Amazing Date Idea 💕',
      body: `I just discovered this amazing date idea: ${expandedCard.idea}\n\nShared via DateUnveil 💕\n\nLet's make it happen! 💖`,
    }).catch(() => Alert.alert('Error', 'Unable to open email composer.'));
  };

  const shareBySMS = () => {
    if (!expandedCard) return;
    let smsUrl = '';
    if (Platform.OS === 'ios') {
      smsUrl = `sms:&body=I%20just%20discovered%20this%20amazing%20date%20idea:%20${encodeURIComponent(expandedCard.idea)}%20%0A%0AShared%20via%20DateUnveil%20💕%20%0A%0ALet's%20make%20it%20happen!%20💖`;
    } else {
      smsUrl = `sms:?body=I just discovered this amazing date idea: ${encodeURIComponent(expandedCard.idea)}\n\nShared via DateUnveil 💕\n\nLet's make it happen! 💖`;
    }
    Linking.openURL(smsUrl).catch(() => Alert.alert('Error', 'Unable to open SMS app.'));
  };

  const addToCalendar = async () => {
    if (!expandedCard) return;
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Calendar permission is required to add events.');
        return;
      }
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
      if (!defaultCalendar) {
        Alert.alert('No calendar found', 'No modifiable calendar found on this device.');
        return;
      }
      const now = new Date();
      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: `💕 DateUnveil: ${expandedCard.idea}`,
        startDate: now,
        endDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours
        timeZone: undefined,
        notes: 'Planned with DateUnveil 💕',
      });
      if (eventId) {
        Alert.alert('Success', 'Date idea added to your calendar! 📅💕');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not add event to calendar.');
    }
  };

  const setReminder = async () => {
    if (!expandedCard) return;
    let minutes = 0;
    const input = prompt('Remind me in how many minutes? (e.g., 10)');
    if (!input) return;
    minutes = parseInt(input, 10);
    if (isNaN(minutes) || minutes <= 0) {
      Alert.alert('Invalid input', 'Please enter a valid number of minutes.');
      return;
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💕 DateUnveil Reminder 💕',
          body: `Don't forget your romantic date: ${expandedCard.idea}`,
        },
        trigger: { seconds: minutes * 60 },
      });
      Alert.alert('Reminder set!', `You will be reminded in ${minutes} minutes. ⏰💕`);
    } catch (e) {
      Alert.alert('Error', 'Could not schedule notification.');
    }
  };

  // Filter data based on selected category
  const filteredData = selectedCategory 
    ? dateIdeasData.filter(item => item.category === selectedCategory)
    : dateIdeasData;

  const renderCard = ({ item }) => (
    <SmallCard
      item={item}
      isRevealed={revealedCards.has(item.id)}
      onPress={() => handleCardPress(item)}
      isExpanded={expandedCard?.id === item.id}
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
          <Text style={styles.headerSubtitle}>Discover Your Perfect Date</Text>
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
      />

      <FlatList
        data={filteredData}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
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
      </View>

      {expandedCard && (
        <ExpandedCard
          item={expandedCard}
          onClose={closeExpandedCard}
          onShareEmail={shareByEmail}
          onShareSMS={shareBySMS}
          onAddToCalendar={addToCalendar}
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
    backgroundColor: '#FFF8FA',
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
  categoryFilterIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  categoryFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  gridContainer: {
    padding: 10,
  },
  smallCard: {
    width: (width - 40) / 3,
    height: 140,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 5,
    padding: 12,
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FFE4E1',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardNumberContainer: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryIconContainer: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    textAlign: 'center',
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
    fontSize: 24,
    marginBottom: 4,
  },
  mysteryText: {
    fontSize: 10,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  budgetIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  budgetLabel: {
    fontSize: 8,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  locationIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  locationLabel: {
    fontSize: 8,
    fontWeight: '600',
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
});
