import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, PermissionsAndroid, Platform, Pressable } from 'react-native';
import AudioRecorderPlayer, {
  RecordBackType,
  AVEncodingOption,
} from 'react-native-audio-recorder-player';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { isUndefined } from 'lodash';
import * as Sentry from '@sentry/react-native';
import RNFetchBlob from 'rn-fetch-blob';

import { TEXT_INPUT_CONTAINER_HEIGHT } from '@/constants';
import { useChatWindowContext } from '@/context';
import { SendIcon, Trash } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next';
import { PauseIcon, PlayIcon } from '../message-components';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  addNewCachePath,
  selectLocalRecordedAudioCacheFilePaths,
} from '@/store/conversation/localRecordedAudioCacheSlice';
// eslint-disable-next-line import/no-unresolved
import { convertAacToWav } from '@/utils/audioConverter';

const RecorderSegmentWidth = Dimensions.get('screen').width - 8 - 80 - 12;

// Lazy-load ARPlayer instance to avoid "runtime not ready" errors
// Only create it when user actually tries to record (not on component mount)
let arPlayerInstance: AudioRecorderPlayer | null = null;
let isCreatingPlayer = false;
let playerCreationFailed = false;
const MAX_RETRIES = 10;
let retryCount = 0;

function getARPlayer(): AudioRecorderPlayer | null {
  // If already created, return it
  if (arPlayerInstance) {
    return arPlayerInstance;
  }
  // If creation failed, don't try again
  if (playerCreationFailed) {
    return null;
  }
  // If currently creating, return null (prevent multiple simultaneous creations)
  if (isCreatingPlayer) {
    return null;
  }
  // DO NOT try to create here - only return existing instance
  return null;
}

function createARPlayer(): Promise<AudioRecorderPlayer | null> {
  return new Promise((resolve) => {
    // If already created, return it immediately
    if (arPlayerInstance) {
      resolve(arPlayerInstance);
      return;
    }
    // If creation previously failed, don't retry
    if (playerCreationFailed) {
      console.warn('[AudioRecorder] Player creation previously failed, not retrying');
      resolve(null);
      return;
    }
    // If currently creating, wait a bit and retry (but limit retries)
    if (isCreatingPlayer) {
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          createARPlayer().then(resolve);
        }, 100);
      } else {
        console.error('[AudioRecorder] Max retries reached while waiting for creation');
        resolve(null);
      }
      return;
    }
    // Check retry count
    if (retryCount >= MAX_RETRIES) {
      console.error('[AudioRecorder] Max retries reached, giving up');
      playerCreationFailed = true;
      resolve(null);
      return;
    }
    
    // Try to create the instance immediately (no delay on first attempt)
    isCreatingPlayer = true;
    retryCount++;
    const currentRetry = retryCount;
    
    // Try to create immediately - wrap everything in try-catch
    // Even accessing AudioRecorderPlayer can throw if module isn't ready
    try {
      arPlayerInstance = new AudioRecorderPlayer();
      isCreatingPlayer = false;
      retryCount = 0; // Reset on success
      console.log('[AudioRecorder] AudioRecorderPlayer created successfully');
      resolve(arPlayerInstance);
      return;
    } catch (error) {
      // Constructor failed - need to wait and retry
      isCreatingPlayer = false;
      console.log(`[AudioRecorder] Constructor not ready (attempt ${currentRetry}/${MAX_RETRIES}), will retry...`);
      
      // If we've exhausted retries, mark as failed
      if (currentRetry >= MAX_RETRIES) {
        playerCreationFailed = true;
        console.error('[AudioRecorder] Max retries reached, marking as failed');
        resolve(null);
        return;
      }
      
      // Use exponential backoff for retries (only if immediate attempt failed)
      // First retry: 200ms, then 300ms, 450ms, 675ms, etc. (max 2 seconds)
      const delay = Math.min(200 * Math.pow(1.5, currentRetry - 1), 2000);
      
      setTimeout(() => {
        createARPlayer().then(resolve);
      }, delay);
    }
  });
}

/**
 * ! Handling Audio Server Side
 * https://github.com/jsierles/react-native-audio/issues/107
 */

/**
 * The function `millisecondsToTimeString` converts a given number of milliseconds into a formatted
 * time string in the format "mm:ss".
 * @param {number} milliseconds - The `milliseconds` parameter is a number representing the duration in
 * milliseconds that you want to convert to a time string.
 * @returns The function `millisecondsToTimeString` returns a string in the format "mm:ss", where "mm"
 * represents the minutes and "ss" represents the seconds.
 */
