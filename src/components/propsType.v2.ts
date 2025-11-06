import { PhotoType } from '../types/photo';
import { MutationCallbacks } from '../types/mutations';
import { StylingProps } from '../types/styling';

/**
 * Skeleton mode props (loading state)
 */
type SkeletonPropsType = {
  skeleton: true;
};

/**
 * Main component props (loaded state)
 * 
 * ARCHITECTURE: Self-contained component with internal state management
 * - Component manages photo states internally
 * - Parent provides mutation callbacks (API calls)
 * - Parent reads final state via onPhotosChange callback
 */
export type LoadedPropsType = {
  skeleton?: false;
  
  // ===== CORE CONFIGURATION =====
  /**
   * Maximum number of photos allowed
   * @default 10
   */
  maxPhotos?: number;
  
  /**
   * Entity ID to attach photos to (e.g., Offer ID, Product ID)
   * Required for attachment creation
   */
  attachableId: number | null;
  
  /**
   * Entity type for attachments (e.g., 'Offer', 'Product')
   * @default 'Offer'
   */
  attachableType?: string;
  
  // ===== SYNC CONTROL =====
  /**
   * Controls attachment creation behavior:
   * - true: Create attachments immediately after blob creation
   * - false: Stop at BLOB_CREATED state (manual sync later)
   * 
   * Check sync completion: all photos are either ATTACHED or (BLOB_CREATED && !syncPhotos)
   */
  syncPhotos: boolean;
  
  /**
   * Legacy mode flag (for backward compatibility)
   * - true: Photos sync immediately on upload
   * - false: Photos sync only when syncPhotos is true
   * @default false
   */
  isImmediateSyncMode?: boolean;
  
  /**
   * Disable interactions when form is being submitted
   * @default false
   */
  processRunning?: boolean;
  
  // ===== STATE MANAGEMENT =====
  /**
   * Initial photos state (for editing existing entities)
   * Component manages this internally after initialization
   */
  initialPhotos?: PhotoType[];
  
  /**
   * Callback when photos state changes
   * Parent reads final state through this callback
   */
  onPhotosChange?: (photos: PhotoType[]) => void;
  
  /**
   * Main photo checksum (for marking featured image)
   */
  mainPhotoHash?: string | null;
  
  /**
   * Callback when main photo changes
   */
  onMainPhotoChange?: (checksum: string | null) => void;
  
  // ===== MUTATION CALLBACKS =====
  /**
   * API mutation callbacks
   * All callbacks should return Promises and throw on error
   */
  mutations: MutationCallbacks;
  
  // ===== STYLING CUSTOMIZATION =====
  /**
   * Custom Tailwind CSS classes for styling
   * Allows parent to override default styling
   */
  styling?: StylingProps;
  
  // ===== LEGACY PROPS (Deprecated - for backward compatibility) =====
  /**
   * @deprecated Use initialPhotos instead
   */
  photos?: PhotoType[];
  
  /**
   * @deprecated Managed internally now
   */
  addPhoto?: (photo: PhotoType) => void;
  
  /**
   * @deprecated Managed internally now
   */
  removePhotoByHash?: (hash: string) => void;
  
  /**
   * @deprecated Managed internally now
   */
  removePhotoByKey?: (key: string) => void;
  
  /**
   * @deprecated Use onMainPhotoChange instead
   */
  setMainPhotoHash?: (hash: string) => void;
  
  /**
   * @deprecated Use mutations.getUploadUrl instead
   */
  getUploadUrl?: (hash: string) => void;
  
  /**
   * @deprecated Use mutations.getPreviewUrl instead
   */
  getPreviewUrl?: (hash: string) => void;
  
  /**
   * @deprecated Use mutations.directUpload instead
   */
  directUpload?: (hash: string, file: File) => void;
  
  /**
   * @deprecated Use mutations.createBlob instead
   */
  createBlob?: (hash: string) => void;
  
  /**
   * @deprecated Use mutations.createAttachment instead
   */
  createAttachment?: (hash: string, attachableId: number) => void;
  
  /**
   * @deprecated Use mutations.deleteAttachment instead
   */
  deleteAttachment?: (hash: string) => void;
  
  /**
   * @deprecated Managed internally now
   */
  resetMainPhotoHash?: () => void;
  
  /**
   * @deprecated Managed internally now
   */
  setPhotoState?: (hash: string, state: PhotoType['state']) => void;
  
  /**
   * @deprecated Managed internally now
   */
  setPhotos?: (photos: PhotoType[]) => void;
};

type PropsType = SkeletonPropsType | LoadedPropsType;
export default PropsType;

