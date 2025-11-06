/**
 * Mutation callback types for react-image-uploader
 * 
 * These callbacks are provided by the parent application and perform the actual API calls.
 * The component handles all state transitions internally based on the results.
 */

export interface GetUploadUrlResponse {
  uploadUrl: string;
  key: string;
}

export interface CreateBlobResponse {
  id: number;
  key: string;
  url: string;
}

export interface CreateAttachmentResponse {
  id: number;
}

export interface GetPreviewUrlResponse {
  previewUrl: string;
}

/**
 * Mutation callbacks interface
 * All callbacks should return Promises and throw errors on failure
 */
export interface MutationCallbacks {
  /**
   * Get a signed upload URL for direct upload to S3
   * @param checksum - File checksum
   * @param fileName - File name
   * @param mimeType - File MIME type
   * @param fileSize - File size in bytes
   */
  getUploadUrl: (params: {
    checksum: string;
    name: string;
    mimeType: string;
    size: number;
  }) => Promise<GetUploadUrlResponse>;

  /**
   * Upload file directly to S3 using signed URL
   * @param uploadUrl - Signed S3 URL
   * @param file - File to upload
   */
  directUpload: (uploadUrl: string, file: File) => Promise<void>;

  /**
   * Create blob record in database after successful upload
   * @param key - S3 object key
   * @param checksum - File checksum
   * @param name - File name
   * @param mimeType - File MIME type
   * @param size - File size
   */
  createBlob: (params: {
    key: string;
    checksum: string;
    name: string;
    mimeType: string;
    size: number;
  }) => Promise<CreateBlobResponse>;

  /**
   * Create attachment linking blob to attachable entity
   * @param blobId - Blob ID
   * @param attachableId - Entity ID to attach to
   * @param attachableType - Entity type (e.g., 'Offer', 'Product')
   */
  createAttachment: (params: {
    blobId: number;
    attachableId: number;
    attachableType: string;
  }) => Promise<CreateAttachmentResponse>;

  /**
   * Delete an attachment
   * @param attachmentId - Attachment ID to delete
   */
  deleteAttachment: (attachmentId: number) => Promise<void>;

  /**
   * Get preview URL for displaying image
   * @param key - S3 object key or checksum
   */
  getPreviewUrl: (key: string) => Promise<GetPreviewUrlResponse>;
}

/**
 * Optional partial mutations for cases where some operations are not needed
 */
export type PartialMutationCallbacks = Partial<MutationCallbacks>;

