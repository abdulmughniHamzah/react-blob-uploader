# Blob Refactoring Summary

## Overview
The component has been generalized from "Photo" to "Blob" to support any file type (images, documents, videos, etc.), not just photos.

## Changes Made

### 1. Core Type Renamed
- **File**: `src/types/blob.ts` (renamed from `photo.ts`)
- **New Type**: `BlobType` - represents any file in upload/attachment lifecycle
- **Backward Compatibility**: `PhotoType` is now an alias: `export type PhotoType = BlobType;`

### 2. Component Files Created
- **`src/components/Blob.v2.tsx`** - Main blob component (handles individual file lifecycle)
- **`src/components/SortableBlob.v2.tsx`** - Drag-and-drop wrapper for blobs

### 3. State Setters Interface
- **New**: `BlobStateSetters` - framework-agnostic state setters
- **Methods**: `setBlobState`, `setBlobUploadUrl`, `setBlobKey`, `setBlobId`, `setBlobPreviewUrl`, `setBlobAttachmentId`, `setBlobErrorMessage`
- **Backward Compatibility**: `PhotoStateSetters` is exported as an alias

### 4. Uploader Component  
- **File**: `src/components/Uploader.v2.tsx`
- **Status**: Uses `BlobType` internally but maintains backward compatibility
- **Import**: Now imports from `../types/blob` and uses `SortableBlob`

### 5. Props Type
- **File**: `src/components/propsType.v2.tsx`  
- **Props**: Updated to use blob-centric naming (`initialBlobs`, `onBlobsChange`, `maxBlobs`, `syncBlobs`, `mainBlobHash`)

### 6. Exports (index.ts)
```typescript
// Component exports
export { default as ImageUploader } from './components/Uploader.v2';
export { default as BlobUploader } from './components/Uploader.v2'; // New

// Type exports  
export type { BlobType, PhotoType } from './types/blob'; // PhotoType for backward compatibility
export type { BlobStateSetters } from './components/Blob.v2';
export type { BlobStateSetters as PhotoStateSetters } from './components/Blob.v2'; // Deprecated alias
```

## Backward Compatibility

### ✅ Existing Code Continues to Work
All existing integrations using `PhotoType` will continue to work without changes:
- `PhotoType` = `BlobType` (type alias)
- `PhotoStateSetters` = `BlobStateSetters` (exported alias)
- `ImageUploader` component name unchanged

### 🆕 New Blob-Based API Available
New integrations can use the modern blob-centric naming:
- Use `BlobType` instead of `PhotoType`
- Use `BlobUploader` or `ImageUploader` (same component)
- Use `BlobStateSetters` for state management

## Migration Guide for Applications

### Option 1: Continue Using Photo Naming (No Changes Required)
```typescript
import { ImageUploader, PhotoType } from 'react-image-uploader';

// Your existing code works as-is
const [photos, setPhotos] = useState<PhotoType[]>([]);
```

### Option 2: Migrate to Blob Naming (Recommended for New Code)
```typescript
import { BlobUploader, BlobType } from 'react-image-uploader';

// Modern blob-centric naming
const [blobs, setBlobs] = useState<BlobType[]>([]);
```

## Framework-Agnostic Architecture

The component is now completely framework-agnostic:

### 1. **Result-Based Mutations** (No Exceptions)
```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

### 2. **Individual State Setters** (Any State Management)
```typescript
interface BlobStateSetters {
  setBlobState: (hash: string, state: BlobType['state']) => void;
  setBlobUploadUrl: (hash: string, uploadUrl: string) => void;
  // ... etc
}
```

### 3. **Pure Orchestration**
The component:
- Calls mutation callbacks (returns `Result<T>`)
- Calls individual state setters based on results  
- Doesn't dictate state storage (Redux, Zustand, useState, etc.)

## Benefits

1. **General Purpose**: Works for any file type, not just images
2. **Framework Agnostic**: No assumptions about state management
3. **Result-Based**: No exception handling required
4. **Explicit State**: Individual setters for each property
5. **Backward Compatible**: Existing code continues to work
6. **Type Safe**: Full TypeScript support

## Next Steps for MP Application

The mp application can continue using `PhotoType` without changes, or optionally migrate to `BlobType` for consistency with the new naming convention.

Current approach in mp:
```typescript
import type { PhotoType } from 'react-image-uploader'; // Still works!
```

Optional modern approach:
```typescript
import type { BlobType } from 'react-image-uploader'; // New!
```

Both work identically since `PhotoType = BlobType`.

