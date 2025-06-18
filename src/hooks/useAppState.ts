// src/hooks/useAppState.ts
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import type { AppStateStatus } from 'react-native';

export const useAppState = () => {
  // Initialize with current state, handle web platform differently
  const initialState = Platform.select({
    web: 'active',
    default: AppState.currentState,
  });

  const [appState, setAppState] = useState(initialState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        setAppState(nextAppState);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return appState;
};
