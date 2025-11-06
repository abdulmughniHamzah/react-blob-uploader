import { Loader, X } from 'lucide-react';
import { PhotoType } from '../types/photo';
import { StylingProps } from '../types/styling';
import { useEffect } from 'react';

interface PhotoProps {
  isImmediateSyncMode: boolean;
  photo: PhotoType;
  attachableId: number | null;
  file?: File;
  mainPhotoHash: string | null;
  setMainPhotoHash: (hash: string) => void;
  deleteFromFilesMap: (hash: string) => void;
  getUploadUrl: (hash: string) => void;
  getPreviewUrl: (hash: string) => void;
  directUpload: (hash: string, file: File) => void;
  createBlob: (hash: string) => void;
  createAttachment: (hash: string, attachableId: number) => void;
  removePhotoByHash: (hash: string) => void;
  deleteAttachment: (hash: string) => void;
  resetMainPhotoHash: () => void;
  setPhotoState: (hash: string, state: PhotoType['state']) => void;
  syncPhotos: boolean;
  styling: Required<StylingProps>;
}

const Photo: React.FC<PhotoProps> = ({
  isImmediateSyncMode,
  attachableId,
  file,
  photo,
  mainPhotoHash,
  setMainPhotoHash,
  deleteFromFilesMap,
  getUploadUrl,
  getPreviewUrl,
  directUpload,
  createBlob,
  createAttachment,
  removePhotoByHash,
  deleteAttachment,
  resetMainPhotoHash,
  setPhotoState,
  syncPhotos,
  styling,
}) => {
  const handleRemovePhoto = () => {
    if (photo.state === 'ATTACHED') {
      if (syncPhotos) {
        // If syncing, mark for detach to initiate the sync process
        setPhotoState(photo.checksum!, 'MARKED_FOR_DETACH');
      } else {
        // If not syncing, just mark it DETACHED to remove the photo from the UI
        setPhotoState(photo.checksum!, 'DETACHED');
      }
    } else {
      setPhotoState(photo.checksum!, 'DETACHED');
    }
  };

  const unlinkPhoto = () => {
    deleteFromFilesMap(photo.checksum!);
    removePhotoByHash(photo.checksum!);
    if (mainPhotoHash === photo.checksum) {
      resetMainPhotoHash();
    }
  };

  // Photo lifecycle state machine
  useEffect(() => {
    switch (photo.state) {
      case 'SELECTED_FOR_UPLOAD':
        // Only start upload if syncPhotos is true
        if (syncPhotos) getUploadUrl(photo.checksum!);
        break;

      case 'UPLOADING_URL_GENERATED':
        if (file) directUpload(photo.checksum!, file);
        break;

      case 'UPLOADED':
        if (photo.key && photo.name) createBlob(photo.checksum!);
        break;

      case 'BLOB_CREATED':
        // KEY CHANGE: Only create attachment when syncPhotos is true
        // This allows stopping at BLOB_CREATED when syncPhotos is false
        // Parent can check: all photos are either ATTACHED or (BLOB_CREATED && !syncPhotos)
        if (syncPhotos && attachableId && photo.blobId && !photo.errorMessage) {
          createAttachment(photo.checksum!, attachableId);
        }
        break;

      case 'ATTACHED':
        if (!photo.previewUrl) getPreviewUrl(photo.checksum!);
        break;

      case 'DETACHED':
        unlinkPhoto();
        break;

      case 'MARKED_FOR_DETACH':
        if (syncPhotos) deleteAttachment(photo.checksum!);
        break;

      default:
        break;
    }
  }, [file, attachableId, syncPhotos, photo.state, photo.previewUrl, photo.errorMessage]);

  // Don't render photos that are being detached or detached
  if (
    (!isImmediateSyncMode && photo.state === 'DETACHING') ||
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

export default Photo;

