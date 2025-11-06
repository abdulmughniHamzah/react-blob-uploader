import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Photo from './Photo.v2';
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

function SortablePhoto({
  id,
  photo,
  filesMap,
  isImmediateSyncMode,
  attachableId,
  mainPhotoHash,
  setMainPhotoHash,
  deleteAttachment,
  deleteFromFilesMap,
  removePhotoByHash,
  getUploadUrl,
  getPreviewUrl,
  directUpload,
  createBlob,
  createAttachment,
  resetMainPhotoHash,
  syncPhotos,
  setPhotoState,
  styling,
}: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Photo
        isImmediateSyncMode={isImmediateSyncMode}
        attachableId={attachableId}
        file={filesMap.get(photo.checksum ?? '')}
        photo={photo}
        mainPhotoHash={mainPhotoHash ?? null}
        setMainPhotoHash={setMainPhotoHash}
        deleteAttachment={deleteAttachment}
        deleteFromFilesMap={deleteFromFilesMap}
        removePhotoByHash={removePhotoByHash}
        getUploadUrl={getUploadUrl}
        getPreviewUrl={getPreviewUrl}
        directUpload={directUpload}
        createBlob={createBlob}
        createAttachment={createAttachment}
        resetMainPhotoHash={resetMainPhotoHash}
        syncPhotos={syncPhotos}
        setPhotoState={setPhotoState}
        styling={styling}
      />
    </div>
  );
}

export default SortablePhoto;

