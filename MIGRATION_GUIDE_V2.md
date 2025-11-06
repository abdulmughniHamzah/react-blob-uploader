# Migration Guide: V1 → V2

## Overview

Version 2 of `react-image-uploader` introduces a **self-contained architecture** where the component manages its own state internally. This eliminates the need for external state management (Redux, Context) and provides a cleaner, more reusable API.

## Key Changes

### 1. **Self-Contained State Management** ✨
- Component now manages photo states internally
- No more external `dispatch` or Redux actions
- Parent reads final state via `onPhotosChange` callback

### 2. **Mutation Callbacks Pattern** 🔄
- Replace imperative state updates with async API callbacks
- Component handles all state transitions based on mutation results
- Cleaner separation of concerns

### 3. **syncPhotos Behavior** 🎯
- Controls whether to create attachments after blob creation
- `false` = Stop at `BLOB_CREATED` state (manual sync later)
- `true` = Create attachments immediately
- Check sync completion: all photos are either `ATTACHED` or (`BLOB_CREATED` && `!syncPhotos`)

### 4. **Customizable Styling** 🎨
- Add className props for all UI elements
- Override default Tailwind classes
- Full control over appearance

---

## Before (V1) ❌

```typescript
import { useImageUploaderIntegration } from '@/hooks/useImageUploaderIntegration';
import { useAppDispatch, useAppSelector } from '@/hooks';
import ImageUploader from 'react-image-uploader';

const MyForm = () => {
  const dispatch = useAppDispatch();
  const formState = useAppSelector(state => state.myForm);
  
  // 70+ lines of boilerplate integration logic
  const imageUploader = useImageUploaderIntegration({
    photos: formState.photos,
    mainPhotoHash: formState.mainPhotoHash,
    dispatch,
    actions: imageUploaderActions,
  });
  
  return (
    <ImageUploader
      photos={formState.photos}
      mainPhotoHash={formState.mainPhotoHash}
      syncPhotos={syncPhotos}
      attachableId={entityId}
      {...imageUploader.callbacks}  // Spread 15+ callback props
    />
  );
};
```

---

## After (V2) ✅

```typescript
import ImageUploader, { MutationCallbacks } from 'react-image-uploader';
import axiosClient from '@/lib/axiosClient';

const MyForm = () => {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [mainPhotoHash, setMainPhotoHash] = useState<string | null>(null);
  const [syncPhotos, setSyncPhotos] = useState(false);
  
  // Simple mutation callbacks - just API calls!
  const mutations: MutationCallbacks = {
    getUploadUrl: async ({ checksum, name, mimeType, size }) => {
      const res = await axiosClient.post('/blobs/upload-url', {
        checksum, name, mimeType, size
      });
      return res.data.data;
    },
    
    directUpload: async (uploadUrl, file) => {
      await axiosClient.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type }
      });
    },
    
    createBlob: async ({ key, checksum, name, mimeType, size }) => {
      const res = await axiosClient.post('/blobs', {
        key, checksum, name, mimeType, size
      });
      return res.data.data;
    },
    
    createAttachment: async ({ blobId, attachableId, attachableType }) => {
      const res = await axiosClient.post('/attachments', {
        blobId, attachableId, attachableType
      });
      return res.data.data;
    },
    
    deleteAttachment: async (attachmentId) => {
      await axiosClient.delete(`/attachments/${attachmentId}`);
    },
    
    getPreviewUrl: async (key) => {
      const res = await axiosClient.get(`/blobs/${key}/preview`);
      return res.data.data;
    },
  };
  
  return (
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
  );
};
```

---

## Detailed Migration Steps

### Step 1: Remove Redux Integration

**Remove:**
- `useImageUploaderIntegration` hook
- Redux dispatch and selector
- Redux actions (setPhotoState, setPhotoUploadUrl, etc.)

**Add:**
- Local `useState` for photos and mainPhotoHash
- Simple callbacks for state updates

### Step 2: Convert to Mutation Callbacks

**Before:**
```typescript
const getUploadUrlMutation = useGetUploadUrl({
  photos,
  dispatch,
  actions: { setPhotoState, setPhotoUploadUrl, setPhotoKey }
});

const handleGetUploadUrl = (hash: string) => {
  getUploadUrlMutation.mutate({ checksum: hash });
};
```

**After:**
```typescript
const mutations = {
  getUploadUrl: async ({ checksum, name, mimeType, size }) => {
    const res = await axiosClient.post('/upload-url', {
      checksum, name, mimeType, size
    });
    return {
      uploadUrl: res.data.uploadUrl,
      key: res.data.key
    };
  }
};
```

### Step 3: Update syncPhotos Logic

**V2 Behavior:**
- `syncPhotos = false`: Photos stop at `BLOB_CREATED` state
- `syncPhotos = true`: Photos proceed to `ATTACHED` state

**Check if sync is complete:**
```typescript
const allPhotosSynced = photos.every(photo => 
  photo.state === 'ATTACHED' || 
  (photo.state === 'BLOB_CREATED' && !syncPhotos)
);
```

### Step 4: Add Custom Styling (Optional)

```typescript
<ImageUploader
  // ... other props
  styling={{
    containerClassName: 'grid grid-cols-4 gap-4',
    uploadButtonClassName: 'bg-blue-500 hover:bg-blue-600',
    photoContainerClassName: 'rounded-lg shadow-md',
    removeButtonClassName: 'bg-red-500',
  }}
/>
```

---

## Breaking Changes

### Props Removed
- `addPhoto` → Managed internally
- `removePhotoByHash` → Managed internally
- `setPhotoState` → Managed internally
- `setPhotos` → Managed internally
- Individual mutation props (`getUploadUrl`, `directUpload`, etc.) → Use `mutations` object

### Props Added
- `initialPhotos` → Initialize with existing photos
- `onPhotosChange` → Callback when photos change
- `onMainPhotoChange` → Callback when main photo changes
- `mutations` → Object with all API callbacks
- `styling` → Custom CSS classes

### Props Renamed
- `photos` → `initialPhotos`
- `setMainPhotoHash` → `onMainPhotoChange`

---

## Benefits of V2

✅ **70% less boilerplate code**  
✅ **No Redux/Context coupling**  
✅ **Truly reusable across projects**  
✅ **Simpler mental model**  
✅ **Better type safety**  
✅ **Customizable styling**  
✅ **Backward compatible** (V1 still available as `ImageUploaderV1`)

---

## Backward Compatibility

V1 is still available for gradual migration:

```typescript
import { ImageUploaderV1 } from 'react-image-uploader';
import type { LoadedPropsTypeV1 } from 'react-image-uploader';

// Use V1 API as before
<ImageUploaderV1 {...v1Props} />
```

---

## Need Help?

- See `examples/v2-usage.tsx` for complete examples
- Check `README.md` for full API documentation
- Open an issue on GitHub for migration questions

