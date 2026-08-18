import { Blob } from "node:buffer";
import { writeFileSync, mkdirSync } from "node:fs";

if (!globalThis.Blob) globalThis.Blob = Blob;
if (!globalThis.FileReader) {
  globalThis.FileReader = class FileReader {
    result = null;
    onloadend = null;
    readAsArrayBuffer(blob) {
      Promise.resolve(blob.arrayBuffer()).then((buf) => {
        this.result = buf;
        this.onloadend?.({ target: this });
      });
    }
  };
}
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { buildCybercab, buildModelY } from "../src/vehicles/buildVehicles.ts";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "../public/models");
mkdirSync(outDir, { recursive: true });

function exportGroup(name, group) {
  const scene = new THREE.Scene();
  scene.add(group);
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        const bytes = result instanceof ArrayBuffer ? Buffer.from(result) : Buffer.from(JSON.stringify(result));
        const file = join(outDir, name);
        writeFileSync(file, bytes);
        console.log("wrote", file, bytes.length);
        resolve();
      },
      reject,
      { binary: true },
    );
  });
}

await exportGroup("cybercab.glb", buildCybercab("gold", 56));
await exportGroup("model-y.glb", buildModelY("white", 56));
