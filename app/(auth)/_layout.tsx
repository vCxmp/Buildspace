import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F3F4F6' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="account-type" 
        options={{ 
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="athlete-auth" 
        options={{ 
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="sponsor-auth" 
        options={{ 
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="athlete-signup" 
        options={{ 
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="sponsor-signup" 
        options={{ 
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
} 