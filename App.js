import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Button, Text, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as MailComposer from 'expo-mail-composer';
import * as Linking from 'expo-linking';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';

// Reusable Card component with share, calendar, and notification options
const DateCard = ({ idea, onReveal, onShareEmail, onShareSMS, onAddToCalendar, onSetReminder }) => (
  <View style={styles.card}>
    <Text style={styles.cardText}>{idea ? idea : 'Tap to reveal a date idea!'}</Text>
    <Button title={idea ? 'Next' : 'Reveal'} onPress={onReveal} />
    {idea && idea !== 'No more new ideas!' && (
      <>
        <View style={styles.shareRow}>
          <Button title="Share via Email" onPress={onShareEmail} />
          <View style={{ width: 12 }} />
          <Button title="Share via SMS" onPress={onShareSMS} />
        </View>
        <View style={{ height: 12 }} />
        <Button title="Add to Calendar" onPress={onAddToCalendar} />
        <View style={{ height: 12 }} />
        <Button title="Set Reminder" onPress={onSetReminder} />
      </>
    )}
  </View>
);

export default function App() {
  const [currentIdea, setCurrentIdea] = useState(null);
  const [history, setHistory] = useState([]);

  // Example local date ideas (would be expanded in real app)
  const dateIdeas = [
    'Picnic in the park',
    'Movie night at home',
    'Stargazing adventure',
    'Cooking a new recipe together',
    'Board game challenge',
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
      subject: 'DateUnveil: Date Idea',
      body: `Here's a fun date idea: ${currentIdea}`,
    }).catch(() => Alert.alert('Error', 'Unable to open email composer.'));
  };

  const shareBySMS = () => {
    if (!currentIdea) return;
    let smsUrl = '';
    if (Platform.OS === 'ios') {
      smsUrl = `sms:&body=Here%27s%20a%20fun%20date%20idea:%20${encodeURIComponent(currentIdea)}`;
    } else {
      smsUrl = `sms:?body=Here's a fun date idea: ${encodeURIComponent(currentIdea)}`;
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
        notes: 'Planned with DateUnveil',
      });
      if (eventId) {
        Alert.alert('Success', 'Date idea added to your calendar!');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not add event to calendar.');
    }
  };

  // Simple time picker for notification (prompt for minutes from now)
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
      Alert.alert('Reminder set!', `You will be reminded in ${minutes} minutes.`);
    } catch (e) {
      Alert.alert('Error', 'Could not schedule notification.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DateCard
        idea={currentIdea}
        onReveal={revealIdea}
        onShareEmail={shareByEmail}
        onShareSMS={shareBySMS}
        onAddToCalendar={addToCalendar}
        onSetReminder={setReminder}
      />
      <Button title="View History" onPress={() => alert(history.join('\n'))} />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#f9c2ff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  shareRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'center',
  },
});
