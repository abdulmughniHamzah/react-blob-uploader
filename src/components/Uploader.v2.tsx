import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { BlobType, PhotoType } from '../types/blob'; // PhotoType is alias for backward compatibility
import { calculateChecksum } from '../utils/checksum';
import SortableBlob from './SortableBlob.v2';
import { LoadedPropsType } from './propsType.v2';
import { mergeStyling } from '../types/styling';

/**
 * Self-contained ImageUploader component with internal state management
 * 
 * ARCHITECTURE:
 * - Manages photo states internally
 * - Parent provides mutation callbacks (API calls)
 * - Parent reads final state via onPhotosChange callback
 * - syncPhotos controls whether to create attachments after blob creation
 */
export const Uploader = ({
  isImmediateSyncMode = false,
  // Support both new and old prop names for backward compatibility
  maxBlobs,
  maxPhotos,
  syncBlobs,
  syncPhotos,
  initialBlobs,
  initialPhotos,
  onBlobsChange,
  onPhotosChange,
  attachableId,
  attachableType = 'Offer',
  processRunning = false,
  mainBlobHash: externalMainBlobHash,
  mainPhotoHash: externalMainPhotoHash_legacy,
  onMainBlobChange,
  onMainPhotoChange,
  mutations,
  stateSetters: externalStateSetters,
  styling: customStyling,
  
  // Legacy props (for backward compatibility)
  photos: legacyPhotos,
  addPhoto: legacyAddPhoto,
  removePhotoByHash: legacyRemovePhotoByHash,
  setMainPhotoHash: legacySetMainPhotoHash,
  getUploadUrl: legacyGetUploadUrl,
  getPreviewUrl: legacyGetPreviewUrl,
  directUpload: legacyDirectUpload,
  createBlob: legacyCreateBlob,
  createAttachment: legacyCreateAttachment,
  deleteAttachment: legacyDeleteAttachment,
  resetMainPhotoHash: legacyResetMainPhotoHash,
  setPhotoState: legacySetPhotoState,
  setPhotos: legacySetPhotos,
}: LoadedPropsType) => {
  // Normalize props (new names take precedence, fall back to old names)
  const maxItems = maxBlobs ?? maxPhotos ?? 10;
  const shouldSyncBlobs = syncBlobs ?? syncPhotos ?? false;
  const initialItems = initialBlobs ?? initialPhotos ?? legacyPhotos ?? [];
  const externalMain = externalMainBlobHash ?? externalMainPhotoHash_legacy ?? null;
  const onItemsChange = onBlobsChange ?? onPhotosChange;
  const onMainChange = onMainBlobChange ?? onMainPhotoChange;
  
  // ===== INTERNAL STATE MANAGEMENT =====
  const [blobs, setBlobs] = useState<BlobType[]>(initialItems);
  const [filesMap, setFilesMap] = useState<Map<string, File>>(new Map());
  const [mainBlobHash, setMainBlobHash] = useState<string | null>(externalMain);

  // Merge styling with defaults
  const styling = useMemo(() => mergeStyling(customStyling), [customStyling]);

  // ===== SYNC WITH PARENT =====
  useEffect(() => {
    onItemsChange?.(blobs);
  }, [blobs, onItemsChange]);

  useEffect(() => {
    onMainChange?.(mainBlobHash);
  }, [mainBlobHash, onMainChange]);

  // ===== BLOB STATE MANAGEMENT =====
  const updateBlobState = useCallback((checksum: string, updates: Partial<BlobType>) => {
    setBlobs(prev => prev.map(p =>
      p.checksum === checksum ? { ...p, ...updates } : p
    ));
  }, []);

  const addBlob = useCallback((blob: BlobType) => {
    setBlobs(prev => [...prev, blob]);
    legacyAddPhoto?.(blob); // Backward compatibility
  }, [legacyAddPhoto]);

  const removeBlobByHash = useCallback((checksum: string) => {
    setBlobs(prev => prev.filter(p => p.checksum !== checksum));
    if (mainBlobHash === checksum) {
      setMainBlobHash(null);
    }
    legacyRemovePhotoByHash?.(checksum); // Backward compatibility
  }, [mainBlobHash, legacyRemovePhotoByHash]);

  // ===== FILE HANDLING =====
  const deleteFromFilesMap = useCallback((checksum: string) => {
    setFilesMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(checksum);
      return newMap;
    });
  }, []);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;
    const files: File[] = Array.from(fileList);
    const validFiles: File[] = files.slice(0, maxItems - blobs.length);

    for (const file of validFiles) {
      const checksum = await calculateChecksum(file);

      if (blobs.some((blob) => blob.checksum === checksum)) {
        continue;
      }

      setFilesMap(prev => {
        const newMap = new Map(prev);
        newMap.set(checksum, file);
        return newMap;
      });

      const newBlob: BlobType = {
        attachmentId: null,
        blobId: null,
        key: null,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        uploadUrl: null,
        mimeType: file.type,
        size: file.size,
        checksum: checksum,
        state: 'SELECTED_FOR_UPLOAD',
        errorMessage: null,
      };
      addBlob(newBlob);
    }
  }, [maxItems, blobs, addBlob]);

  // ===== MUTATION WRAPPERS (Internal state management) =====
  const wrappedGetUploadUrl = useCallback(async (checksum: string) => {
    const photo = photos.find(p => p.checksum === checksum);
    if (!photo) return;

    try {
      updatePhotoState(checksum, { state: 'UPLOADING_URL_GENERATING' });
      
      const result = await mutations.getUploadUrl({
        checksum,
        name: photo.name!,
        mimeType: photo.mimeType!,
        size: photo.size!,
      });

      updatePhotoState(checksum, {
        uploadUrl: result.uploadUrl,
        key: result.key,
        state: 'UPLOADING_URL_GENERATED',
      });
    } catch (error: any) {
      updatePhotoState(checksum, {
        errorMessage: error.message || 'Failed to get upload URL',
        state: 'SELECTED_FOR_UPLOAD',
      });
    }
  }, [photos, mutations, updatePhotoState]);

  const wrappedDirectUpload = useCallback(async (checksum: string, file: File) => {
    const photo = photos.find(p => p.checksum === checksum);
    if (!photo || !photo.uploadUrl) return;

    try {
      updatePhotoState(checksum, { state: 'UPLOADING' });
      
      await mutations.directUpload(photo.uploadUrl, file);

      updatePhotoState(checksum, { state: 'UPLOADED' });
    } catch (error: any) {
      updatePhotoState(checksum, {
        errorMessage: error.message || 'Failed to upload file',
        state: 'UPLOADING_URL_GENERATED',
      });
    }
  }, [photos, mutations, updatePhotoState]);

  const wrappedCreateBlob = useCallback(async (checksum: string) => {
    const photo = photos.find(p => p.checksum === checksum);
    if (!photo || !photo.key) return;

    try {
      updatePhotoState(checksum, { state: 'BLOB_CREATING' });
      
      const result = await mutations.createBlob({
        key: photo.key,
        checksum,
        name: photo.name!,
        mimeType: photo.mimeType!,
        size: photo.size!,
      });

      updatePhotoState(checksum, {
        blobId: result.id,
        state: 'BLOB_CREATED',
      });
    } catch (error: any) {
      updatePhotoState(checksum, {
        errorMessage: error.message || 'Failed to create blob',
        state: 'UPLOADED',
      });
    }
  }, [photos, mutations, updatePhotoState]);

  const wrappedCreateAttachment = useCallback(async (checksum: string, attId: number) => {
    const photo = photos.find(p => p.checksum === checksum);
    if (!photo || !photo.blobId) return;

    try {
      updatePhotoState(checksum, { state: 'ATTACHING' });
      
      const result = await mutations.createAttachment({
        blobId: photo.blobId,
        attachableId: attId,
        attachableType,
      });

      updatePhotoState(checksum, {
        attachmentId: result.id,
        state: 'ATTACHED',
      });
    } catch (error: any) {
      updatePhotoState(checksum, {
        errorMessage: error.message || 'Failed to create attachment',
        state: 'BLOB_CREATED', // Allow retry
      });
    }
  }, [photos, mutations, attachableType, updatePhotoState]);

  const wrappedDeleteAttachment = useCallback(async (checksum: string) => {
    const photo = photos.find(p => p.checksum === checksum);
    if (!photo || !photo.attachmentId) return;

    try {
      updatePhotoState(checksum, { state: 'DETACHING' });
      
      await mutations.deleteAttachment(photo.attachmentId);

      updatePhotoState(checksum, { state: 'DETACHED' });
    } catch (error: any) {
      updatePhotoState(checksum, {
        errorMessage: error.message || 'Failed to delete attachment',
        state: 'ATTACHED',
      });
    }
  }, [photos, mutations, updatePhotoState]);

  const wrappedGetPreviewUrl = useCallback(async (checksum: string) => {
    const photo = photos.find(p => p.checksum === checksum);
    if (!photo || !photo.key) return;

    try {
      const result = await mutations.getPreviewUrl(photo.key);
      updatePhotoState(checksum, { previewUrl: result.previewUrl });
    } catch (error: any) {
      console.error('Failed to get preview URL:', error);
    }
  }, [blobs, mutations, updateBlobState]);

  // ===== STATE SETTERS (Framework-agnostic) =====
  const stateSetters = useMemo(() => ({
    setBlobState: (hash: string, state: BlobType['state']) => {
      updateBlobState(hash, { state });
    },
    setBlobUploadUrl: (hash: string, uploadUrl: string) => {
      updateBlobState(hash, { uploadUrl });
    },
    setBlobKey: (hash: string, key: string) => {
      updateBlobState(hash, { key });
    },
    setBlobId: (hash: string, blobId: number) => {
      updateBlobState(hash, { blobId });
    },
    setBlobPreviewUrl: (hash: string, previewUrl: string) => {
      updateBlobState(hash, { previewUrl });
    },
    setBlobAttachmentId: (hash: string, attachmentId: number) => {
      updateBlobState(hash, { attachmentId });
    },
    setBlobErrorMessage: (hash: string, errorMessage: string | null) => {
      updateBlobState(hash, { errorMessage });
    },
  }), [updateBlobState]);

  // ===== DRAG AND DROP =====
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setBlobs(prev => {
        const oldIndex = prev.findIndex((p) => p.checksum === active.id);
        const newIndex = prev.findIndex((p) => p.checksum === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleSetMainBlobHash = useCallback((checksum: string) => {
    setMainBlobHash(checksum);
    legacySetMainPhotoHash?.(checksum); // Backward compatibility
  }, [legacySetMainPhotoHash]);

  const handleResetMainBlobHash = useCallback(() => {
    setMainBlobHash(null);
    legacyResetMainPhotoHash?.(); // Backward compatibility
  }, [legacyResetMainPhotoHash]);

  // ===== RENDER =====
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blobs.map((blob) => photo.checksum ?? '')}
        strategy={rectSortingStrategy}
      >
        <div className={styling.containerClassName}>
          {blobs.length < maxItems && !processRunning && (
            <label
              title='Upload Image'
              className={styling.uploadButtonClassName}
            >
              <span className='text-center'>Upload</span>
              <input
                type='file'
                accept='image/*'
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFiles(e.target.files);
                    e.target.value = '';
                  }
                }}
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = '';
                }}
                className='hidden'
              />
            </label>
          )}
          {blobs
            .filter((blob) => photo.checksum)
            .map((blob) => (
              <SortableBlob
                key={blob.checksum ?? ''}
                id={blob.checksum ?? ''}
                blob={blob}
                filesMap={filesMap}
                isImmediateSyncMode={isImmediateSyncMode}
                attachableId={attachableId}
                attachableType={attachableType}
                syncBlobs={shouldSyncBlobs}
                mutations={mutations}
                stateSetters={stateSetters}
                styling={styling}
              />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default Uploader;