const millisecondsToTimeString = (milliseconds: number | undefined) => {
  // Check if the input is not a valid number or is negative
  if ((milliseconds && isNaN(milliseconds)) || isUndefined(milliseconds)) {
    return '00:00';
  }

  // Convert milliseconds to seconds
  const totalSeconds = Math.floor(milliseconds / 1000);

  // Calculate the minutes and seconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Create the time string with leading zeros
  const minutesString = String(minutes).padStart(2, '0');
  const secondsString = String(seconds).padStart(2, '0');

  return `${minutesString}:${secondsString}`;
};

export const AudioRecorder = ({
  onRecordingComplete,
  audioFormat,
}: {
  onRecordingComplete: (audioFile: File) => void;
  audioFormat: 'audio/m4a' | 'audio/wav';
}) => {
  const localRecordedAudioCacheFilePaths = useAppSelector(selectLocalRecordedAudioCacheFilePaths);
  const dispatch = useAppDispatch();
  const [isSending, setIsSending] = useState(false);

  const { setIsVoiceRecorderOpen } = useChatWindowContext();

  const [isAudioRecording, setIsAudioRecording] = useState(false);

  const [recorderData, setRecorderData] = useState<RecordBackType | undefined>(undefined);

  useEffect(() => {
    // Reset retry state on mount to allow fresh attempts
    retryCount = 0;
    playerCreationFailed = false;

    // Request permissions and start recording when component mounts
    const startRecording = async () => {
      try {
        // Request permissions first (Android only)
        if (Platform.OS === 'android') {
          try {
            const grants = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            );
            if (grants !== PermissionsAndroid.RESULTS.GRANTED) {
              console.warn('[AudioRecorder] Audio permission denied');
              setIsVoiceRecorderOpen(false);
              return;
            }
          } catch (err) {
            console.warn('[AudioRecorder] Permission request error:', err);
            setIsVoiceRecorderOpen(false);
            return;
          }
        }

        // Create player asynchronously - tries immediately, retries if needed
        const player = await createARPlayer();
        if (!player) {
          console.error('[AudioRecorder] Failed to initialize player for recording');
          Alert.alert(
            'Error',
            'Failed to initialize audio recorder. Please close and try again.',
          );
          setIsVoiceRecorderOpen(false);
          return;
        }

        // Add listener for recording updates
        player.addRecordBackListener((recordingMeta: RecordBackType) => {
          setRecorderData(recordingMeta);
        });

        // Prepare file path
        const dirs = RNFetchBlob.fs.dirs;
        const path = Platform.select({
          ios: `audio-${localRecordedAudioCacheFilePaths.length}.m4a`,
          android: `${dirs.CacheDir}/audio-${localRecordedAudioCacheFilePaths.length}.aac`,
        });

        // Start recording
        await player.startRecorder(path, {
          AVFormatIDKeyIOS: AVEncodingOption.aac,
          AVNumberOfChannelsKeyIOS: 2,
          AVSampleRateKeyIOS: 44100,
          AudioSourceAndroid: 1, // MIC
          OutputFormatAndroid: 6, // AAC_ADTS
          AudioEncoderAndroid: 3, // AAC
          AudioSamplingRateAndroid: 16000,
          AudioEncodingBitRateAndroid: 128000,
          AudioChannelsAndroid: 2,
        });

        setIsAudioRecording(true);
        console.log('[AudioRecorder] Recording started successfully');
      } catch (error) {
        console.error('[AudioRecorder] Error starting recording:', error);
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Failed to start recording. Please try again.',
        );
        setIsVoiceRecorderOpen(false);
      }
    };

    startRecording();

    // Cleanup on unmount
    return () => {
      // Reset retry count and failed flag when component unmounts
      // This allows retry on next mount
      retryCount = 0;
      playerCreationFailed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteRecorder = async () => {
    try {
      const player = getARPlayer();
      if (player) {
        try {
          await player.stopRecorder();
        } catch (error) {
          console.error('[AudioRecorder] Error stopping recorder:', error);
        }
      }
    } catch (error) {
      console.error('[AudioRecorder] Error in deleteRecorder:', error);
    } finally {
      // Reset state
      setIsAudioRecording(false);
      setRecorderData(undefined);
      setIsVoiceRecorderOpen(false);
    }
  };

  const createAudioFile = async (value: string) => {
    const cleanPath =
      Platform.select({
        ios: value.replace('file://', ''),
        android: value.replace(/\/\/+/g, '/'),
      }) || value;
    let finalPath = cleanPath;
    const stats = await RNFetchBlob.fs.stat(finalPath);

    if (Platform.OS === 'android') {
      return {
        uri: finalPath,
        originalPath: finalPath,
        type: 'audio/aac',
        fileName: `audio-${localRecordedAudioCacheFilePaths.length}.aac`,
        name: `audio-${localRecordedAudioCacheFilePaths.length}.aac`,
        fileSize: stats.size,
      };
    }

    const finalExtension = audioFormat === 'audio/wav' ? 'wav' : 'm4a';

    if (audioFormat === 'audio/wav') {
      finalPath = await convertAacToWav(cleanPath);
      finalPath = finalPath.replace('file://', '');
    }

    const audioFile = {
      uri: Platform.OS === 'ios' ? `file://${finalPath}` : finalPath,
      originalPath: finalPath,
      type: audioFormat,
      fileName: `audio-${localRecordedAudioCacheFilePaths.length}.${finalExtension}`,
      name: `audio-${localRecordedAudioCacheFilePaths.length}.${finalExtension}`,
      fileSize: stats.size,
    };

    return audioFile;
  };

  const sendRecordedMessage = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      // Get existing player instance
      const player = getARPlayer();
      if (!player) {
        console.error('[AudioRecorder] Player not initialized, cannot stop recording');
        Alert.alert(
          'Error',
          'Audio recorder is not ready. Please close and try recording again.',
        );
        setIsSending(false);
        return;
      }

      // Stop recording
      const value = await player.stopRecorder();
      
      // Reset recording state
      setIsAudioRecording(false);
      setRecorderData(undefined);

      // Create audio file
      try {
        const audioFile = await createAudioFile(value);
        dispatch(addNewCachePath(audioFile.originalPath));
        setIsVoiceRecorderOpen(false);
        onRecordingComplete(audioFile as unknown as File);
      } catch (error) {
        Sentry.captureException(error);
        Alert.alert(
          'Error preparing audio file',
          error instanceof Error ? error.message : String(error),
        );
      }
    } catch (error) {
      console.error('[AudioRecorder] Error in sendRecordedMessage:', error);
      Alert.alert(
        'Error stopping recorder',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsSending(false);
    }
  };

  const toggleRecorder = async () => {
    try {
      const player = getARPlayer();
      if (!player) {
        console.error('[AudioRecorder] Player not initialized');
        return;
      }
      if (isAudioRecording) {
        await player.pauseRecorder();
      } else {
        await player.resumeRecorder();
      }
      setIsAudioRecording(!isAudioRecording);
    } catch (error) {
      console.error('[AudioRecorder] Error toggling recorder:', error);
      Alert.alert(
        'Error toggling recorder',
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  return (
    <Animated.View
      exiting={SlideOutDown.damping(24).stiffness(180)}
      entering={SlideInDown.damping(24).stiffness(180)}
      style={tailwind.style(
        'px-1 flex flex-row items-center overflow-hidden',
        `max-h-[${TEXT_INPUT_CONTAINER_HEIGHT}px]`,
      )}>
      <Pressable
        onPress={deleteRecorder}
        style={tailwind.style('h-10 w-10 flex items-center justify-center')}>
        <Icon icon={<Trash />} size={28} />
      </Pressable>
      <Animated.View
        style={tailwind.style(
          'bg-blue-800 px-3 py-[7px] rounded-2xl min-h-9 flex flex-row items-center justify-between mx-1.5',
          `w-[${RecorderSegmentWidth}px]`,
        )}>
        <Pressable onPress={toggleRecorder} hitSlop={12}>
          {isAudioRecording ? (
            <Animated.View>
              <Icon icon={<PauseIcon fill={'white'} />} />
            </Animated.View>
          ) : (
            <Animated.View>
              <Icon icon={<PlayIcon fill={'white'} />} />
            </Animated.View>
          )}
        </Pressable>
        <Animated.Text
          style={tailwind.style(
            'text-xs leading-[14px] font-inter-420-20 tracking-[0.32px] text-whiteA-A12',
          )}>
          {millisecondsToTimeString(recorderData?.currentPosition)}
        </Animated.Text>
      </Animated.View>
      <Pressable
        disabled={isSending}
        onPress={sendRecordedMessage}
        style={tailwind.style('h-10 w-10 flex items-center justify-center')}>
        <Animated.View
          style={tailwind.style(
            'flex items-center justify-center h-7 w-7 rounded-full bg-blue-800',
          )}>
          <Icon icon={<SendIcon />} size={16} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
