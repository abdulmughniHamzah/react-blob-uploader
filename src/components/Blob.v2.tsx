import { Loader, X } from 'lucide-react';
import { BlobType } from '../types/blob';
import { StylingProps } from '../types/styling';
import { MutationCallbacks } from '../types/mutations';
import { useEffect } from 'react';

/**
 * Individual state setters - makes the component completely framework-agnostic
 * The parent controls how state is stored (Redux, Zustand, useState, etc.)
 */
export interface BlobStateSetters {
  setBlobState: (hash: string, state: BlobType['state']) => void;
  setBlobUploadUrl: (hash: string, uploadUrl: string) => void;
  setBlobKey: (hash: string, key: string) => void;
  setBlobId: (hash: string, blobId: number) => void;
  setBlobPreviewUrl: (hash: string, previewUrl: string) => void;
  setBlobAttachmentId: (hash: string, attachmentId: number) => void;
  setBlobErrorMessage: (hash: string, errorMessage: string | null) => void;
}

interface BlobProps {
  isImmediateSyncMode: boolean;
  blob: BlobType;
  attachableId: number | null;
  attachableType: string;
  file?: File;
  mainBlobHash: string | null;
  setMainBlobHash: (hash: string) => void;
  deleteFromFilesMap: (hash: string) => void;
  removeBlobByHash: (hash: string) => void;
  resetMainBlobHash: () => void;
  syncBlobs: boolean;
  mutations: MutationCallbacks;
  stateSetters: BlobStateSetters;
  styling: Required<StylingProps>;
}

