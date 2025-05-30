import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import AuthProvider from './context/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
      />
    </AuthProvider>
  );
}
