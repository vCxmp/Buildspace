import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F3F4F6' },
        animation: 'slide_from_right',
      }}
    >
      {!user ? (
        // Auth Stack
        <>
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
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen 
            name="match" 
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
        </>
      )}
    </Stack>
  );
} 