/**
 * React Image Uploader V2 - Complete Usage Example
 * 
 * This example shows how to use the self-contained v2 API
 * with clean mutation callbacks and local state management
 */

import React, { useState } from 'react';
import ImageUploader, {
  type PhotoType,
  type MutationCallbacks,
  type StylingProps,
} from 'react-image-uploader';
import axiosClient from './axiosClient';  // Your axios instance

// ===== BASIC USAGE =====

export const BasicUsage = () => {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [mainPhotoHash, setMainPhotoHash] = useState<string | null>(null);
  const [syncPhotos, setSyncPhotos] = useState(false);
  const entityId = 123; // Your entity ID (e.g., Offer ID)

  // Define mutation callbacks - just pure API calls!
  const mutations: MutationCallbacks = {
    getUploadUrl: async ({ checksum, name, mimeType, size }) => {
      const response = await axiosClient.post('/api/blobs/upload-url', {
        checksum,
        name,
        mimeType,
        size,
      });
      return {
        uploadUrl: response.data.data.uploadUrl,
        key: response.data.data.key,
      };
    },

    directUpload: async (uploadUrl, file) => {
      await axiosClient.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });
    },

    createBlob: async ({ key, checksum, name, mimeType, size }) => {
      const response = await axiosClient.post('/api/blobs', {
        key,
        checksum,
        name,
        mimeType,
        size,
      });
      return {
        id: response.data.data.id,
        key: response.data.data.key,
        url: response.data.data.url,
      };
    },

    createAttachment: async ({ blobId, attachableId, attachableType }) => {
      const response = await axiosClient.post('/api/attachments', {
        blobId,
        attachableId,
        attachableType,
      });
      return {
        id: response.data.data.id,
      };
    },

    deleteAttachment: async (attachmentId) => {
      await axiosClient.delete(`/api/attachments/${attachmentId}`);
    },

    getPreviewUrl: async (key) => {
      const response = await axiosClient.get(`/api/blobs/${key}/preview`);
      return {
        previewUrl: response.data.data.previewUrl,
      };
    },
  };

  // Handle form submission
  const handleSubmit = () => {
    // Check if all photos are synced
    const allSynced = photos.every(
      (photo) =>
        photo.state === 'ATTACHED' ||
        (photo.state === 'BLOB_CREATED' && !syncPhotos)
    );

    if (!allSynced) {
      // Trigger sync
      setSyncPhotos(true);
      return;
    }

    // Submit form data
    const formData = {
      photos: photos.map((p) => ({
        blobId: p.blobId,
        checksum: p.checksum,
        attachmentId: p.attachmentId,
      })),
      mainPhotoHash,
      // ... other form fields
    };
    console.log('Submitting:', formData);
  };

  return (
    <div>
      <h2>Product Images</h2>
      
      <ImageUploader
        initialPhotos={photos}
        onPhotosChange={setPhotos}
        mainPhotoHash={mainPhotoHash}
        onMainPhotoChange={setMainPhotoHash}
        syncPhotos={syncPhotos}
        attachableId={entityId}
        attachableType="Offer"
        mutations={mutations}
        maxPhotos={10}
      />

      <button onClick={handleSubmit}>
        Save Changes
      </button>
    </div>
  );
};

// ===== WITH CUSTOM STYLING =====

export const CustomStyling = () => {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [mainPhotoHash, setMainPhotoHash] = useState<string | null>(null);
  
  const customStyling: StylingProps = {
    containerClassName: 'grid grid-cols-2 md:grid-cols-4 gap-4 p-4',
    uploadButtonClassName: `
      bg-gradient-to-r from-blue-500 to-purple-600
      hover:from-blue-600 hover:to-purple-700
      text-white font-semibold
      rounded-lg shadow-lg
      transition-all duration-300
      flex items-center justify-center
      cursor-pointer
    `,
    photoContainerClassName: 'rounded-xl overflow-hidden shadow-lg border-2 border-gray-200',
    removeButtonClassName: 'bg-red-500 hover:bg-red-600 shadow-lg',
    mainPhotoBadgeClassName: 'bg-green-500 text-white font-bold',
  };

  const mutations: MutationCallbacks = {
    // ... same as above
  } as MutationCallbacks;

  return (
    <ImageUploader
      initialPhotos={photos}
      onPhotosChange={setPhotos}
      mainPhotoHash={mainPhotoHash}
      onMainPhotoChange={setMainPhotoHash}
      syncPhotos={true}
      attachableId={123}
      mutations={mutations}
      styling={customStyling}
    />
  );
};

// ===== EDIT MODE (Loading Existing Photos) =====

