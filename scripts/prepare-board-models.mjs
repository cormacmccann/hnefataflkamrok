// Keep every geometry byte; remove image buffers unused by TAFL's procedural materials.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

for (const name of ['attacker', 'defender', 'king']) {
  const sourcePath = fileURLToPath(new URL(`../src/assets/${name}-piece.glb`, import.meta.url));
  const outputPath = fileURLToPath(new URL(`../src/assets/${name}-piece-geometry.glb`, import.meta.url));
  const original = readFileSync(sourcePath);
  assert.equal(original.readUInt32LE(0), 0x46546c67, 'Expected binary glTF');
  const jsonLength = original.readUInt32LE(12);
  const data = JSON.parse(original.subarray(20, 20 + jsonLength).toString());
  const binary = original.subarray(28 + jsonLength);
  const retained = [...new Set(data.accessors.flatMap(accessor => [accessor.bufferView, accessor.sparse?.indices?.bufferView, accessor.sparse?.values?.bufferView]).filter(value => value !== undefined))].sort((a, b) => a - b);
  const remap = new Map(retained.map((value, index) => [value, index]));
  let offset = 0;
  const geometryChunks = [];
  const views = retained.map(index => {
    const view = data.bufferViews[index];
    const bytes = binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
    const padding = (4 - bytes.length % 4) % 4;
    const result = { ...view, buffer: 0, byteOffset: offset };
    geometryChunks.push(bytes, Buffer.alloc(padding));
    offset += bytes.length + padding;
    return result;
  });
  for (const accessor of data.accessors) {
    if (accessor.bufferView !== undefined) accessor.bufferView = remap.get(accessor.bufferView);
    if (accessor.sparse) for (const part of ['indices', 'values']) accessor.sparse[part].bufferView = remap.get(accessor.sparse[part].bufferView);
  }
  for (const mesh of data.meshes) for (const primitive of mesh.primitives) delete primitive.material;
  for (const key of ['images', 'textures', 'samplers', 'materials']) delete data[key];
  data.bufferViews = views;
  data.buffers = [{ byteLength: offset }];
  const optimizedBinary = Buffer.concat(geometryChunks);
  retained.forEach((oldIndex, newIndex) => {
    const view = views[newIndex];
    const oldData = JSON.parse(original.subarray(20, 20 + jsonLength).toString()).bufferViews[oldIndex];
    assert.deepEqual(optimizedBinary.subarray(view.byteOffset, view.byteOffset + view.byteLength), binary.subarray(oldData.byteOffset || 0, (oldData.byteOffset || 0) + oldData.byteLength), 'Geometry bytes must be unchanged');
  });
  let json = Buffer.from(JSON.stringify(data));
  json = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 0x20)]);
  const header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + json.length + optimizedBinary.length, 8);
  header.writeUInt32LE(json.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
  const binaryHeader = Buffer.alloc(8);
  binaryHeader.writeUInt32LE(optimizedBinary.length, 0); binaryHeader.writeUInt32LE(0x004e4942, 4);
  const result = Buffer.concat([header, json, binaryHeader, optimizedBinary]);
  writeFileSync(outputPath, result);
  console.log(`${name}: ${(original.length / 1024).toFixed(0)} KB → ${(result.length / 1024).toFixed(0)} KB; geometry byte-for-byte verified`);
}
