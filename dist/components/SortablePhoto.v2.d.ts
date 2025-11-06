import { PhotoType } from '../types/photo';
import { StylingProps } from '../types/styling';
interface SortablePhotoProps {
    id: string;
    photo: PhotoType;
    filesMap: Map<string, File>;
    isImmediateSyncMode: boolean;
    attachableId: number | null;
    mainPhotoHash: string | null;
    setMainPhotoHash: (hash: string) => void;
    deleteAttachment: (hash: string) => void;
    deleteFromFilesMap: (hash: string) => void;
    removePhotoByHash: (hash: string) => void;
    getUploadUrl: (hash: string) => void;
    getPreviewUrl: (hash: string) => void;
    directUpload: (hash: string, file: File) => void;
    createBlob: (hash: string) => void;
    createAttachment: (hash: string, attachableId: number) => void;
    resetMainPhotoHash: () => void;
    syncPhotos: boolean;
    setPhotoState: (hash: string, state: PhotoType['state']) => void;
    styling: Required<StylingProps>;
}
declare function SortablePhoto({ id, photo, filesMap, isImmediateSyncMode, attachableId, mainPhotoHash, setMainPhotoHash, deleteAttachment, deleteFromFilesMap, removePhotoByHash, getUploadUrl, getPreviewUrl, directUpload, createBlob, createAttachment, resetMainPhotoHash, syncPhotos, setPhotoState, styling, }: SortablePhotoProps): import("react/jsx-runtime").JSX.Element;
export default SortablePhoto;
//# sourceMappingURL=SortablePhoto.v2.d.ts.map