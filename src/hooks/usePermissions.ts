// src/hooks/usePermissions.ts
import { useState, useEffect, useCallback } from 'react';
import {
  checkMultiple,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import type { Permission } from 'react-native-permissions';
import { Platform } from 'react-native';

type PermissionStatus = {
  camera: boolean;
  location: boolean;
  storage: boolean;
  loading: boolean;
  error: string | null;
};

type PlatformPermissions = {
  camera: Permission;
  location: Permission;
  storage: Permission;
};

// Define permissions separately for each platform
const ANDROID_PERMISSIONS: PlatformPermissions = {
  camera: PERMISSIONS.ANDROID.CAMERA,
  location: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  storage:
    (typeof Platform.Version === 'string'
      ? parseInt(Platform.Version, 10)
      : Platform.Version) >= 33
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
} as const;

const IOS_PERMISSIONS: PlatformPermissions = {
  camera: PERMISSIONS.IOS.CAMERA,
  location: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  storage: PERMISSIONS.IOS.PHOTO_LIBRARY,
} as const;

// Get the correct permissions based on platform
const getPlatformPermissions = (): PlatformPermissions => {
  return Platform.OS === 'ios' ? IOS_PERMISSIONS : ANDROID_PERMISSIONS;
};

export const usePermissions = () => {
  const [status, setStatus] = useState<PermissionStatus>({
    camera: false,
    location: false,
    storage: false,
    loading: true,
    error: null,
  });

  const checkPermissions = useCallback(async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true, error: null }));

      const permissions = getPlatformPermissions();
      const statuses = await checkMultiple([
        permissions.camera,
        permissions.location,
        permissions.storage,
      ]);

      setStatus({
        camera: statuses[permissions.camera] === RESULTS.GRANTED,
        location: statuses[permissions.location] === RESULTS.GRANTED,
        storage: statuses[permissions.storage] === RESULTS.GRANTED,
        loading: false,
        error: null,
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to check permissions',
      }));
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true, error: null }));

      const permissions = getPlatformPermissions();
      const statuses = await requestMultiple([
        permissions.camera,
        permissions.location,
        permissions.storage,
      ]);

      const newStatus = {
        camera: statuses[permissions.camera] === RESULTS.GRANTED,
        location: statuses[permissions.location] === RESULTS.GRANTED,
        storage: statuses[permissions.storage] === RESULTS.GRANTED,
        loading: false,
        error: null,
      };

      setStatus(newStatus);
      return newStatus.camera && newStatus.location && newStatus.storage;
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to request permissions',
      }));
      return false;
    }
  }, []);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    ...status,
    checkPermissions,
    requestPermissions,
  };
};
