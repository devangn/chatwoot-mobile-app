/**
 * Safe wrapper for react-native-device-info to prevent crashes
 * when native modules fail to initialize (e.g., Install Referrer API issues)
 */

import { Platform } from 'react-native';

// Cache for device info to avoid repeated calls
let deviceInfoCache: {
  uniqueId?: string;
  systemName?: string;
  manufacturer?: string;
  model?: string;
  apiLevel?: number;
  brand?: string;
  buildNumber?: string;
  deviceId?: string;
} = {};

// Flag to track if device info module is available
let isDeviceInfoAvailable = true;

/**
 * Safely execute a device info function with error handling
 */
async function safeDeviceInfoCall<T>(
  fn: () => Promise<T> | T,
  fallback: T,
  errorContext: string,
): Promise<T> {
  if (!isDeviceInfoAvailable) {
    console.warn(`[DeviceInfo] Module unavailable, using fallback for: ${errorContext}`);
    return fallback;
  }

  try {
    const result = await Promise.resolve(fn());
    return result;
  } catch (error) {
    console.error(`[DeviceInfo] Error in ${errorContext}:`, error);
    isDeviceInfoAvailable = false;

    return fallback;
  }
}

/**
 * Initialize device info module safely
 * This should be called early in app initialization
 */
export async function initializeDeviceInfo(): Promise<void> {
  try {
    // Try to import and use a simple function to check if module is available
    const DeviceInfo = require('react-native-device-info');
    if (DeviceInfo && typeof DeviceInfo.getSystemName === 'function') {
      await safeDeviceInfoCall(
        () => DeviceInfo.getSystemName(),
        Platform.OS,
        'initialization check',
      );
      isDeviceInfoAvailable = true;
      console.log('[DeviceInfo] Module initialized successfully');
    } else {
      throw new Error('DeviceInfo module not properly loaded');
    }
  } catch (error) {
    console.error('[DeviceInfo] Failed to initialize:', error);
    isDeviceInfoAvailable = false;
  }
}

/**
 * Safe wrapper functions for device info
 */
export const DeviceInfoSafe = {
  getUniqueId: async (): Promise<string> => {
    if (deviceInfoCache.uniqueId) {
      return deviceInfoCache.uniqueId;
    }

    try {
      const { getUniqueId } = require('react-native-device-info');
      const id = await safeDeviceInfoCall(
        () => getUniqueId(),
        `unknown-${Date.now()}`,
        'getUniqueId',
      );
      deviceInfoCache.uniqueId = id;
      return id;
    } catch (error) {
      return `fallback-${Date.now()}`;
    }
  },

  getSystemName: (): string => {
    if (deviceInfoCache.systemName) {
      return deviceInfoCache.systemName;
    }

    try {
      if (!isDeviceInfoAvailable) {
        return Platform.OS;
      }
      const { getSystemName } = require('react-native-device-info');
      const name = getSystemName();
      deviceInfoCache.systemName = name;
      return name;
    } catch (error) {
      console.error('[DeviceInfo] Error in getSystemName:', error);
      isDeviceInfoAvailable = false;
      return Platform.OS;
    }
  },

  getManufacturer: async (): Promise<string> => {
    if (deviceInfoCache.manufacturer) {
      return deviceInfoCache.manufacturer;
    }

    try {
      const { getManufacturer } = require('react-native-device-info');
      const manufacturer = await safeDeviceInfoCall(
        () => getManufacturer(),
        'Unknown',
        'getManufacturer',
      );
      deviceInfoCache.manufacturer = manufacturer;
      return manufacturer;
    } catch (error) {
      return 'Unknown';
    }
  },

  getModel: async (): Promise<string> => {
    if (deviceInfoCache.model) {
      return deviceInfoCache.model;
    }

    try {
      const { getModel } = require('react-native-device-info');
      const model = await safeDeviceInfoCall(() => getModel(), 'Unknown Device', 'getModel');
      deviceInfoCache.model = model;
      return model;
    } catch (error) {
      return 'Unknown Device';
    }
  },

  getApiLevel: async (): Promise<number> => {
    if (deviceInfoCache.apiLevel !== undefined) {
      return deviceInfoCache.apiLevel;
    }

    try {
      const { getApiLevel } = require('react-native-device-info');
      const apiLevel = await safeDeviceInfoCall(
        () => getApiLevel(),
        Platform.OS === 'android' ? 24 : 0,
        'getApiLevel',
      );
      deviceInfoCache.apiLevel = apiLevel;
      return apiLevel;
    } catch (error) {
      return Platform.OS === 'android' ? 24 : 0;
    }
  },

  getBrand: async (): Promise<string> => {
    if (deviceInfoCache.brand) {
      return deviceInfoCache.brand;
    }

    try {
      const { getBrand } = require('react-native-device-info');
      const brand = await safeDeviceInfoCall(() => getBrand(), 'Unknown', 'getBrand');
      deviceInfoCache.brand = brand;
      return brand;
    } catch (error) {
      return 'Unknown';
    }
  },

  getBuildNumber: async (): Promise<string> => {
    if (deviceInfoCache.buildNumber) {
      return deviceInfoCache.buildNumber;
    }

    try {
      const { getBuildNumber } = require('react-native-device-info');
      const buildNumber = await safeDeviceInfoCall(
        () => getBuildNumber(),
        '1',
        'getBuildNumber',
      );
      deviceInfoCache.buildNumber = buildNumber;
      return buildNumber;
    } catch (error) {
      return '1';
    }
  },

  getDeviceId: (): string => {
    if (deviceInfoCache.deviceId) {
      return deviceInfoCache.deviceId;
    }

    try {
      if (!isDeviceInfoAvailable) {
        return 'unknown-device';
      }
      const DeviceInfo = require('react-native-device-info');
      const deviceId = DeviceInfo.getDeviceId();
      deviceInfoCache.deviceId = deviceId;
      return deviceId;
    } catch (error) {
      console.error('[DeviceInfo] Error in getDeviceId:', error);
      isDeviceInfoAvailable = false;
      return 'unknown-device';
    }
  },
};

