import { BlobType } from '../types/blob';

/**
 * Determines if a blob is in a transitioning state (actively processing)
 * A blob is considered transitioning if it's not in a final state and hasn't errored
 * 
 * Final states depend on instantUpload and instantSyncAttach:
 * - If instantUpload is false: SELECTED_FOR_UPLOAD, ATTACHED, DETACHED
 * - If instantUpload is true and instantSyncAttach is false: BLOB_CREATED, ATTACHED, DETACHED
 * - If both are true: ATTACHED, DETACHED
 * 
 * @param blob - The blob to check
 * @param instantUpload - Whether instant upload is enabled
 * @param instantSyncAttach - Whether instant sync attach is enabled
 * @returns true if the blob is actively transitioning
 */
export function isBlobTransitioning(
  blob: BlobType,
  instantUpload: boolean,
  instantSyncAttach: boolean
): boolean {
  // If there's an error, it's not transitioning (it's stuck/failed)
  if (blob.errorMessage) {
    return false;
  }

  const state = blob.state;

  // Null state or Detached is always a final state (not transitioning)
  if (!state || state === 'DETACHED') {
    return false;
  }

  // If instantUpload is false, only SELECTED_FOR_UPLOAD and ATTACHED are final
  if (!instantUpload) {
    return state !== 'SELECTED_FOR_UPLOAD' && state !== 'ATTACHED';
  }

  // If instantUpload is true but instantSyncAttach is false
  // Final states are: BLOB_CREATED, ATTACHED
  if (!instantSyncAttach) {
    return state !== 'BLOB_CREATED' && state !== 'ATTACHED';
  }

  // If both are true, only ATTACHED is final
  return state !== 'ATTACHED';
}

/**
 * Checks if any blobs in an array are currently transitioning
 * 
 * @param blobs - Array of blobs to check
 * @param instantUpload - Whether instant upload is enabled
 * @param instantSyncAttach - Whether instant sync attach is enabled
 * @returns true if any blob is actively transitioning
 */
export function hasTransitioningBlobs(
  blobs: BlobType[],
  instantUpload: boolean,
  instantSyncAttach: boolean
): boolean {
  return blobs.some((blob) => isBlobTransitioning(blob, instantUpload, instantSyncAttach));
}

