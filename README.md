# React Blob Uploader

A self-contained, production-ready React component for file uploads (images, documents, videos, etc.) with drag & drop, reordering, and cloud direct upload support.

## Features

- 🎯 **Framework-agnostic**: No dependency on Redux, Zustand, or any specific state management library
- 🔄 **Drag & Drop**: Reorder uploaded files with intuitive drag-and-drop using `@dnd-kit`
- ☁️ **Direct Cloud Uploads**: Support for S3 presigned URLs and direct-to-cloud uploads
- 🎨 **Tailwind-first Styling**: 14 customizable CSS class slots for complete UI control
- 📦 **Controlled Component**: Parent manages state via `blobs` and `setBlobs` props
- 🔁 **Smart Retry System**: Automatic retry with manual fallback for failed uploads
- 📱 **Responsive**: Works seamlessly on mobile and desktop

## Installation

```bash
# Via npm
npm install react-blob-uploader

# Via pnpm
pnpm add react-blob-uploader

# Via GitHub (for latest development)
pnpm add github:abdulmughniHamzah/react-blob-uploader
```

## Quick Start

```tsx
import { BlobUploader, BlobType, MutationCallbacks } from 'react-blob-uploader';
import { useState } from 'react';

function MyComponent() {
  const [blobs, setBlobs] = useState<BlobType[]>([]);
  const [mainBlobHash, setMainBlobHash] = useState<string | null>(null);

  const mutations: MutationCallbacks = {
    getUploadUrl: async ({ hash, name, mimeType, size }) => {
      // Call your backend to get presigned upload URL
      const response = await fetch('/api/upload-url', {
        method: 'POST',
        body: JSON.stringify({ hash, name, mimeType, size }),
      });
      const data = await response.json();
      return {
        success: true,
        hash,
        uploadUrl: data.uploadUrl,
        key: data.key,
        blobId: data.id,
        previewUrl: data.previewUrl,
        url: data.url,
      };
    },
    directUpload: async ({ hash, uploadUrl, file }) => {
      // Upload directly to S3 or your cloud provider
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      return { success: true, hash };
    },
    createBlob: async ({ hash, key, name, mimeType, size }) => {
      // Create blob record in your database
      const response = await fetch('/api/blobs', {
        method: 'POST',
        body: JSON.stringify({ key, name, mimeType, size }),
      });
      const data = await response.json();
      return {
        success: true,
        hash,
        id: data.id,
        key: data.key,
        url: data.url,
        previewUrl: data.previewUrl,
      };
    },
    createAttachment: async ({ hash, blobId, attachableId, attachableType }) => {
      // Link blob to parent entity (e.g., Product, Offer)
      const response = await fetch('/api/attachments', {
        method: 'POST',
        body: JSON.stringify({ blobId, attachableId, attachableType }),
      });
      const data = await response.json();
      return { success: true, hash, id: data.id };
    },
    deleteAttachment: async ({ hash, attachmentId }) => {
      // Unlink blob from parent entity
      await fetch(`/api/attachments/${attachmentId}`, { method: 'DELETE' });
      return { success: true, hash };
    },
  };

  return (
    <BlobUploader
      instantUpload={true}
      instantSyncAttach={false}
      maxBlobs={10}
      blobs={blobs}
      setBlobs={setBlobs}
      mainBlobHash={mainBlobHash}
      onMainBlobChange={setMainBlobHash}
      attachableId={null}
      attachableType="Product"
      mutations={mutations}
    />
  );
}
```

## Core Concepts

### Blob Lifecycle States

The component manages files through a state machine with the following states:

| State | Description |
|-------|-------------|
| `SELECTED_FOR_UPLOAD` | File selected, awaiting upload initiation |
| `UPLOADING_URL_GENERATING` | Requesting presigned URL from backend |
| `UPLOADING_URL_GENERATED` | URL received, ready to upload |
| `UPLOADING` | Actively uploading to cloud storage |
| `UPLOADED` | Upload complete, ready to create blob record |
| `BLOB_CREATING` | Creating blob record in database |
| `BLOB_CREATED` | Blob record created (final state if no attachment) |
| `ATTACHING` | Creating attachment to parent entity |
| `ATTACHED` | Fully attached (final state) |
| `MARKED_FOR_DETACH` | User requested deletion |
| `DETACHING` | Removing attachment |
| `DETACHED` | Removed (triggers cleanup) |

