export type Result<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
};
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
export interface MutationCallbacks {
    getUploadUrl: (params: {
        checksum: string;
        name: string;
        mimeType: string;
        size: number;
    }) => Promise<Result<GetUploadUrlData>>;
    directUpload: (uploadUrl: string, file: File) => Promise<Result<void>>;
    createBlob: (params: {
        key: string;
        checksum: string;
        name: string;
        mimeType: string;
        size: number;
    }) => Promise<Result<CreateBlobData>>;
    createAttachment: (params: {
        blobId: number;
        attachableId: number;
        attachableType: string;
    }) => Promise<Result<CreateAttachmentData>>;
    deleteAttachment: (attachmentId: number) => Promise<Result<void>>;
    getPreviewUrl: (key: string) => Promise<Result<GetPreviewUrlData>>;
}
export type PartialMutationCallbacks = Partial<MutationCallbacks>;
//# sourceMappingURL=mutations.d.ts.map