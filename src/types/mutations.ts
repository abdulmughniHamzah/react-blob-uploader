/**
 * Mutation callback types for react-image-uploader
 * 
 * These callbacks are provided by the parent application and perform the actual API calls.
 * The component handles all state transitions internally based on the results.
 * 
 * All mutations return a Result type (success or error) instead of throwing exceptions,
 * making them framework-agnostic and not reliant on try-catch patterns.
 */

/**
 * Generic Result type for all mutation responses
 */
export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Success response data types
 */
export interface GetUploadUrlData {
  uploadUrl: string;
  key: string;
}

export interface CreateBlobData {
  id: number;
  key: string;
  url: string;
}

export interface CreateAttachmentData {
  id: number;
}

export interface GetPreviewUrlData {
  previewUrl: string;
}

/**
 * Mutation callbacks interface
 * All callbacks return Result<T> to indicate success or failure
 * No exceptions are thrown - all errors are returned in the Result type
 */
export interface MutationCallbacks {
  /**
   * Get a signed upload URL for direct upload to S3
   * @returns Result with uploadUrl and key on success, or error message on failure
   */
  getUploadUrl: (params: {
    checksum: string;
    name: string;
    mimeType: string;
    size: number;
  }) => Promise<Result<GetUploadUrlData>>;

  /**
   * Upload file directly to S3 using signed URL
   * @returns Result with void on success, or error message on failure
   */
  directUpload: (uploadUrl: string, file: File) => Promise<Result<void>>;

  /**
   * Create blob record in database after successful upload
   * @returns Result with blob data on success, or error message on failure
   */
  createBlob: (params: {
    key: string;
    checksum: string;
    name: string;
    mimeType: string;
    size: number;
  }) => Promise<Result<CreateBlobData>>;

  /**
   * Create attachment linking blob to attachable entity
   * @returns Result with attachment id on success, or error message on failure
   */
  createAttachment: (params: {
    blobId: number;
    attachableId: number;
    attachableType: string;
  }) => Promise<Result<CreateAttachmentData>>;

  /**
   * Delete an attachment
   * @returns Result with void on success, or error message on failure
   */
  deleteAttachment: (attachmentId: number) => Promise<Result<void>>;

  /**
   * Get preview URL for displaying image
   * @returns Result with preview URL on success, or error message on failure
   */
  getPreviewUrl: (key: string) => Promise<Result<GetPreviewUrlData>>;
}

/**
 * Optional partial mutations for cases where some operations are not needed
 */
export type PartialMutationCallbacks = Partial<MutationCallbacks>;

