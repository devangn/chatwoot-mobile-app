/**
 * Shared AudioRecorderPlayer initialization manager
 * Handles lazy loading and retry logic for New Architecture compatibility
 * Both AudioRecorder and AudioManager use this to ensure consistent initialization
 */

import AudioRecorderPlayer from 'react-native-audio-recorder-player';

// Shared state for all AudioRecorderPlayer instances
let sharedPlayerInstance: AudioRecorderPlayer | null = null;
let creationPromise: Promise<AudioRecorderPlayer | null> | null = null;
let playerCreationFailed = false;
const MAX_RETRIES = 20;
const INITIAL_DELAY = 100;
let retryCount = 0;

/**
 * Get existing player instance (synchronous, returns null if not ready)
 */
export function getAudioRecorderPlayer(): AudioRecorderPlayer | null {
  return sharedPlayerInstance;
}

/**
 * Create or get AudioRecorderPlayer instance with retry logic
 * Returns a Promise that resolves when the player is ready
 */
export function createAudioRecorderPlayer(): Promise<AudioRecorderPlayer | null> {
  // If already created, return it immediately
  if (sharedPlayerInstance) {
    return Promise.resolve(sharedPlayerInstance);
  }

  // If creation previously failed, don't retry
  if (playerCreationFailed) {
    console.warn('[AudioRecorderPlayerManager] Player creation previously failed, not retrying');
    return Promise.resolve(null);
  }

  // If currently creating, return the existing promise (all callers wait on same attempt)
  if (creationPromise) {
    return creationPromise;
  }

  // Check retry count
  if (retryCount >= MAX_RETRIES) {
    console.error('[AudioRecorderPlayerManager] Max retries reached, giving up');
    playerCreationFailed = true;
    return Promise.resolve(null);
  }

  // Start a new creation attempt
  retryCount++;
  const currentRetry = retryCount;

  creationPromise = new Promise((resolve) => {
    // Add initial delay for first attempt to let runtime initialize
    const initialDelay = currentRetry === 1 ? INITIAL_DELAY : 0;

    setTimeout(() => {
      // Try to create the instance - wrap in try-catch
      // Even accessing AudioRecorderPlayer can throw if module isn't ready
      try {
        sharedPlayerInstance = new AudioRecorderPlayer();
        retryCount = 0; // Reset on success
        creationPromise = null; // Clear promise so next call can create new instance if needed
        console.log('[AudioRecorderPlayerManager] AudioRecorderPlayer created successfully');
        resolve(sharedPlayerInstance);
        return;
      } catch (error) {
        // Log the actual error for debugging
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.log(
          `[AudioRecorderPlayerManager] Constructor not ready (attempt ${currentRetry}/${MAX_RETRIES}): ${errorMessage}`,
        );
        if (errorStack && currentRetry === 1) {
          console.log(`[AudioRecorderPlayerManager] First attempt error stack: ${errorStack}`);
        }

        // If we've exhausted retries, mark as failed
        if (currentRetry >= MAX_RETRIES) {
          playerCreationFailed = true;
          creationPromise = null;
          console.error(
            `[AudioRecorderPlayerManager] Max retries reached, marking as failed. Last error: ${errorMessage}`,
          );
          resolve(null);
          return;
        }

        // Use exponential backoff for retries
        // First retry after initial delay: 200ms, then 300ms, 450ms, 675ms, etc. (max 3 seconds)
        const delay = Math.min(200 * Math.pow(1.5, currentRetry - 1), 3000);

        setTimeout(() => {
          // Clear the promise so we can retry
          creationPromise = null;
          // Retry creation
          createAudioRecorderPlayer().then(resolve);
        }, delay);
      }
    }, initialDelay);
  });

  return creationPromise;
}

/**
 * Reset the player state (useful for testing or error recovery)
 */
export function resetAudioRecorderPlayer(): void {
  sharedPlayerInstance = null;
  creationPromise = null;
  playerCreationFailed = false;
  retryCount = 0;
}

