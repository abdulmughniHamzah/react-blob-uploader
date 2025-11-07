export interface StylingProps {
    containerClassName?: string;
    uploadButtonClassName?: string;
    blobContainerClassName?: string;
    photoContainerClassName?: string;
    blobImageClassName?: string;
    photoImageClassName?: string;
    blobContainerFailedClassName?: string;
    photoContainerFailedClassName?: string;
    blobImageFailedClassName?: string;
    photoImageFailedClassName?: string;
    removeButtonClassName?: string;
    mainBlobBadgeClassName?: string;
    mainPhotoBadgeClassName?: string;
    setMainButtonClassName?: string;
    loadingContainerClassName?: string;
    loadingClassName?: string;
    loadingSpinnerClassName?: string;
    errorContainerClassName?: string;
    errorClassName?: string;
    errorMessageClassName?: string;
    retryButtonClassName?: string;
    removeButtonIconClassName?: string;
}
export declare const defaultStyling: Required<StylingProps>;
export declare function mergeStyling(custom?: StylingProps): Required<StylingProps>;
//# sourceMappingURL=styling.d.ts.map