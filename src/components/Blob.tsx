import { Loader, X } from 'lucide-react';
import { BlobType } from '../types/blob';
import { StylingProps } from '../types/styling';
import { MutationCallbacks } from '../types/mutations';
import { useEffect } from 'react';

/**
 * Unified state setter - makes the component completely framework-agnostic
 * The parent controls how state is stored (Redux, Zustand, useState, etc.)
 *
 * Single function allows updating multiple fields at once, reducing the number of state updates
 */
export interface BlobStateSetters {
  updateBlob: (hash: string, updates: Partial<Omit<BlobType, 'checksum'>>) => void;
}

interface BlobProps {
  instantUpload: boolean;
  instantSyncAttach: boolean;
  blob: BlobType;
  attachableId: number | null;
  attachableType: string;
  file?: File;
  mainBlobHash: string | null;
  setMainBlobHash: (hash: string) => void;
  deleteFromFilesMap: (hash: string) => void;
  removeBlobByHash: (hash: string) => void;
  resetMainBlobHash: () => void;
  mutations: MutationCallbacks;
  stateSetters: BlobStateSetters;
  styling: Required<StylingProps>;
}

const Blob: React.FC<BlobProps> = ({
  instantUpload,
  instantSyncAttach,
  attachableId,
  attachableType,
  file,
  blob,
  mainBlobHash,
  setMainBlobHash,
  deleteFromFilesMap,
  removeBlobByHash,
  resetMainBlobHash,
  mutations,
  stateSetters,
  styling,
}) => {
  const handleRemoveBlob = () => {
    if (blob.state === 'ATTACHED') {
      if (instantUpload) {
        // If syncing, mark for detach to initiate the sync process
        stateSetters.updateBlob(blob.checksum!, { state: 'MARKED_FOR_DETACH' });
      } else {
        // If not syncing, just mark it DETACHED to remove the blob from the UI
        stateSetters.updateBlob(blob.checksum!, { state: 'DETACHED' });
      }
    } else {
      stateSetters.updateBlob(blob.checksum!, { state: 'DETACHED' });
    }
  };

  const handleRetry = () => {
    if (!blob.checksum) return;

    // Map failed states to their retry states
    switch (blob.state) {
      case 'UPLOADING_URL_GENERATION_FAILED':
        stateSetters.updateBlob(blob.checksum, { state: 'SELECTED_FOR_UPLOAD' });
        break;
      case 'UPLOAD_FAILED':
        stateSetters.updateBlob(blob.checksum, { state: 'UPLOADING_URL_GENERATED' });
        break;
      case 'BLOB_CREATION_FAILED':
        stateSetters.updateBlob(blob.checksum, { state: 'UPLOADED' });
        break;
      case 'ATTACHMENT_FAILED':
        stateSetters.updateBlob(blob.checksum, { state: 'BLOB_CREATED' });
        break;
      case 'DETACHMENT_FAILED':
        stateSetters.updateBlob(blob.checksum, { state: 'MARKED_FOR_DETACH' });
        break;
    }
  };

  const unlinkBlob = () => {
    deleteFromFilesMap(blob.checksum!);
    removeBlobByHash(blob.checksum!);
    if (mainBlobHash === blob.checksum) {
      resetMainBlobHash();
    }
  };

  // Blob lifecycle state machine with local state control
  // Component is now completely agnostic - it just orchestrates and calls individual setters
  useEffect(() => {
    const handleStateTransition = async () => {
      if (!blob.checksum) return;
      
      const hash = blob.checksum;
      
      switch (blob.state) {
        case 'SELECTED_FOR_UPLOAD':
          // Only start upload if instantUpload is true
          if (instantUpload && blob.name && blob.mimeType && blob.size) {
            stateSetters.updateBlob(hash, { state: 'UPLOADING_URL_GENERATING' });

            const result = await mutations.getUploadUrl({
              hash,
              name: blob.name,
              mimeType: blob.mimeType,
              size: blob.size,
            });
            if (result.success) {
              if(result.uploadUrl){
                stateSetters.updateBlob(hash, {
                  uploadUrl: result.uploadUrl,
                  key: result.key,
                  errorMessage: null,
                  state: 'UPLOADING_URL_GENERATED',
                });
              } else if(result.blobId && result.key){
                stateSetters.updateBlob(hash, {
                  blobId: result.blobId,
                  key: result.key,
                  previewUrl: result.previewUrl || blob.previewUrl,
                  url: result.url,
                  errorMessage: null,
                  state: 'BLOB_CREATED',
                });
              } else {
                stateSetters.updateBlob(hash, {
                  previewUrl: result.previewUrl || blob.previewUrl,
                  errorMessage: null,
                  state: 'UPLOADED',
                });
              }
            } else {
              stateSetters.updateBlob(hash, {
                errorMessage: result.error,
                state: 'UPLOADING_URL_GENERATION_FAILED',
              });
            }
          }
          break;

        case 'UPLOADING_URL_GENERATED':
          if (file && blob.uploadUrl) {
            stateSetters.updateBlob(hash, { state: 'UPLOADING' });

            const result = await mutations.directUpload({
              hash,
              uploadUrl: blob.uploadUrl,
              file,
            });

            if (result.success) {
              stateSetters.updateBlob(hash, {
                errorMessage: null,
                state: 'UPLOADED',
              });
            } else {
              stateSetters.updateBlob(hash, {
                errorMessage: result.error,
                state: 'UPLOAD_FAILED',
              });
            }
          }
          break;

        case 'UPLOADED':
          if (blob.key && blob.name && blob.mimeType && blob.size) {
            stateSetters.updateBlob(hash, { state: 'BLOB_CREATING' });

            const result = await mutations.createBlob({
              hash,
              key: blob.key,
              name: blob.name,
              mimeType: blob.mimeType,
              size: blob.size,
            });

            if (result.success) {
              stateSetters.updateBlob(hash, {
                blobId: result.id,
                key: result.key,
                previewUrl: result.previewUrl || blob.previewUrl,
                url: result.url,
                errorMessage: null,
                state: 'BLOB_CREATED',
              });
            } else {
              stateSetters.updateBlob(hash, {
                errorMessage: result.error,
                state: 'BLOB_CREATION_FAILED',
              });
            }
          }
          break;

        case 'BLOB_CREATED':
          // Only create attachment when instantSyncAttach is true and we have required data
          if (instantSyncAttach && attachableId && blob.blobId && !blob.errorMessage) {
            stateSetters.updateBlob(hash, { state: 'ATTACHING' });

            const result = await mutations.createAttachment({
              hash,
              blobId: blob.blobId,
              attachableId,
              attachableType,
            });

            if (result.success) {
              stateSetters.updateBlob(hash, {
                attachmentId: result.id,
                errorMessage: null,
                state: 'ATTACHED',
              });
            } else {
              stateSetters.updateBlob(hash, {
                errorMessage: result.error,
                state: 'ATTACHMENT_FAILED',
              });
            }
          }
          break;

        case 'ATTACHED':
          // Preview URL is already set from createBlob response
          // This case is mainly for rendering the completed state
          break;

        case 'DETACHED':
          unlinkBlob();
          break;

        case 'MARKED_FOR_DETACH':
          if (instantUpload && blob.attachmentId) {
            stateSetters.updateBlob(hash, { state: 'DETACHING' });
            try {
              await mutations.deleteAttachment({
                hash,
                attachmentId: blob.attachmentId,
              });
              stateSetters.updateBlob(hash, {
                errorMessage: null,
                state: 'DETACHED',
              });
            } catch (error) {
              const message =
                error instanceof Error ? error.message : 'Failed to detach blob';
              stateSetters.updateBlob(hash, {
                errorMessage: message,
                state: 'DETACHMENT_FAILED',
              });
            }
          }
          break;

        default:
          break;
      }
    };
    console.log('====>blob:', blob);
    handleStateTransition();
  }, [
    file,
    attachableId,
    attachableType,
    instantUpload,
    instantSyncAttach,
    blob.state,
    blob.checksum,
    blob.errorMessage,
    stateSetters,
    mutations,
  ]);

  // Don't render blobs that are being detached or detached
  if (
    (!instantUpload && blob.state === 'DETACHING') ||
    ['DETACHED', 'MARKED_FOR_DETACH'].includes(blob.state ?? '')
  ) {
    return null;
  }

  // Check if blob is in a failed state
  const isInFailedState = [
    'UPLOADING_URL_GENERATION_FAILED',
    'UPLOAD_FAILED',
    'BLOB_CREATION_FAILED',
    'ATTACHMENT_FAILED',
    'DETACHMENT_FAILED',
  ].includes(blob.state ?? '');

  return (
    <div 
      className={`${styling.blobContainerClassName} ${isInFailedState ? styling.blobContainerFailedClassName : ''}`}
      title={blob.name ?? ''}
    >
      <img
        src={blob.previewUrl!}
        alt={`${blob.name}`}
        className={`${styling.blobImageClassName} ${isInFailedState ? styling.blobImageFailedClassName : ''}`}
      />

      {/* Loading spinner - shows when blob is in progress (but not in failed state) */}
      {!isInFailedState &&
        blob.state !== 'ATTACHED' &&
        instantUpload &&
        (blob.state !== 'BLOB_CREATED' || attachableId) && (
          <div className={styling.loadingContainerClassName}>
            <Loader className={styling.loadingSpinnerClassName} />
          </div>
        )}

      {/* Error message with retry button */}
      {blob.errorMessage && (
        <div className={styling.errorContainerClassName}>
          <div className={styling.errorMessageClassName}>{blob.errorMessage}</div>
          {isInFailedState && (
            <button
              type='button'
              onClick={handleRetry}
              className={styling.retryButtonClassName}
              title="Retry upload"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Remove button */}
      <button
        type='button'
        onClick={handleRemoveBlob}
        className={styling.removeButtonClassName}
        title='Remove blob'
      >
        <X className={styling.removeButtonIconClassName} />
      </button>

      {/* Main blob badge */}
      {mainBlobHash === blob.checksum && (
        <div className={styling.mainBlobBadgeClassName}>
          Main
        </div>
      )}

      {/* Set as main blob button */}
      {mainBlobHash !== blob.checksum && blob.state === 'ATTACHED' && (
        <button
          type='button'
          onClick={() => setMainBlobHash(blob.checksum!)}
          className={styling.setMainButtonClassName}
          title='Set as main blob'
        >
          Set Main
        </button>
      )}
    </div>
  );
};

export default Blob;

