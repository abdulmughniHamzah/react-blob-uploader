import { PhotoType } from '../types/photo';
import { MutationCallbacks } from '../types/mutations';
import { StylingProps } from '../types/styling';
type SkeletonPropsType = {
    skeleton: true;
};
export type LoadedPropsType = {
    skeleton?: false;
    maxPhotos?: number;
    attachableId: number | null;
    attachableType?: string;
    syncPhotos: boolean;
    isImmediateSyncMode?: boolean;
    processRunning?: boolean;
    initialPhotos?: PhotoType[];
    onPhotosChange?: (photos: PhotoType[]) => void;
    mainPhotoHash?: string | null;
    onMainPhotoChange?: (checksum: string | null) => void;
    mutations: MutationCallbacks;
    styling?: StylingProps;
    photos?: PhotoType[];
    addPhoto?: (photo: PhotoType) => void;
    removePhotoByHash?: (hash: string) => void;
    removePhotoByKey?: (key: string) => void;
    setMainPhotoHash?: (hash: string) => void;
    getUploadUrl?: (hash: string) => void;
    getPreviewUrl?: (hash: string) => void;
    directUpload?: (hash: string, file: File) => void;
    createBlob?: (hash: string) => void;
    createAttachment?: (hash: string, attachableId: number) => void;
    deleteAttachment?: (hash: string) => void;
    resetMainPhotoHash?: () => void;
    setPhotoState?: (hash: string, state: PhotoType['state']) => void;
    setPhotos?: (photos: PhotoType[]) => void;
};
type PropsType = SkeletonPropsType | LoadedPropsType;
export default PropsType;
//# sourceMappingURL=propsType.v2.d.ts.map