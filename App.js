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

// Reusable Button component with romantic design
const RomanticButton = ({ title, onPress, variant = 'primary', style, disabled = false }) => {
  const buttonStyle = [
    styles.button,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'outline' && styles.buttonOutline,
    variant === 'heart' && styles.buttonHeart,
    disabled && styles.buttonDisabled,
    style
  ];

  const textStyle = [
    styles.buttonText,
    variant === 'secondary' && styles.buttonTextSecondary,
    variant === 'outline' && styles.buttonTextOutline,
    variant === 'heart' && styles.buttonTextHeart,
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

// Action Button component for sharing and calendar with romantic icons
const RomanticActionButton = ({ icon, title, onPress, color }) => (
  <TouchableOpacity style={[styles.actionButton, { backgroundColor: color }]} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.actionButtonIcon}>{icon}</Text>
    <Text style={styles.actionButtonText}>{title}</Text>
  </TouchableOpacity>
);

// Main Date Card component with romantic design
const DateCard = ({ idea, isRevealed, onReveal, onShareEmail, onShareSMS, onAddToCalendar, onSetReminder, revealAnimation }) => (
  <Animated.View style={[styles.card, { transform: [{ scale: revealAnimation }] }]}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>💕 DateUnveil 💕</Text>
      <Text style={styles.cardSubtitle}>Discover Your Perfect Date</Text>
    </View>
    
    <View style={styles.cardContent}>
      <Text style={styles.cardText}>
        {isRevealed ? (idea ? idea : 'Ready to discover your next adventure?') : 'Ready to discover your next adventure?'}
      </Text>
    </View>

    <RomanticButton 
      title={isRevealed ? '💝 Next Date Idea' : '💖 Reveal Date Idea'} 
      onPress={onReveal}
      variant="heart"
      style={styles.revealButton}
    />

    {isRevealed && idea && idea !== 'No more new ideas!' && (
      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>💌 Share & Plan Your Date</Text>
        <View style={styles.actionButtonsRow}>
          <RomanticActionButton 
            icon="💌" 
            title="Email" 
            onPress={onShareEmail}
            color="#FF6B9D"
          />
          <RomanticActionButton 
            icon="💬" 
            title="Message" 
            onPress={onShareSMS}
            color="#FF8E8E"
          />
        </View>
        <View style={styles.actionButtonsRow}>
          <RomanticActionButton 
            icon="📅" 
            title="Calendar" 
            onPress={onAddToCalendar}
            color="#FFB3D9"
          />
          <RomanticActionButton 
            icon="⏰" 
            title="Reminder" 
            onPress={onSetReminder}
            color="#FFC0CB"
          />
        </View>
      </View>
    )}
  </Animated.View>
);

// History Modal component with romantic styling
const HistoryModal = ({ visible, history, onClose }) => {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>💕 Your Date History 💕</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.historyList}>
          {history.length === 0 ? (
            <Text style={styles.emptyHistoryText}>No date ideas revealed yet. Start your romantic journey! 💕</Text>
          ) : (
            history.map((idea, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyNumber}>💕 #{index + 1}</Text>
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
  const [isRevealed, setIsRevealed] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [revealAnimation] = useState(new Animated.Value(1));

  // Romantic and diverse date ideas
  const dateIdeas = [
    'Sunset picnic with champagne and strawberries',
    'Cooking class for two - learn to make pasta together',
    'Stargazing with hot chocolate and blankets',
    'Board game night with wine and cheese',
    'Hiking adventure to a beautiful viewpoint',
    'Wine tasting at a local vineyard',
    'Dance lesson - salsa or tango for beginners',
    'Art gallery exploration with coffee afterwards',
    'Karaoke night at home with cocktails',
    'Bike ride through the city with ice cream stops',
    'Pottery making workshop - create something together',
    'Movie marathon with popcorn and cuddles',
    'Spa day at home with face masks and massages',
    'Photography walk - capture beautiful moments',
    'Bookstore date with coffee and deep conversations',
    'Mini golf challenge with playful betting',
    'Farmers market visit and cooking together',
    'DIY pizza night with wine and music',
    'Sunrise breakfast in bed',
    'Escape room adventure - solve puzzles together',
    'Concert under the stars with a blanket',
    'Baking cookies together with Christmas music',
    'Park bench people watching with coffee',
    'Thrift store treasure hunt for unique finds',
    'Sunset rooftop dinner with city views'
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

    if (!isRevealed) {
      // First click - reveal the idea
      const unrevealed = dateIdeas.filter(idea => !history.includes(idea));
      if (unrevealed.length === 0) {
        setCurrentIdea('No more new ideas! 💕');
        setIsRevealed(true);
        return;
      }
      const random = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setCurrentIdea(random);
      setIsRevealed(true);
    } else {
      // Second click - hide current idea and prepare for next reveal
      const newHistory = [...history, currentIdea];
      setHistory(newHistory);
      AsyncStorage.setItem('history', JSON.stringify(newHistory));
      setCurrentIdea(null);
      setIsRevealed(false);
    }
  };

  const shareByEmail = () => {
    if (!currentIdea) return;
    MailComposer.composeAsync({
      subject: '💕 DateUnveil: Amazing Date Idea 💕',
      body: `I just discovered this amazing date idea: ${currentIdea}\n\nShared via DateUnveil 💕\n\nLet\'s make it happen! 💖`,
    }).catch(() => Alert.alert('Error', 'Unable to open email composer.'));
  };

  const shareBySMS = () => {
    if (!currentIdea) return;
    let smsUrl = '';
    if (Platform.OS === 'ios') {
      smsUrl = `sms:&body=I%20just%20discovered%20this%20amazing%20date%20idea:%20${encodeURIComponent(currentIdea)}%20%0A%0AShared%20via%20DateUnveil%20💕%20%0A%0ALet\'s%20make%20it%20happen!%20💖`;
    } else {
      smsUrl = `sms:?body=I just discovered this amazing date idea: ${encodeURIComponent(currentIdea)}\n\nShared via DateUnveil 💕\n\nLet's make it happen! 💖`;
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
        title: `💕 DateUnveil: ${currentIdea}`,
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
          title: '💕 DateUnveil Reminder 💕',
          body: `Don't forget your romantic date: ${currentIdea}`,
        },
        trigger: { seconds: minutes * 60 },
      });
      Alert.alert('Reminder set!', `You will be reminded in ${minutes} minutes. ⏰💕`);
    } catch (e) {
      Alert.alert('Error', 'Could not schedule notification.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="light-content" backgroundColor="#FF6B9D" />
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💕 DateUnveil 💕</Text>
        <Text style={styles.headerSubtitle}>Discover Your Perfect Date</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DateCard
          idea={currentIdea}
          isRevealed={isRevealed}
          onReveal={revealIdea}
          onShareEmail={shareByEmail}
          onShareSMS={shareBySMS}
          onAddToCalendar={addToCalendar}
          onSetReminder={setReminder}
          revealAnimation={revealAnimation}
        />
      </ScrollView>

      <View style={styles.footer}>
        <RomanticButton 
          title="💕 View Date History 💕" 
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
    backgroundColor: '#FFF0F5',
  },
  header: {
    backgroundColor: '#FF6B9D',
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
    color: '#FFE4E1',
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
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFE4E1',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#FF8E8E',
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
    color: '#FF6B9D',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
  },
  revealButton: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: '#FFF0F5',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  buttonHeart: {
    backgroundColor: '#FF1493',
    borderWidth: 2,
    borderColor: '#FF69B4',
  },
  buttonDisabled: {
    backgroundColor: '#FFC0CB',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: '#FF6B9D',
  },
  buttonTextOutline: {
    color: '#FF6B9D',
  },
  buttonTextHeart: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    color: '#FFB6C1',
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#FFE4E1',
    paddingTop: 24,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B9D',
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
    backgroundColor: 'rgba(255, 107, 157, 0.5)',
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
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9D',
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
    fontSize: 18,
    color: '#FF8E8E',
    fontWeight: 'bold',
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
});
