import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import ChatScreen from '../src/screens/ChatScreen';

export default function Chat() {
  const params = useLocalSearchParams();
  return <ChatScreen matchId={params.matchId} otherUserName={params.otherUserName} />;
} 