import { PhotoType } from '../types/blob';
import { StylingProps } from '../types/styling';
import { MutationCallbacks } from '../types/mutations';
export interface PhotoStateSetters {
    setPhotoState: (hash: string, state: PhotoType['state']) => void;
    setPhotoUploadUrl: (hash: string, uploadUrl: string) => void;
    setPhotoKey: (hash: string, key: string) => void;
    setPhotoBlobId: (hash: string, blobId: number) => void;
    setPhotoPreviewUrl: (hash: string, previewUrl: string) => void;
    setPhotoAttachmentId: (hash: string, attachmentId: number) => void;
    setPhotoErrorMessage: (hash: string, errorMessage: string | null) => void;
}
interface PhotoProps {
    isImmediateSyncMode: boolean;
    photo: PhotoType;
    attachableId: number | null;
    attachableType: string;
    file?: File;
    mainPhotoHash: string | null;
    setMainPhotoHash: (hash: string) => void;
    deleteFromFilesMap: (hash: string) => void;
    removePhotoByHash: (hash: string) => void;
    resetMainPhotoHash: () => void;
    syncPhotos: boolean;
    mutations: MutationCallbacks;
    stateSetters: PhotoStateSetters;
    styling: Required<StylingProps>;
}
declare const Photo: React.FC<PhotoProps>;
export default Photo;
//# sourceMappingURL=Photo.v2.d.ts.map