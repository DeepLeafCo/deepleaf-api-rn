// src/hooks/useLocationService.ts
import { useState, useEffect } from 'react';
import Geolocation from 'react-native-geolocation-service';
import type { PositionData } from '../types';

export const useLocationService = () => {
  const [location, setLocation] = useState<PositionData | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return { location, locationLoading };
};
