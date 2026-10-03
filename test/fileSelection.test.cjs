const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
const originalLoader = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => module._compile(
  ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
const { selectFiles } = require('../src/utils/fileSelection.ts');
require.extensions['.ts'] = originalLoader;

const fixture = (maxItems = 3) => {
  let blobs = [];
  const accepted = [];
  return {
    accepted,
    options: {
      maxItems,
      readBlobs: () => blobs,
      checksum: async file => file.content,
      addFile: (file, checksum) => {
        accepted.push(file.name);
        // Controlled parents replace their array rather than mutating it.
        blobs = [...blobs, { checksum }];
      },
    },
  };
};

test('identical files in one batch are added once; duplicates do not consume remaining slots', async () => {
  const { accepted, options } = fixture(2);
  await selectFiles({ ...options, files: [
    { name: 'front.jpg', content: 'front' },
    { name: 'front-copy.jpg', content: 'front' },
    { name: 'back.jpg', content: 'back' },
  ] });
  assert.deepEqual(accepted, ['front.jpg', 'back.jpg']);
});

test('overlapping selections recheck checksum and capacity after hashing', async () => {
  const { accepted, options } = fixture(2);
  const pending = [];
  const checksum = file => new Promise(resolve => pending.push(() => resolve(file.content)));
  const runs = ['first', 'duplicate', 'second', 'third'].map((name, index) => selectFiles({
    ...options, checksum, files: [{ name, content: index < 2 ? 'same' : name }],
  }));
  pending.forEach(resolve => resolve());
  await Promise.all(runs);
  assert.deepEqual(accepted, ['first', 'second']);
});

test('reselecting a stored file preserves it and admits a different file', async () => {
  const { accepted, options } = fixture();
  await selectFiles({ ...options, files: [{ name: 'original', content: 'one' }] });
  await selectFiles({ ...options, files: [{ name: 'copy', content: 'one' }, { name: 'other', content: 'two' }] });
  assert.deepEqual(accepted, ['original', 'other']);
});
