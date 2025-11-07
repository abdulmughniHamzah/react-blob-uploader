import { PhotoStateSetters } from './Photo.v2';
import { PhotoType } from '../types/blob';
import { StylingProps } from '../types/styling';
import { MutationCallbacks } from '../types/mutations';
interface SortablePhotoProps {
    id: string;
    photo: PhotoType;
    filesMap: Map<string, File>;
    isImmediateSyncMode: boolean;
    attachableId: number | null;
    attachableType: string;
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
declare function SortablePhoto({ id, photo, filesMap, isImmediateSyncMode, attachableId, attachableType, mainPhotoHash, setMainPhotoHash, deleteFromFilesMap, removePhotoByHash, resetMainPhotoHash, syncPhotos, mutations, stateSetters, styling, }: SortablePhotoProps): import("react/jsx-runtime").JSX.Element;
export default SortablePhoto;
//# sourceMappingURL=SortablePhoto.v2.d.ts.map