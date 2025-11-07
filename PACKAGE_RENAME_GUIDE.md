# Package Rename: react-image-uploader → react-blob-uploader

## Overview
The package has been renamed from `react-image-uploader` to `react-blob-uploader` to reflect its general-purpose nature for handling any file type (images, documents, videos, PDFs, etc.), not just images.

## Changes Made

### 1. Package Name
- **Old**: `react-image-uploader`
- **New**: `react-blob-uploader`
- **File**: `package.json`

### 2. Repository URLs
- **Old**: `https://github.com/abdulmughniHamzah/react-image-uploader`
- **New**: `https://github.com/abdulmughniHamzah/react-blob-uploader`

### 3. Description Updated
Now emphasizes support for all file types with framework-agnostic architecture.

### 4. Keywords Updated
Added: `blob-uploader`, `file-uploader`, `document-uploader`, `framework-agnostic`, `direct-upload`, `file-management`

## Steps to Complete the Rename

### Step 1: Rename Directory (Required)
```bash
cd /Users/abi/Documents/cellifi
mv react-image-uploader react-blob-uploader
```

### Step 2: Update Git Remote (if pushing to GitHub)
```bash
cd /Users/abi/Documents/cellifi/react-blob-uploader

# If you're creating a new repository
git remote set-url origin https://github.com/abdulmughniHamzah/react-blob-uploader.git

# Or if renaming existing repository on GitHub:
# 1. Go to GitHub repository settings
# 2. Rename repository to "react-blob-uploader"
# 3. Git will automatically redirect, but update local remote:
git remote set-url origin https://github.com/abdulmughniHamzah/react-blob-uploader.git
```

### Step 3: Update MP Application Imports

#### Option A: Update to New Package Name
```typescript
// OLD
import { ImageUploader, PhotoType } from 'react-image-uploader';

// NEW  
import { BlobUploader, BlobType } from 'react-blob-uploader';
```

#### Option B: Keep Backward Compatible Names
```typescript
// Still works with new package!
import { ImageUploader, PhotoType } from 'react-blob-uploader';
```

### Step 4: Update MP package.json

**If using local path:**
```json
{
  "dependencies": {
    "react-blob-uploader": "file:../react-blob-uploader"
  }
}
```

**If using GitHub:**
```json
{
  "dependencies": {
    "react-blob-uploader": "github:abdulmughniHamzah/react-blob-uploader"
  }
}
```

### Step 5: Reinstall in MP Application
```bash
cd /Users/abi/Documents/cellifi/mp

# Remove old package
rm -rf node_modules/react-image-uploader
rm -rf node_modules/.pnpm/*react-image-uploader*

# Install new package
pnpm install

# Or if using local path
pnpm install ../react-blob-uploader
```

## MP Application Migration

### Files to Update
All files that import from `react-image-uploader` need to change to `react-blob-uploader`:

```bash
# Find all imports
grep -r "from 'react-image-uploader'" mp/src/

# Files typically affected:
# - mp/src/hooks/useImageUploaderMutations.ts
# - mp/src/app/manage/listings/[id]/edit/components/EditForm/Form.tsx
# - mp/src/app/manage/listings/create/components/steps/Step7/PhotosUploader.tsx
```

### Migration Script for MP

```bash
cd /Users/abi/Documents/cellifi/mp

# Update all imports automatically
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i.bak "s/from 'react-image-uploader'/from 'react-blob-uploader'/g" {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i.bak 's/from "react-image-uploader"/from "react-blob-uploader"/g' {} \;

# Clean up backup files
find src -name "*.bak" -delete
```

## Backward Compatibility

The package maintains full backward compatibility:

### Component Names
- ✅ `ImageUploader` - still exported (original name)
- ✅ `BlobUploader` - new alias for same component  
- Both work identically

### Type Names
- ✅ `PhotoType` - still exported (alias for `BlobType`)
- ✅ `BlobType` - new primary type
- ✅ `PhotoStateSetters` - still exported (alias for `BlobStateSetters`)
- ✅ `BlobStateSetters` - new primary interface

### Props
All old prop names are supported:
- `maxPhotos` → `maxBlobs` (both work)
- `syncPhotos` → `syncBlobs` (both work)
- `initialPhotos` → `initialBlobs` (both work)
- `onPhotosChange` → `onBlobsChange` (both work)
- `mainPhotoHash` → `mainBlobHash` (both work)

## Version Strategy

### Current: v2.0.0
Since we're already at v2.0.0 with the refactoring, the package rename doesn't require another major version bump.

### Future Versions
- v2.x.x - Maintain backward compatibility
- v3.0.0 - Can remove deprecated `Photo*` names if desired

## Publishing Checklist

- [ ] Directory renamed to `react-blob-uploader`
- [ ] Build the package: `npm run build`
- [ ] Test in mp application
- [ ] Update README.md with new package name
- [ ] GitHub repository renamed (or new repo created)
- [ ] Git remote URL updated
- [ ] Publish to npm: `npm publish`
- [ ] Update mp to use published package

## Benefits of New Name

1. **Accurate**: Reflects support for all file types
2. **Professional**: "Blob" is the standard web API term for file data
3. **Flexible**: Doesn't limit to just images
4. **Modern**: Aligns with `BlobType`, `BlobUploader` naming
5. **SEO**: Better keywords for file upload searches

## Notes

- The old `react-image-uploader` package name can be deprecated on npm
- Consider publishing under both names initially, with `react-image-uploader` deprecated
- Documentation should use `react-blob-uploader` going forward
- GitHub can set up automatic redirects from old URL to new URL

