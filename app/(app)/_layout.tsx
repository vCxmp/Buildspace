import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F3F4F6' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="matches" 
        options={{ 
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="match" 
        options={{ 
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
} 