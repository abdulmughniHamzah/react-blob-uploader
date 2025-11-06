# React Image Uploader v2.0

**A self-contained, production-ready React component for multi-image uploads with drag & drop, reordering, and cloud direct upload support.**

[![npm version](https://img.shields.io/npm/v/react-image-uploader.svg)](https://www.npmjs.com/package/react-image-uploader)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ What's New in V2

🎯 **Self-Contained State Management** - Component manages its own state internally  
🔄 **Mutation Callbacks Pattern** - Simple API calls instead of Redux coupling  
🎨 **Customizable Styling** - Override default Tailwind classes  
⚡ **70% Less Boilerplate** - Eliminates complex integration hooks  
🔧 **Better Control** - `syncPhotos` flag controls attachment creation  
📦 **Backward Compatible** - V1 API still available

---

## 📦 Installation

```bash
npm install react-image-uploader@latest
```

**Peer Dependencies:**
- React >=18.0.0
- React DOM >=18.0.0

---

## 🚀 Quick Start

```tsx
import { useState } from 'react';
import ImageUploader, { PhotoType, MutationCallbacks } from 'react-image-uploader';
import axiosClient from './axiosClient';

function MyForm() {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [mainPhotoHash, setMainPhotoHash] = useState<string | null>(null);
  const [syncPhotos, setSyncPhotos] = useState(false);

  // Define mutation callbacks - just API calls!
  const mutations: MutationCallbacks = {
    getUploadUrl: async ({ checksum, name, mimeType, size }) => {
      const res = await axiosClient.post('/api/blobs/upload-url', {
        checksum, name, mimeType, size
      });
      return { uploadUrl: res.data.uploadUrl, key: res.data.key };
    },

    directUpload: async (uploadUrl, file) => {
      await axiosClient.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type }
      });
    },

    createBlob: async ({ key, checksum, name, mimeType, size }) => {
      const res = await axiosClient.post('/api/blobs', {
        key, checksum, name, mimeType, size
      });
      return { id: res.data.id, key: res.data.key, url: res.data.url };
    },

    createAttachment: async ({ blobId, attachableId, attachableType }) => {
      const res = await axiosClient.post('/api/attachments', {
        blobId, attachableId, attachableType
      });
      return { id: res.data.id };
    },

    deleteAttachment: async (attachmentId) => {
      await axiosClient.delete(`/api/attachments/${attachmentId}`);
    },

    getPreviewUrl: async (key) => {
      const res = await axiosClient.get(`/api/blobs/${key}/preview`);
      return { previewUrl: res.data.previewUrl };
    },
  };

  const handleSubmit = () => {
    // Check if all photos are synced
    const allSynced = photos.every(p => 
      p.state === 'ATTACHED' || (p.state === 'BLOB_CREATED' && !syncPhotos)
    );

    if (!allSynced) {
      setSyncPhotos(true);  // Trigger sync
      return;
    }

    // Submit form
    console.log('Submitting:', { photos, mainPhotoHash });
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
        attachableType="Offer"
        mutations={mutations}
        maxPhotos={10}
      />
      <button onClick={handleSubmit}>Save</button>
    </div>
  );
}
```

---

## 🎯 Key Features

### 1. Self-Contained State Management

The component manages photo states internally. No external state updates needed!

```tsx
<ImageUploader
  initialPhotos={[]}  // Initial state
  onPhotosChange={setPhotos}  // Read final state
  mutations={mutations}
/>
```

### 2. Mutation Callbacks Pattern

Instead of managing state transitions externally, provide simple API callbacks:

```tsx
const mutations = {
  getUploadUrl: async (params) => {
    const res = await api.post('/upload-url', params);
    return { uploadUrl: res.data.uploadUrl, key: res.data.key };
  },
  // ... other callbacks
};
```

The component handles all state transitions internally based on mutation results.

### 3. syncPhotos Control

Control when attachments are created:

- `syncPhotos = false`: Photos stop at `BLOB_CREATED` state (deferred sync)
- `syncPhotos = true`: Photos proceed to `ATTACHED` state (immediate sync)

```tsx
const [syncPhotos, setSyncPhotos] = useState(false);

const handleSave = () => {
  if (!allPhotosSynced()) {
    setSyncPhotos(true);  // Trigger attachment creation
    return;
  }
  // Submit form
};
```

### 4. Customizable Styling

Override default Tailwind classes:

```tsx
<ImageUploader
  styling={{
    containerClassName: 'grid grid-cols-4 gap-4',
    uploadButtonClassName: 'bg-blue-500 hover:bg-blue-600',
    photoContainerClassName: 'rounded-lg shadow-md',
    removeButtonClassName: 'bg-red-500',
  }}
  {...otherProps}
/>
```

---

## 📖 Complete API Reference

### Props

#### Core Configuration

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `mutations` | `MutationCallbacks` | ✅ Yes | - | API callback functions |
| `attachableId` | `number \| null` | ✅ Yes | - | Entity ID to attach photos to |
| `syncPhotos` | `boolean` | ✅ Yes | - | Controls attachment creation |
| `attachableType` | `string` | No | `'Offer'` | Entity type (e.g., 'Offer', 'Product') |
| `maxPhotos` | `number` | No | `10` | Maximum number of photos allowed |
| `isImmediateSyncMode` | `boolean` | No | `false` | Legacy compatibility flag |
| `processRunning` | `boolean` | No | `false` | Disable interactions during save |

#### State Management

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `initialPhotos` | `PhotoType[]` | No | `[]` | Initial photos (for editing) |
| `onPhotosChange` | `(photos: PhotoType[]) => void` | No | - | Callback when photos change |
| `mainPhotoHash` | `string \| null` | No | `null` | Main photo checksum |
| `onMainPhotoChange` | `(hash: string \| null) => void` | No | - | Callback when main photo changes |

#### Styling

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `styling` | `StylingProps` | No | Default styling | Custom CSS classes |

---

### MutationCallbacks Interface

```typescript
interface MutationCallbacks {
  getUploadUrl: (params: {
    checksum: string;
    name: string;
    mimeType: string;
    size: number;
  }) => Promise<{ uploadUrl: string; key: string }>;

  directUpload: (uploadUrl: string, file: File) => Promise<void>;

  createBlob: (params: {
    key: string;
    checksum: string;
    name: string;
    mimeType: string;
    size: number;
  }) => Promise<{ id: number; key: string; url: string }>;

  createAttachment: (params: {
    blobId: number;
    attachableId: number;
    attachableType: string;
  }) => Promise<{ id: number }>;

  deleteAttachment: (attachmentId: number) => Promise<void>;

  getPreviewUrl: (key: string) => Promise<{ previewUrl: string }>;
}
```

---

### StylingProps Interface

```typescript
interface StylingProps {
  containerClassName?: string;           // Container wrapper
  uploadButtonClassName?: string;        // Upload button
  photoContainerClassName?: string;      // Individual photo container
  photoImageClassName?: string;          // Photo image
  removeButtonClassName?: string;        // Remove button
  mainPhotoBadgeClassName?: string;      // Main photo badge
  loadingClassName?: string;             // Loading spinner container
  errorClassName?: string;               // Error message
}
```

---

### PhotoType Interface

```typescript
interface PhotoType {
  checksum: string | null;
  name: string | null;
  mimeType: string | null;
  size: number | null;
  key: string | null;
  uploadUrl: string | null;
  previewUrl: string | null;
  blobId: number | null;
  attachmentId: number | null;
  errorMessage: string | null;
  state:
    | null
    | 'SELECTED_FOR_UPLOAD'
    | 'UPLOADING_URL_GENERATING'
    | 'UPLOADING_URL_GENERATED'
    | 'UPLOADING'
    | 'UPLOADED'
    | 'BLOB_CREATING'
    | 'BLOB_CREATED'
    | 'ATTACHING'
    | 'ATTACHED'
    | 'MARKED_FOR_DETACH'
    | 'DETACHING'
    | 'DETACHED';
}
```

---

## 🔄 Photo Lifecycle States

```
User selects photo
  ↓
SELECTED_FOR_UPLOAD (waiting for sync)
  ↓ (when syncPhotos = true)
UPLOADING_URL_GENERATING
  ↓
UPLOADING_URL_GENERATED
  ↓
UPLOADING
  ↓
UPLOADED
  ↓
BLOB_CREATING
  ↓
BLOB_CREATED (stops here if syncPhotos = false)
  ↓ (when syncPhotos = true)
ATTACHING
  ↓
ATTACHED (final state)
```

---

## 📚 Usage Examples

See `examples/v2-usage.tsx` for comprehensive examples including:
- Basic usage
- Custom styling
- Edit mode with existing photos
- Deferred sync pattern
- Error handling

---

## 🔄 Migration from V1

See `MIGRATION_GUIDE_V2.md` for complete migration guide.

**Quick Summary:**
1. Replace `useImageUploaderIntegration` with simple mutations
2. Use `initialPhotos` / `onPhotosChange` instead of external state
3. Remove Redux actions for photo state management
4. Update to mutation callbacks pattern

**V1 Still Available:**
```tsx
import { ImageUploaderV1 } from 'react-image-uploader';
```

---

## 🎨 Styling Examples

### Default (Tailwind)
```tsx
<ImageUploader {...props} />
```

### Custom Styling
```tsx
<ImageUploader
  {...props}
  styling={{
    containerClassName: 'grid grid-cols-3 gap-4',
    uploadButtonClassName: 'bg-gradient-to-r from-blue-500 to-purple-600',
    photoContainerClassName: 'rounded-xl shadow-lg',
  }}
/>
```

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

---

## 📄 License

MIT © [Abi]

---

## 🔗 Links

- [GitHub Repository](https://github.com/abdulmughniHamzah/react-image-uploader)
- [npm Package](https://www.npmjs.com/package/react-image-uploader)
- [Migration Guide](./MIGRATION_GUIDE_V2.md)
- [Usage Examples](./examples/v2-usage.tsx)
- [Quick Start Guide](./QUICK_START.md)

---

## 💬 Support

- Open an issue on [GitHub](https://github.com/abdulmughniHamzah/react-image-uploader/issues)
- Check existing issues for solutions
- Read the migration guide for V1 → V2 questions

