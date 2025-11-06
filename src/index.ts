// Main component (v2 - self-contained with internal state management)
export { default as ImageUploader } from './components/Uploader.v2';
export { default } from './components/Uploader.v2';

// Legacy component (v1 - for backward compatibility)
export { default as ImageUploaderV1 } from './components/Uploader';

// Types
export type { PhotoType } from './types/photo';

// v2 types (new architecture)
export type { LoadedPropsType } from './components/propsType.v2';
export type { MutationCallbacks, GetUploadUrlResponse, CreateBlobResponse, CreateAttachmentResponse, GetPreviewUrlResponse } from './types/mutations';
export type { StylingProps } from './types/styling';

// v1 types (legacy - for backward compatibility)
export type { LoadedPropsType as LoadedPropsTypeV1, SkeletonPropsType } from './components/propsType';

// Utils
export { calculateChecksum } from './utils/checksum';
