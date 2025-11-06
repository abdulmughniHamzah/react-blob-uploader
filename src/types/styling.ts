/**
 * Styling customization types for react-image-uploader
 * 
 * Allows parent applications to override default Tailwind CSS classes
 */

export interface StylingProps {
  /** Container wrapper classes */
  containerClassName?: string;
  
  /** Upload button classes */
  uploadButtonClassName?: string;
  
  /** Individual photo container classes */
  photoContainerClassName?: string;
  
  /** Photo image classes */
  photoImageClassName?: string;
  
  /** Remove button classes */
  removeButtonClassName?: string;
  
  /** Main photo badge classes */
  mainPhotoBadgeClassName?: string;
  
  /** Loading spinner container classes */
  loadingClassName?: string;
  
  /** Error message classes */
  errorClassName?: string;
}

/**
 * Default styling classes
 * These can be overridden by providing custom classes in props
 */
export const defaultStyling: Required<StylingProps> = {
  containerClassName: 'flex flex-wrap justify-start items-stretch gap-x-2 gap-y-4 lg:gap-x-4 lg:gap-y-6 rounded-lg',
  
  uploadButtonClassName: `
    w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] lg:w-[140px] lg:h-[140px]
    text-secondary font-medium text-t2
    flex items-center justify-center
    border border-dashed border-bg-primary
    rounded-[4px]
    cursor-pointer
    bg-primary hover:!bg-[var(--bg-focused-color)]
    hover:!text-[var(--text-accent-primary-color)] hover:!border-[var(--border-accent-primary-color)]
    transition-colors duration-100
  `.replace(/\s+/g, ' ').trim(),
  
  photoContainerClassName: `
    relative
    w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] lg:w-[140px] lg:h-[140px]
    rounded-[4px]
    overflow-hidden
    bg-secondary
    border border-bg-primary
  `.replace(/\s+/g, ' ').trim(),
  
  photoImageClassName: 'w-full h-full object-cover',
  
  removeButtonClassName: `
    absolute top-1 right-1
    w-6 h-6
    flex items-center justify-center
    rounded-full
    bg-danger-primary hover:bg-danger-secondary
    text-white
    cursor-pointer
    transition-colors
    z-10
  `.replace(/\s+/g, ' ').trim(),
  
  mainPhotoBadgeClassName: `
    absolute bottom-1 left-1
    px-2 py-0.5
    text-xs font-medium
    bg-accent-primary
    text-white
    rounded
    z-10
  `.replace(/\s+/g, ' ').trim(),
  
  loadingClassName: `
    absolute inset-0
    flex items-center justify-center
    bg-black bg-opacity-30
    z-20
  `.replace(/\s+/g, ' ').trim(),
  
  errorClassName: `
    absolute bottom-0 left-0 right-0
    px-2 py-1
    text-xs
    bg-danger-primary
    text-white
    truncate
  `.replace(/\s+/g, ' ').trim(),
};

/**
 * Merge custom styling with defaults
 */
export function mergeStyling(custom?: StylingProps): Required<StylingProps> {
  return {
    ...defaultStyling,
    ...custom,
  };
}

