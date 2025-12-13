/**
 * This code was taken from https://github.com/GetStream/react-native-samples/blob/main/projects/WhatsAppClone/src/utils/AudioManager.ts
 * All credits goes the Awesome Developer [@vanGalilea](https://github.com/vanGalilea/vanGalilea)
 */

import AudioRecorderPlayer, { PlayBackType } from 'react-native-audio-recorder-player';
import { createAudioRecorderPlayer, getAudioRecorderPlayer } from './AudioRecorderPlayerManager';

export type Callback = (args: { status: AudioStatus; data?: PlayBackType }) => void;

type Path = string | undefined;

export enum AudioStatus {
  PLAYING = 'PLAYING',
  STARTED = 'STARTED',
  PAUSED = 'PAUSED',
  RESUMED = 'RESUMED',
  STOPPED = 'STOPPED',
}

// Use shared player instance from AudioRecorderPlayerManager
// This ensures consistent initialization and prevents conflicts
let currentPath: Path;
let currentCallback: Callback = () => {};
let currentPosition = 0;

export const startPlayer = async (path: string, callback: Callback) => {
  if (currentPath === undefined) {
    currentPath = path;
    currentCallback = callback;
  } else if (currentPath !== path) {
    const player = getAudioRecorderPlayer();
    if (player !== undefined) {
      await stopPlayer();
    }
    currentPath = path;
    currentCallback = callback;
  }

  // Wait for player to be ready (with retry logic)
  const audioRecorderPlayer = await createAudioRecorderPlayer();
  if (!audioRecorderPlayer) {
    throw new Error('Failed to initialize audio player. Please try again.');
  }

  const shouldBeResumed = currentPath === path && currentPosition > 0;

  if (shouldBeResumed) {
    await audioRecorderPlayer.resumePlayer();
    currentCallback({
      status: AudioStatus.RESUMED,
    });
    return;
  }

  await audioRecorderPlayer.startPlayer(currentPath);
  currentCallback({
    status: AudioStatus.STARTED,
  });
  audioRecorderPlayer.addPlayBackListener(async e => {
    if (e.currentPosition === e.duration) {
      currentCallback({
        status: AudioStatus.STOPPED,
        data: e,
      });
      await stopPlayer();
    } else {
      currentPosition = e.currentPosition;
      currentCallback({
        status: AudioStatus.PLAYING,
        data: e,
      });
    }
    return;
  });
};

export const pausePlayer = async () => {
  const player = getAudioRecorderPlayer();
  if (player) {
    await player.pausePlayer();
    currentCallback({ status: AudioStatus.PAUSED });
  }
};

export const resumePlayer = async () => {
  const player = getAudioRecorderPlayer();
  if (player) {
    await player.resumePlayer();
    currentCallback({ status: AudioStatus.RESUMED });
  }
};

export const seekTo = async (position: number) => {
  const player = getAudioRecorderPlayer();
  if (player) {
    await player.seekToPlayer(position);
    currentCallback({ status: AudioStatus.PLAYING });
  }
};

export const stopPlayer = async () => {
  const player = getAudioRecorderPlayer();
  if (player) {
    await player.stopPlayer();
    player.removePlayBackListener();
    currentPosition = 0;
    currentCallback({ status: AudioStatus.STOPPED });
    // Note: We don't clear the shared player instance here
    // It can be reused for other operations
  }
};
