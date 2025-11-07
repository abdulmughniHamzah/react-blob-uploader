// Main component (v2 - self-contained with internal state management)
export { default as ImageUploader } from './components/Uploader.v2';
export { default as BlobUploader } from './components/Uploader.v2';
export { default } from './components/Uploader.v2';

// Core types
export type { BlobType, PhotoType } from './types/blob'; // PhotoType is deprecated but kept for backward compatibility
export type { LoadedPropsType } from './components/propsType.v2';
export type { BlobStateSetters } from './components/Blob.v2';

// Mutation types
export type { 
  MutationCallbacks, 
  Result,
  GetUploadUrlData, 
  CreateBlobData, 
  CreateAttachmentData, 
  GetPreviewUrlData 
} from './types/mutations';

// Styling
export type { StylingProps } from './types/styling';

// Utils
export { calculateChecksum } from './utils/checksum';

// Deprecated exports for backward compatibility
/**
 * @deprecated Use BlobStateSetters instead
 */
export type { BlobStateSetters as PhotoStateSetters } from './components/Blob.v2';
