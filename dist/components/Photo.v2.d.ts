import { PhotoType } from '../types/photo';
import { StylingProps } from '../types/styling';
interface PhotoProps {
    isImmediateSyncMode: boolean;
    photo: PhotoType;
    attachableId: number | null;
    file?: File;
    mainPhotoHash: string | null;
    setMainPhotoHash: (hash: string) => void;
    deleteFromFilesMap: (hash: string) => void;
    getUploadUrl: (hash: string) => void;
    getPreviewUrl: (hash: string) => void;
    directUpload: (hash: string, file: File) => void;
    createBlob: (hash: string) => void;
    createAttachment: (hash: string, attachableId: number) => void;
    removePhotoByHash: (hash: string) => void;
    deleteAttachment: (hash: string) => void;
    resetMainPhotoHash: () => void;
    setPhotoState: (hash: string, state: PhotoType['state']) => void;
    syncPhotos: boolean;
    styling: Required<StylingProps>;
}
declare const Photo: React.FC<PhotoProps>;
export default Photo;
//# sourceMappingURL=Photo.v2.d.ts.map