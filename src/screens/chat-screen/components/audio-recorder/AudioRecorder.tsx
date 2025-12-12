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
// Only create it when actually needed (after runtime is ready)
let arPlayerInstance: AudioRecorderPlayer | null = null;
let isCreatingPlayer = false;
let playerCreationFailed = false;

function getARPlayer(): AudioRecorderPlayer | null {
  // If already created, return it
  if (arPlayerInstance) {
    return arPlayerInstance;
  }
  // If creation previously failed, don't try again (prevents infinite retries)
  if (playerCreationFailed) {
    console.warn('[AudioRecorder] Player creation previously failed, not retrying');
    return null;
  }
  // If currently creating, return null (prevent multiple simultaneous creations)
  if (isCreatingPlayer) {
    return null;
  }
  // DO NOT try to create here - only return existing instance
  // Creation should only happen in initializePlayer() useEffect
  console.warn('[AudioRecorder] Player not initialized yet');
  return null;
}

function createARPlayer(): AudioRecorderPlayer | null {
  if (arPlayerInstance) {
    return arPlayerInstance;
  }
  if (isCreatingPlayer) {
    return null;
  }
  if (playerCreationFailed) {
    return null;
  }
  try {
    isCreatingPlayer = true;
    console.log('[AudioRecorder] Attempting to create AudioRecorderPlayer...');
    arPlayerInstance = new AudioRecorderPlayer();
    isCreatingPlayer = false;
    console.log('[AudioRecorder] AudioRecorderPlayer created successfully');
    return arPlayerInstance;
  } catch (error) {
    console.error('[AudioRecorder] Failed to create AudioRecorderPlayer:', error);
    isCreatingPlayer = false;
    playerCreationFailed = true;
    return null;
  }
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
  const [arPlayerReady, setArPlayerReady] = useState(false);

  useEffect(() => {
    // Ensure AudioRecorderPlayer is created after component mounts (runtime is ready)
    // This prevents "constructor is not callable" errors
    const initializePlayer = () => {
      try {
        // Use createARPlayer() which actually creates the instance
        const player = createARPlayer();
        if (player) {
          console.log('[AudioRecorder] Player initialized successfully');
          setArPlayerReady(true);
        } else {
          console.warn('[AudioRecorder] Player initialization returned null, retrying...');
          // Retry after a longer delay if first attempt failed
          setTimeout(() => {
            const retryPlayer = createARPlayer();
            if (retryPlayer) {
              console.log('[AudioRecorder] Player initialized on retry');
              setArPlayerReady(true);
            } else {
              console.error('[AudioRecorder] Failed to initialize player after retry');
              Alert.alert(
                'Error',
                'Failed to initialize audio recorder. Please restart the app.',
              );
            }
          }, 500);
        }
      } catch (error) {
        console.error('[AudioRecorder] Failed to initialize player:', error);
        Alert.alert(
          'Error',
          'Failed to initialize audio recorder. Please restart the app.',
        );
      }
    };

    // Small delay to ensure runtime is fully ready
    const timer = setTimeout(initializePlayer, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only start recording after player is ready
    if (!arPlayerReady) return;

    const requestAndroidPermission = async () => {
      try {
        const grants = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );

        if (grants === PermissionsAndroid.RESULTS.GRANTED) {
          addRecorderListener();
        } else {
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    };
    const addRecorderListener = () => {
      try {
        const player = getARPlayer();
        if (!player) {
          console.error('[AudioRecorder] Player not initialized');
          return;
        }
        player.addRecordBackListener((recordingMeta: RecordBackType) => {
          setRecorderData(recordingMeta);
        });
        const dirs = RNFetchBlob.fs.dirs;
        const path = Platform.select({
          ios: `audio-${localRecordedAudioCacheFilePaths.length}.m4a`,
          android: `${dirs.CacheDir}/audio-${localRecordedAudioCacheFilePaths.length}.aac`,
        });

        player.startRecorder(path, {
          AVFormatIDKeyIOS: AVEncodingOption.aac,
          AVNumberOfChannelsKeyIOS: 2,
          AVSampleRateKeyIOS: 44100,
          AudioSourceAndroid: 1, // MIC
          OutputFormatAndroid: 6, // AAC_ADTS
          AudioEncoderAndroid: 3, // AAC
          AudioSamplingRateAndroid: 16000,
          AudioEncodingBitRateAndroid: 128000,
          AudioChannelsAndroid: 2,
        })
          .then((value: string) => {
            if (value) {
              setIsAudioRecording(true);
            }
          })
          .catch(error => {
            Alert.alert(
              'Error preparing audio file',
              error instanceof Error ? error.message : String(error),
            );
            deleteRecorder();
          });
      } catch (error) {
        console.error('[AudioRecorder] Error in addRecorderListener:', error);
        Alert.alert(
          'Error initializing recorder',
          error instanceof Error ? error.message : String(error),
        );
      }
    };
    if (Platform.OS === 'android') {
      requestAndroidPermission();
    } else {
      addRecorderListener();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arPlayerReady]);

  const deleteRecorder = async () => {
    try {
      const player = getARPlayer();
      if (player) {
        await player.stopRecorder();
      }
    } catch (error) {
      console.error('[AudioRecorder] Error stopping recorder:', error);
    } finally {
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

  const sendRecordedMessage = () => {
    if (isSending) return;
    if (!arPlayerReady) {
      Alert.alert('Error', 'Audio recorder is not ready. Please wait a moment and try again.');
      return;
    }
    setIsSending(true);
    try {
      const player = getARPlayer();
      if (!player) {
        // Player should exist if arPlayerReady is true, but handle edge case
        console.error('[AudioRecorder] Player is null despite arPlayerReady being true');
        Alert.alert('Error', 'Audio recorder is not initialized. Please try again.');
        setIsSending(false);
        return;
      }
      player.stopRecorder()
        .then(async value => {
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
        })
        .catch(e => {
          console.error('[AudioRecorder] Recording error:', e);
          Alert.alert('Recording Error', e instanceof Error ? e.message : String(e));
        })
        .finally(() => {
          setIsSending(false);
        });
    } catch (error) {
      console.error('[AudioRecorder] Error in sendRecordedMessage:', error);
      // Don't show alert if it's a constructor error - user already knows
      if (error instanceof Error && error.message.includes('constructor')) {
        Alert.alert(
          'Error',
          'Audio recorder is not ready. Please close and try recording again.',
        );
      } else {
        Alert.alert(
          'Error stopping recorder',
          error instanceof Error ? error.message : String(error),
        );
      }
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