### Error Handling & Retry System

**One-Step-Back Recovery**: When a mutation fails, the blob:
1. Stays in the **same state** (doesn't advance)
2. Sets an `errorMessage`
3. Decrements `retryCount` (starts at 3)

**Manual Retry Only**: 
- Retry is **NOT automatic** - the user must explicitly click the retry button
- Retry button shows when `errorMessage` exists AND `retryCount > 0`
- When user clicks retry:
  - Error is cleared
  - Retry count is decremented
  - State machine re-runs the failed operation
- When `retryCount` reaches 0, the retry button disappears and user must remove the blob

**Example Flow**:
```
UPLOADING_URL_GENERATED (no error, retryCount: 3)
  ↓ directUpload() fails
UPLOADING_URL_GENERATED (errorMessage set, retryCount: 2)
  ↓ user clicks retry button
UPLOADING_URL_GENERATED (no error, retryCount: 1)
  ↓ directUpload() executes again
  ↓ if fails again
UPLOADING_URL_GENERATED (errorMessage set, retryCount: 0)
  ↓ no retry button (must remove blob)
```

### Upload Modes

Configure upload behavior with two props:

#### `instantUpload: boolean`
- `true`: Start upload immediately when file is selected
- `false`: Wait for explicit trigger (e.g., form submission)

#### `instantSyncAttach: boolean`
- `true`: Create attachment immediately after blob creation
- `false`: Wait for explicit trigger (useful when `attachableId` not yet available)

**Final States by Configuration**:
| instantUpload | instantSyncAttach | Final States | "Set Main" Available |
|--------------|-------------------|--------------|---------------------|
| false | any | SELECTED_FOR_UPLOAD, ATTACHED, DETACHED | SELECTED_FOR_UPLOAD, ATTACHED |
| true | false | BLOB_CREATED, ATTACHED, DETACHED | BLOB_CREATED, ATTACHED |
| true | true | ATTACHED, DETACHED | ATTACHED |

**Note**: The "Set Main" button is only shown for blobs in their final synchronized state (not in transition or error state).

## API Reference

### Props

```typescript
interface LoadedPropsType {
  // Upload behavior
  instantUpload?: boolean;              // Start upload immediately (default: true)
  instantSyncAttach?: boolean;          // Create attachment immediately (default: false)
  maxBlobs?: number;                    // Maximum files allowed (default: 10)
  
  // State management (controlled)
  blobs: BlobType[];                    // Array of blob objects
  setBlobs: (next: BlobType[]) => void; // State setter
  
  // Main blob (featured image)
  mainBlobHash?: string | null;         // Checksum of main blob
  onMainBlobChange?: (checksum: string | null) => void;
  
  // Attachment context
  attachableId: number | null;          // Parent entity ID (e.g., Product ID)
  attachableType?: string;              // Parent entity type (default: 'Offer')
  
  // UI control
  processRunning?: boolean;             // Disable all blob interactions when form is saving (default: false)
                                        // When true: disables upload button, remove button, and set main button
  
  // API callbacks
  mutations: MutationCallbacks;         // Required mutation functions
  
  // Styling
  styling?: StylingProps;               // Custom CSS classes
}
```

### BlobType Interface

```typescript
interface BlobType {
  // Identity
  checksum: string | null;              // SHA-256 hash of file
  name: string | null;                  // Original filename
  
  // Upload data
  uploadUrl: string | null;             // Presigned upload URL
  key: string | null;                   // Storage key/path
  mimeType: string | null;              // File MIME type
  size: number | null;                  // File size in bytes
  
  // URLs
  previewUrl: string | null;            // Preview URL (presigned or public)
  url: string | null;                   // Permanent URL
  
  // Database IDs
  blobId: number | null;                // Blob record ID
  attachmentId: number | null;          // Attachment record ID
  
  // State
  state: BlobState;                     // Current lifecycle state
  errorMessage: string | null;          // Error message if failed
  retryCount: number;                   // Remaining retry attempts (starts at 3)
}
```

### Mutation Callbacks

All mutations return a flat result object with `success` and `hash`:

```typescript
interface MutationCallbacks {
  // Step 1: Get presigned upload URL
  getUploadUrl: (params: {
    hash: string;
    name: string;
    mimeType: string;
    size: number;
  }) => Promise<GetUploadUrlResult>;
  
  // Step 2: Upload file to cloud storage
  directUpload: (params: {
    hash: string;
    uploadUrl: string;
    file: File;
  }) => Promise<DirectUploadResult>;
  
  // Step 3: Create blob record in database
  createBlob: (params: {
    hash: string;
    key: string;
    name: string;
    mimeType: string;
    size: number;
  }) => Promise<CreateBlobResult>;
  
  // Step 4: Link blob to parent entity
  createAttachment: (params: {
    hash: string;
    blobId: number;
    attachableId: number;
    attachableType: string;
  }) => Promise<CreateAttachmentResult>;
  
  // Detach: Remove attachment
  deleteAttachment: (params: {
    hash: string;
    attachmentId: number;
  }) => Promise<DeleteAttachmentResult>;
}

// Result types (all mutations follow this pattern)
type GetUploadUrlResult =
  | { success: true; hash: string; uploadUrl: string | null; key: string; blobId: number | null; previewUrl: string | null; url: string | null; }
  | { success: false; hash: string; error: string; };
```

### Helper Functions

```typescript
// Check if a single blob is transitioning
function isBlobTransitioning(
  blob: BlobType,
  instantUpload: boolean,
  instantSyncAttach: boolean
): boolean;

// Check if any blobs in array are transitioning
function hasTransitioningBlobs(
  blobs: BlobType[],
  instantUpload: boolean,
  instantSyncAttach: boolean
): boolean;
```

**Use case**: Disable form submission while uploads are in progress:

```tsx
import { hasTransitioningBlobs } from 'react-blob-uploader';

const canSave = !hasTransitioningBlobs(blobs, true, false);
```

## Styling

Customize appearance with 14 CSS class slots:

```typescript
interface StylingProps {
  containerClassName?: string;           // Main container
  uploadButtonClassName?: string;        // Upload button
  
  // Blob item
  blobContainerClassName?: string;       // Blob wrapper
  blobImageClassName?: string;           // Image element
  blobContainerFailedClassName?: string; // Failed state overlay
  blobImageFailedClassName?: string;     // Failed state image
  
  // Loading
  loadingContainerClassName?: string;    // Loading overlay
  loadingSpinnerClassName?: string;      // Spinner icon
  
  // Error UI
  errorContainerClassName?: string;      // Error overlay
  errorMessageClassName?: string;        // Error text
  retryButtonClassName?: string;         // Retry button
  
  // Controls
  removeButtonClassName?: string;        // Remove button
  removeButtonIconClassName?: string;    // Remove icon
  setMainButtonClassName?: string;       // "Set Main" button
  mainBlobBadgeClassName?: string;       // "Main" badge
}
```

## Integration Examples

### With Redux Toolkit

```tsx
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setPhotos } from '@/store/slices/product';
import { BlobUploader } from 'react-blob-uploader';

function ProductForm() {
  const dispatch = useAppDispatch();
  const photos = useAppSelector(state => state.product.photos);
  
  return (
    <BlobUploader
      blobs={photos}
      setBlobs={(next) => dispatch(setPhotos(next))}
      // ... other props
    />
  );
}
```

### With TanStack Query

```tsx
import { useMutation } from '@tanstack/react-query';
import axiosClient from '@/lib/axiosClient';

function useImageMutations() {
  const getUploadUrlMutation = useMutation({
    mutationFn: async ({ hash, name, mimeType, size }) => {
      const res = await axiosClient.post('/api/upload-url', { hash, name, mimeType, size });
      return res.data;
    },
  });
  
  return {
    getUploadUrl: async (params) => {
      try {
        const result = await getUploadUrlMutation.mutateAsync(params);
        return { success: true as const, hash: params.hash, ...result };
      } catch (error) {
        return { success: false as const, hash: params.hash, error: error.message };
      }
    },
    // ... other mutations
  };
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build library
pnpm run build

# Development mode (watch)
pnpm run dev

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

## Publishing

The library is versioned via GitHub tags:

```bash
# Bump version and publish
pnpm run release:patch  # 1.0.0 -> 1.0.1
pnpm run release:minor  # 1.0.0 -> 1.1.0
pnpm run release:major  # 1.0.0 -> 2.0.0

# Beta releases
pnpm run release:beta   # 1.0.0 -> 1.0.1-beta.0
```

## License

MIT

## Credits

Built with:
- React 18+
- [@dnd-kit](https://dndkit.com/) for drag & drop
- [lucide-react](https://lucide.dev/) for icons
- TypeScript for type safety