export const EditMode = () => {
  // Load existing photos from API
  const existingPhotos: PhotoType[] = [
    {
      checksum: 'abc123',
      name: 'product-1.jpg',
      mimeType: 'image/jpeg',
      size: 524288,
      key: 'products/123/abc123.jpg',
      uploadUrl: null,
      previewUrl: 'https://example.com/preview/abc123',
      blobId: 1,
      attachmentId: 10,
      state: 'ATTACHED',
      errorMessage: null,
    },
    // ... more photos
  ];

  const [photos, setPhotos] = useState<PhotoType[]>(existingPhotos);
  const [mainPhotoHash, setMainPhotoHash] = useState('abc123');
  const [syncPhotos, setSyncPhotos] = useState(false);

  const mutations: MutationCallbacks = {
    // ... same as above
  } as MutationCallbacks;

  return (
    <ImageUploader
      initialPhotos={photos}
      onPhotosChange={setPhotos}
      mainPhotoHash={mainPhotoHash}
      onMainPhotoChange={setMainPhotoHash}
      syncPhotos={syncPhotos}
      attachableId={123}
      mutations={mutations}
    />
  );
};

// ===== DEFERRED SYNC PATTERN =====

export const DeferredSync = () => {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [mainPhotoHash, setMainPhotoHash] = useState<string | null>(null);
  const [syncPhotos, setSyncPhotos] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mutations: MutationCallbacks = {
    // ... same as above
  } as MutationCallbacks;

  // Check if sync is complete
  const isSyncComplete = photos.every(
    (photo) =>
      photo.state === 'ATTACHED' ||
      (photo.state === 'BLOB_CREATED' && !syncPhotos)
  );

  // Check if any photos are in progress
  const hasPendingPhotos = photos.some(
    (photo) => !['ATTACHED', 'BLOB_CREATED', 'DETACHED'].includes(photo.state || '')
  );

  const handleSave = () => {
    if (!isSyncComplete || hasPendingPhotos) {
      // Start sync
      setSyncPhotos(true);
      return;
    }

    // All photos synced, proceed with save
    setIsSaving(true);
    // ... API call to save entity
  };

  return (
    <div>
      <ImageUploader
        initialPhotos={photos}
        onPhotosChange={setPhotos}
        mainPhotoHash={mainPhotoHash}
        onMainPhotoChange={setMainPhotoHash}
        syncPhotos={syncPhotos}
        attachableId={123}
        mutations={mutations}
        processRunning={isSaving}
      />

      <button
        onClick={handleSave}
        disabled={isSaving || hasPendingPhotos}
      >
        {hasPendingPhotos
          ? 'Processing photos...'
          : isSaving
          ? 'Saving...'
          : 'Save'}
      </button>

      {/* Sync status indicator */}
      <div>
        {syncPhotos && !isSyncComplete && (
          <p>Syncing photos... {photos.filter(p => p.state === 'ATTACHED').length} / {photos.length}</p>
        )}
      </div>
    </div>
  );
};

// ===== WITH ERROR HANDLING =====

export const WithErrorHandling = () => {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [mainPhotoHash, setMainPhotoHash] = useState<string | null>(null);
  const [syncPhotos, setSyncPhotos] = useState(false);

  // Check for any photo errors
  const photoErrors = photos.filter((p) => p.errorMessage);

  const mutations: MutationCallbacks = {
    getUploadUrl: async (params) => {
      try {
        const response = await axiosClient.post('/api/blobs/upload-url', params);
        return response.data.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to get upload URL');
      }
    },
    // ... other mutations with error handling
  } as MutationCallbacks;

  const retryFailedPhotos = () => {
    // Clear error messages to allow retry
    setPhotos((prev) =>
      prev.map((p) =>
        p.errorMessage
          ? { ...p, errorMessage: null, state: 'SELECTED_FOR_UPLOAD' }
          : p
      )
    );
    setSyncPhotos(true);
  };

  return (
    <div>
      <ImageUploader
        initialPhotos={photos}
        onPhotosChange={setPhotos}
        mainPhotoHash={mainPhotoHash}
        onMainPhotoChange={setMainPhotoHash}
        syncPhotos={syncPhotos}
        attachableId={123}
        mutations={mutations}
      />

      {/* Error display */}
      {photoErrors.length > 0 && (
        <div className="bg-red-100 p-4 rounded">
          <h4>Photo Upload Errors:</h4>
          {photoErrors.map((photo) => (
            <p key={photo.checksum}>
              {photo.name}: {photo.errorMessage}
            </p>
          ))}
          <button onClick={retryFailedPhotos}>
            Retry Failed Uploads
          </button>
        </div>
      )}
    </div>
  );
};

