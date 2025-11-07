/* components/RichTextEditor.tsx */
// 'use client';

import React from 'react';
import Uploader from './Uploader.v2';
import Skeleton from './Skeleton';
import PropsType from './propsType.v2';

const ImageUploader: React.FC<PropsType> = (props) => {
  if (props.skeleton) {
    return <Skeleton />;
  }

  return <Uploader {...props} />;
};

export default ImageUploader;
