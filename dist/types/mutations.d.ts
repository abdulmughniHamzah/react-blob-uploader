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
export interface MutationCallbacks {
    getUploadUrl: (params: {
        checksum: string;
        name: string;
        mimeType: string;
        size: number;
    }) => Promise<GetUploadUrlResponse>;
    directUpload: (uploadUrl: string, file: File) => Promise<void>;
    createBlob: (params: {
        key: string;
        checksum: string;
        name: string;
        mimeType: string;
        size: number;
    }) => Promise<CreateBlobResponse>;
    createAttachment: (params: {
        blobId: number;
        attachableId: number;
        attachableType: string;
    }) => Promise<CreateAttachmentResponse>;
    deleteAttachment: (attachmentId: number) => Promise<void>;
    getPreviewUrl: (key: string) => Promise<GetPreviewUrlResponse>;
}
export type PartialMutationCallbacks = Partial<MutationCallbacks>;
//# sourceMappingURL=mutations.d.ts.map