export interface StylingProps {
    containerClassName?: string;
    uploadButtonClassName?: string;
    photoContainerClassName?: string;
    photoImageClassName?: string;
    removeButtonClassName?: string;
    mainPhotoBadgeClassName?: string;
    loadingClassName?: string;
    errorClassName?: string;
}
export declare const defaultStyling: Required<StylingProps>;
export declare function mergeStyling(custom?: StylingProps): Required<StylingProps>;
//# sourceMappingURL=styling.d.ts.map