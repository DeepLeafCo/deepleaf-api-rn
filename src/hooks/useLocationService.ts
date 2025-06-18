// src/hooks/useLocationService.ts
import { useState, useEffect } from 'react';
import Geolocation from 'react-native-geolocation-service';
import type { PositionData } from '../types';
import { usePermissions } from './usePermissions';
import { AppState, Platform } from 'react-native';

export const useLocationService = () => {
  const [location, setLocation] = useState<PositionData | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const { location: locationPermission, requestPermissions } = usePermissions();

  useEffect(() => {
    const fetchLocation = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000,
        }
      );
    };

    if (Platform.OS === 'web') {
      fetchLocation();
    } else {
      if (locationPermission) {
        fetchLocation();
      } else {
        requestPermissions().then((granted) => {
          if (granted) {
            fetchLocation();
          } else {
            setLocationLoading(false);
          }
        });
      }
    }

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        if (locationPermission) {
          fetchLocation();
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [locationPermission, requestPermissions]);

  return { location, locationLoading };
};