const Blob: React.FC<BlobProps> = ({
  isImmediateSyncMode,
  attachableId,
  attachableType,
  file,
  photo,
  mainPhotoHash,
  setMainPhotoHash,
  deleteFromFilesMap,
  removePhotoByHash,
  resetMainPhotoHash,
  syncPhotos,
  mutations,
  stateSetters,
  styling,
}) => {
  const handleRemovePhoto = () => {
    if (photo.state === 'ATTACHED') {
      if (syncPhotos) {
        // If syncing, mark for detach to initiate the sync process
        stateSetters.setPhotoState(photo.checksum!, 'MARKED_FOR_DETACH');
      } else {
        // If not syncing, just mark it DETACHED to remove the photo from the UI
        stateSetters.setPhotoState(photo.checksum!, 'DETACHED');
      }
    } else {
      stateSetters.setPhotoState(photo.checksum!, 'DETACHED');
    }
  };

  const unlinkPhoto = () => {
    deleteFromFilesMap(photo.checksum!);
    removePhotoByHash(photo.checksum!);
    if (mainPhotoHash === photo.checksum) {
      resetMainPhotoHash();
    }
  };

  // Photo lifecycle state machine with local state control
  // Component is now completely agnostic - it just orchestrates and calls individual setters
  useEffect(() => {
    const handleStateTransition = async () => {
      if (!photo.checksum) return;
      
      const hash = photo.checksum;
      
      switch (photo.state) {
        case 'SELECTED_FOR_UPLOAD':
          // Only start upload if syncPhotos is true
          if (syncPhotos && photo.name && photo.mimeType && photo.size) {
            stateSetters.setPhotoState(hash, 'UPLOADING_URL_GENERATING');
            
            const result = await mutations.getUploadUrl({
              checksum: hash,
              name: photo.name,
              mimeType: photo.mimeType,
              size: photo.size,
            });
            
            if (result.success) {
              stateSetters.setPhotoUploadUrl(hash, result.data.uploadUrl);
              stateSetters.setPhotoKey(hash, result.data.key);
              stateSetters.setBlobErrorMessage(hash, null);
              stateSetters.setPhotoState(hash, 'UPLOADING_URL_GENERATED');
            } else {
              stateSetters.setBlobErrorMessage(hash, result.error);
              stateSetters.setPhotoState(hash, 'SELECTED_FOR_UPLOAD');
            }
          }
          break;

        case 'UPLOADING_URL_GENERATED':
          if (file && photo.uploadUrl) {
            stateSetters.setPhotoState(hash, 'UPLOADING');
            
            const result = await mutations.directUpload(photo.uploadUrl, file);
            
            if (result.success) {
              stateSetters.setBlobErrorMessage(hash, null);
              stateSetters.setPhotoState(hash, 'UPLOADED');
            } else {
              stateSetters.setBlobErrorMessage(hash, result.error);
              stateSetters.setPhotoState(hash, 'UPLOADING_URL_GENERATED');
            }
          }
          break;

        case 'UPLOADED':
          if (photo.key && photo.name && photo.mimeType && photo.size) {
            stateSetters.setPhotoState(hash, 'BLOB_CREATING');
            
            const result = await mutations.createBlob({
              key: photo.key,
              checksum: hash,
              name: photo.name,
              mimeType: photo.mimeType,
              size: photo.size,
            });
            
            if (result.success) {
              stateSetters.setPhotoBlobId(hash, result.data.id);
              stateSetters.setPhotoKey(hash, result.data.key);
              stateSetters.setPhotoPreviewUrl(hash, result.data.url);
              stateSetters.setBlobErrorMessage(hash, null);
              stateSetters.setPhotoState(hash, 'BLOB_CREATED');
            } else {
              stateSetters.setBlobErrorMessage(hash, result.error);
              stateSetters.setPhotoState(hash, 'UPLOADED');
            }
          }
          break;

        case 'BLOB_CREATED':
          // Only create attachment when isImmediateSyncMode is true and we have required data
          if (isImmediateSyncMode && attachableId && photo.blobId && !photo.errorMessage) {
            stateSetters.setPhotoState(hash, 'ATTACHING');
            
            const result = await mutations.createAttachment({
              blobId: photo.blobId,
              attachableId,
              attachableType,
            });
            
            if (result.success) {
              stateSetters.setPhotoAttachmentId(hash, result.data.id);
              stateSetters.setBlobErrorMessage(hash, null);
              stateSetters.setPhotoState(hash, 'ATTACHED');
            } else {
              stateSetters.setBlobErrorMessage(hash, result.error);
              stateSetters.setPhotoState(hash, 'BLOB_CREATED');
            }
          }
          break;

        case 'ATTACHED':
          // Preview URL is already set from createBlob response
          // This case is mainly for rendering the completed state
          break;

        case 'DETACHED':
          unlinkPhoto();
          break;

        case 'MARKED_FOR_DETACH':
          if (syncPhotos && photo.attachmentId) {
            stateSetters.setPhotoState(hash, 'DETACHING');
            
            const result = await mutations.deleteAttachment(photo.attachmentId);
            
            if (result.success) {
              stateSetters.setBlobErrorMessage(hash, null);
              stateSetters.setPhotoState(hash, 'DETACHED');
            } else {
              stateSetters.setBlobErrorMessage(hash, result.error);
              stateSetters.setPhotoState(hash, 'MARKED_FOR_DETACH');
            }
          }
          break;

        default:
          break;
      }
    };

    handleStateTransition();
  }, [
    file,
    attachableId,
    attachableType,
    syncPhotos,
    isImmediateSyncMode,
    photo.state,
    photo.checksum,
    photo.errorMessage,
    stateSetters,
    mutations,
  ]);

  // Don't render photos that are being detached or detached
  if (
    (!syncPhotos && photo.state === 'DETACHING') ||
    ['DETACHED', 'MARKED_FOR_DETACH'].includes(photo.state ?? '')
  ) {
    return null;
  }

  return (
    <div className={styling.photoContainerClassName} title={photo.name ?? ''}>
      <img
        src={photo.previewUrl!}
        alt={`${photo.name}`}
        className={styling.photoImageClassName}
      />

      {/* Loading spinner - shows when photo is in progress */}
      {photo.state !== 'ATTACHED' &&
        syncPhotos &&
        (photo.state !== 'BLOB_CREATED' || attachableId) && (
          <div className={styling.loadingClassName}>
            <Loader className='text-white animate-spin w-8 h-8' />
          </div>
        )}

      {/* Error message */}
      {photo.errorMessage && (
        <div className={styling.errorClassName}>
          {photo.errorMessage}
        </div>
      )}

      {/* Remove button */}
      <button
        type='button'
        onClick={handleRemovePhoto}
        className={styling.removeButtonClassName}
        title='Remove photo'
      >
        <X className='w-4 h-4' />
      </button>

      {/* Main photo badge */}
      {mainPhotoHash === photo.checksum && (
        <div className={styling.mainPhotoBadgeClassName}>
          Main
        </div>
      )}

      {/* Set as main photo button */}
      {mainPhotoHash !== photo.checksum && photo.state === 'ATTACHED' && (
        <button
          type='button'
          onClick={() => setMainPhotoHash(photo.checksum!)}
          className={`
            absolute bottom-1 left-1
            px-2 py-0.5
            text-xs font-medium
            bg-white bg-opacity-80 hover:bg-opacity-100
            text-gray-700
            rounded
            cursor-pointer
            transition-all
            z-10
          `.replace(/\s+/g, ' ').trim()}
          title='Set as main photo'
        >
          Set Main
        </button>
      )}
    </div>
  );
};

export default Blob;

