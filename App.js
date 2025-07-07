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
  StatusBar as RNStatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as MailComposer from 'expo-mail-composer';
import * as Linking from 'expo-linking';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';

const { width, height } = Dimensions.get('window');

// Reusable Button component with modern design
const ModernButton = ({ title, onPress, variant = 'primary', style, disabled = false }) => {
  const buttonStyle = [
    styles.button,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'outline' && styles.buttonOutline,
    disabled && styles.buttonDisabled,
    style
  ];

  const textStyle = [
    styles.buttonText,
    variant === 'secondary' && styles.buttonTextSecondary,
    variant === 'outline' && styles.buttonTextOutline,
    disabled && styles.buttonTextDisabled
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

// Action Button component for sharing and calendar
const ActionButton = ({ icon, title, onPress, color }) => (
  <TouchableOpacity style={[styles.actionButton, { backgroundColor: color }]} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.actionButtonIcon}>{icon}</Text>
    <Text style={styles.actionButtonText}>{title}</Text>
  </TouchableOpacity>
);

// Main Date Card component with stunning design
const DateCard = ({ idea, onReveal, onShareEmail, onShareSMS, onAddToCalendar, onSetReminder, revealAnimation }) => (
  <Animated.View style={[styles.card, { transform: [{ scale: revealAnimation }] }]}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>DateUnveil</Text>
      <Text style={styles.cardSubtitle}>Discover Amazing Date Ideas</Text>
    </View>
    
    <View style={styles.cardContent}>
      <Text style={styles.cardText}>
        {idea ? idea : 'Ready to discover your next adventure?'}
      </Text>
    </View>

    <ModernButton 
      title={idea ? 'Next Idea' : 'Reveal Date Idea'} 
      onPress={onReveal}
      style={styles.revealButton}
    />

    {idea && idea !== 'No more new ideas!' && (
      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>Share & Plan</Text>
        <View style={styles.actionButtonsRow}>
          <ActionButton 
            icon="📧" 
            title="Email" 
            onPress={onShareEmail}
            color="#FF6B6B"
          />
          <ActionButton 
            icon="💬" 
            title="SMS" 
            onPress={onShareSMS}
            color="#4ECDC4"
          />
        </View>
        <View style={styles.actionButtonsRow}>
          <ActionButton 
            icon="📅" 
            title="Calendar" 
            onPress={onAddToCalendar}
            color="#45B7D1"
          />
          <ActionButton 
            icon="⏰" 
            title="Reminder" 
            onPress={onSetReminder}
            color="#96CEB4"
          />
        </View>
      </View>
    )}
  </Animated.View>
);

// History Modal component
const HistoryModal = ({ visible, history, onClose }) => {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Your Date History</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.historyList}>
          {history.length === 0 ? (
            <Text style={styles.emptyHistoryText}>No date ideas revealed yet. Start exploring!</Text>
          ) : (
            history.map((idea, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyNumber}>#{index + 1}</Text>
                <Text style={styles.historyText}>{idea}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default function App() {
  const [currentIdea, setCurrentIdea] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [revealAnimation] = useState(new Animated.Value(1));

  // Expanded date ideas with more variety
  const dateIdeas = [
    'Sunset picnic at the beach',
    'Cooking class together',
    'Stargazing with hot chocolate',
    'Board game night with snacks',
    'Hiking adventure in nature',
    'Wine tasting experience',
    'Dance lesson for two',
    'Art gallery exploration',
    'Karaoke night at home',
    'Bike ride through the city',
    'Pottery making workshop',
    'Movie marathon with popcorn',
    'Spa day at home',
    'Photography walk',
    'Bookstore date with coffee',
    'Mini golf challenge',
    'Farmers market visit',
    'DIY pizza night',
    'Sunrise breakfast',
    'Escape room adventure',
    'Concert under the stars',
    'Baking cookies together',
    'Park bench people watching',
    'Thrift store treasure hunt',
    'Sunset rooftop dinner'
  ];

  useEffect(() => {
    // Load history from AsyncStorage on mount
    AsyncStorage.getItem('history').then(data => {
      if (data) setHistory(JSON.parse(data));
    });
    // Request notification permissions on mount
    Notifications.requestPermissionsAsync();
  }, []);

  const revealIdea = () => {
    // Animate the card
    Animated.sequence([
      Animated.timing(revealAnimation, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(revealAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Filter out already revealed ideas
    const unrevealed = dateIdeas.filter(idea => !history.includes(idea));
    if (unrevealed.length === 0) {
      setCurrentIdea('No more new ideas!');
      return;
    }
    const random = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    setCurrentIdea(random);
    const newHistory = [...history, random];
    setHistory(newHistory);
    AsyncStorage.setItem('history', JSON.stringify(newHistory));
  };

  const shareByEmail = () => {
    if (!currentIdea) return;
    MailComposer.composeAsync({
      subject: 'DateUnveil: Amazing Date Idea',
      body: `I just discovered this amazing date idea: ${currentIdea}\n\nShared via DateUnveil ❤️`,
    }).catch(() => Alert.alert('Error', 'Unable to open email composer.'));
  };

  const shareBySMS = () => {
    if (!currentIdea) return;
    let smsUrl = '';
    if (Platform.OS === 'ios') {
      smsUrl = `sms:&body=I%20just%20discovered%20this%20amazing%20date%20idea:%20${encodeURIComponent(currentIdea)}%20%0A%0AShared%20via%20DateUnveil%20❤️`;
    } else {
      smsUrl = `sms:?body=I just discovered this amazing date idea: ${encodeURIComponent(currentIdea)}\n\nShared via DateUnveil ❤️`;
    }
    Linking.openURL(smsUrl).catch(() => Alert.alert('Error', 'Unable to open SMS app.'));
  };

  const addToCalendar = async () => {
    if (!currentIdea) return;
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
        title: `DateUnveil: ${currentIdea}`,
        startDate: now,
        endDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours
        timeZone: undefined,
        notes: 'Planned with DateUnveil ❤️',
      });
      if (eventId) {
        Alert.alert('Success', 'Date idea added to your calendar! 📅');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not add event to calendar.');
    }
  };

  const setReminder = async () => {
    if (!currentIdea) return;
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
          title: 'DateUnveil Reminder',
          body: `Don't forget your date: ${currentIdea}`,
        },
        trigger: { seconds: minutes * 60 },
      });
      Alert.alert('Reminder set!', `You will be reminded in ${minutes} minutes. ⏰`);
    } catch (e) {
      Alert.alert('Error', 'Could not schedule notification.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="light-content" backgroundColor="#667eea" />
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DateUnveil</Text>
        <Text style={styles.headerSubtitle}>Discover Amazing Date Ideas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DateCard
          idea={currentIdea}
          onReveal={revealIdea}
          onShareEmail={shareByEmail}
          onShareSMS={shareBySMS}
          onAddToCalendar={addToCalendar}
          onSetReminder={setReminder}
          revealAnimation={revealAnimation}
        />
      </ScrollView>

      <View style={styles.footer}>
        <ModernButton 
          title="View History" 
          onPress={() => setShowHistory(true)}
          variant="outline"
          style={styles.historyButton}
        />
      </View>

      <HistoryModal 
        visible={showHistory}
        history={history}
        onClose={() => setShowHistory(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  cardContent: {
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 80,
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 20,
    color: '#2d3748',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
  },
  revealButton: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: '#f7fafc',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e0',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: '#2d3748',
  },
  buttonTextOutline: {
    color: '#667eea',
  },
  buttonTextDisabled: {
    color: '#a0aec0',
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 24,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 16,
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
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    width: '100%',
  },
  modalOverlay: {
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
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: width - 40,
    maxHeight: height * 0.7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#718096',
    fontWeight: 'bold',
  },
  historyList: {
    padding: 24,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  historyNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
    marginRight: 12,
    minWidth: 30,
  },
  historyText: {
    fontSize: 16,
    color: '#2d3748',
    flex: 1,
    lineHeight: 22,
  },
});
