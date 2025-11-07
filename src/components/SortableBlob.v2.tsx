import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Blob, { BlobStateSetters } from './Blob.v2';
import { BlobType } from '../types/blob';
import { StylingProps } from '../types/styling';
import { MutationCallbacks } from '../types/mutations';

interface SortableBlobProps {
  id: string;
  blob: BlobType;
  filesMap: Map<string, File>;
  isImmediateSyncMode: boolean;
  attachableId: number | null;
  attachableType: string;
  mainBlobHash: string | null;
  setMainBlobHash: (hash: string) => void;
  deleteFromFilesMap: (hash: string) => void;
  removeBlobByHash: (hash: string) => void;
  resetMainBlobHash: () => void;
  syncBlobs: boolean;
  mutations: MutationCallbacks;
  stateSetters: BlobStateSetters;
  styling: Required<StylingProps>;
}

function SortableBlob({
  id,
  photo,
  filesMap,
  isImmediateSyncMode,
  attachableId,
  attachableType,
  mainPhotoHash,
  setMainPhotoHash,
  deleteFromFilesMap,
  removePhotoByHash,
  resetMainPhotoHash,
  syncPhotos,
  mutations,
  stateSetters,
  styling,
}: SortableBlobProps) {
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
      <Blob
        isImmediateSyncMode={isImmediateSyncMode}
        attachableId={attachableId}
        attachableType={attachableType}
        file={filesMap.get(photo.checksum ?? '')}
        photo={photo}
        mainPhotoHash={mainPhotoHash ?? null}
        setMainPhotoHash={setMainPhotoHash}
        deleteFromFilesMap={deleteFromFilesMap}
        removePhotoByHash={removePhotoByHash}
        resetMainPhotoHash={resetMainPhotoHash}
        syncPhotos={syncPhotos}
        mutations={mutations}
        stateSetters={stateSetters}
        styling={styling}
      />
    </div>
  );
}

export default SortableBlob;

