import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import { auth, db } from '../services/firebase/config';
import { sendMessage, subscribeToMessages } from '../services/firebase/messages';

const ChatScreen = ({ matchId, otherUserName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const flatListRef = useRef(null);

  // Reset state when component mounts or matchId changes
  useEffect(() => {
    setMessages([]);
    setNewMessage('');
    setLoading(true);
    setUserName('');
    loadUserData();
  }, [matchId]);

  const loadUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Try to get user data from both collections
      const sponsorRef = doc(db, 'sponsors', currentUser.uid);
      const athleteRef = doc(db, 'athletes', currentUser.uid);

      const [sponsorDoc, athleteDoc] = await Promise.all([
        getDoc(sponsorRef),
        getDoc(athleteRef)
      ]);

      if (sponsorDoc.exists()) {
        setUserName(sponsorDoc.data().companyName);
      } else if (athleteDoc.exists()) {
        setUserName(athleteDoc.data().fullName);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    if (!matchId) {
      console.error('No matchId provided');
      return;
    }

    const unsubscribe = subscribeToMessages(matchId, (updatedMessages) => {
      setMessages(updatedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [matchId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No current user found');
      return;
    }

    try {
      console.log('Sending message:', {
        matchId,
        userId: currentUser.uid,
        userName: userName || 'User',
        message: newMessage.trim()
      });

      await sendMessage(
        matchId,
        currentUser.uid,
        userName || 'User',
        newMessage.trim()
      );
      
      setNewMessage('');
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error to user if needed
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.user._id === auth.currentUser?.uid;

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.sentMessage : styles.receivedMessage
      ]}>
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.sentMessageText : styles.receivedMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.timestamp,
          isCurrentUser ? styles.sentTimestamp : styles.receivedTimestamp
        ]}>
          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <CustomHeader 
            title={otherUserName} 
            showBackButton 
            onBackPress={() => {
              Keyboard.dismiss();
              router.back();
            }} 
          />
        </View>
        <View style={styles.chatWrapper}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
            ref={flatListRef}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled
              ]} 
              onPress={handleSend}
              disabled={!newMessage.trim()}
            >
              <Text style={[
                styles.sendButtonText,
                !newMessage.trim() && styles.sendButtonTextDisabled
              ]}>
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E3A8A',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
  },
  sentMessageText: {
    color: '#FFFFFF',
  },
  receivedMessageText: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  sentTimestamp: {
    color: '#E5E7EB',
  },
  receivedTimestamp: {
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    minHeight: 60,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
});

export default ChatScreen;
  
  