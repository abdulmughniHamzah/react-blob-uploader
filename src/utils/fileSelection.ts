interface FileSelectionOptions {
  files: File[];
  maxItems: number;
  readBlobs: () => ReadonlyArray<{ checksum: string | null }>;
  checksum: (file: File) => Promise<string>;
  addFile: (file: File, checksum: string) => void;
}

export async function selectFiles({ files, maxItems, readBlobs, checksum, addFile }: FileSelectionOptions): Promise<void> {
  for (const file of files) {
    if (readBlobs().length >= maxItems) break;
    const hash = await checksum(file);
    // Another file/selection may have finished hashing while this one awaited.
    const current = readBlobs();
    if (current.some(blob => blob.checksum === hash)) continue;
    if (current.length >= maxItems) break;
    addFile(file, hash);
  }
}
