import * as CANNON from "cannon-es";
import * as THREE from "three";

export interface DiePalette {
  body: number;
  edge: number;
  text: string;
}

interface DieDefinition {
  sides: number;
  vertices: number[][];
  faces: number[][];
  af: number;
  tab: number;
  chamfer: number;
  margin: number;
  radiusScale: number;
}

interface ChamferedGeometry {
  vectors: THREE.Vector3[];
  faces: number[][];
}

export interface VisualDieModel {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial[]>;
  shape: CANNON.ConvexPolyhedron;
}

const MATERIAL_OPTIONS = {
  specular: 0x202433,
  shininess: 74,
  flatShading: true,
};

function d20Definition(): DieDefinition {
  const t = (1 + Math.sqrt(5)) / 2;
  return {
    sides: 20,
    tab: -0.2,
    af: -Math.PI / 8,
    chamfer: 0.955,
    radiusScale: 1,
    margin: 1,
    vertices: [
      [-1, t, 0],
      [1, t, 0],
      [-1, -t, 0],
      [1, -t, 0],
      [0, -1, t],
      [0, 1, t],
      [0, -1, -t],
      [0, 1, -t],
      [t, 0, -1],
      [t, 0, 1],
      [-t, 0, -1],
      [-t, 0, 1],
    ],
    faces: [
      [0, 11, 5, 1],
      [0, 5, 1, 2],
      [0, 1, 7, 3],
      [0, 7, 10, 4],
      [0, 10, 11, 5],
      [1, 5, 9, 6],
      [5, 11, 4, 7],
      [11, 10, 2, 8],
      [10, 7, 6, 9],
      [7, 1, 8, 10],
      [3, 9, 4, 11],
      [3, 4, 2, 12],
      [3, 2, 6, 13],
      [3, 6, 8, 14],
      [3, 8, 9, 15],
      [4, 9, 5, 16],
      [2, 4, 11, 17],
      [6, 2, 10, 18],
      [8, 6, 7, 19],
      [9, 8, 1, 20],
    ],
  };
}

function d12Definition(): DieDefinition {
  const p = (1 + Math.sqrt(5)) / 2;
  const q = 1 / p;
  return {
    sides: 12,
    tab: 0.2,
    af: -Math.PI / 8,
    chamfer: 0.968,
    radiusScale: 0.95,
    margin: 1,
    vertices: [
      [0, q, p],
      [0, q, -p],
      [0, -q, p],
      [0, -q, -p],
      [p, 0, q],
      [p, 0, -q],
      [-p, 0, q],
      [-p, 0, -q],
      [q, p, 0],
      [q, -p, 0],
      [-q, p, 0],
      [-q, -p, 0],
      [1, 1, 1],
      [1, 1, -1],
      [1, -1, 1],
      [1, -1, -1],
      [-1, 1, 1],
      [-1, 1, -1],
      [-1, -1, 1],
      [-1, -1, -1],
    ],
    faces: [
      [2, 14, 4, 12, 0, 1],
      [15, 9, 11, 19, 3, 2],
      [16, 10, 17, 7, 6, 3],
      [6, 7, 19, 11, 18, 4],
      [6, 18, 2, 0, 16, 5],
      [18, 11, 9, 14, 2, 6],
      [1, 17, 10, 8, 13, 7],
      [1, 13, 5, 15, 3, 8],
      [13, 8, 12, 4, 5, 9],
      [5, 4, 14, 9, 15, 10],
      [0, 12, 8, 10, 16, 11],
      [3, 19, 7, 17, 1, 12],
    ],
  };
}

function d10Definition(): DieDefinition {
  const vertices: number[][] = [];
  for (let i = 0, b = 0; i < 10; i += 1, b += (Math.PI * 2) / 10) {
    vertices.push([Math.cos(b), Math.sin(b), 0.105 * (i % 2 ? 1 : -1)]);
  }
  vertices.push([0, 0, -1], [0, 0, 1]);
  return {
    sides: 10,
    tab: 0,
    af: (-Math.PI * 6) / 5,
    chamfer: 0.945,
    radiusScale: 0.96,
    margin: 1,
    vertices,
    faces: [
      [5, 7, 11, 1],
      [4, 2, 10, 2],
      [1, 3, 11, 3],
      [0, 8, 10, 4],
      [7, 9, 11, 5],
      [8, 6, 10, 6],
      [9, 1, 11, 7],
      [2, 0, 10, 8],
      [3, 5, 11, 9],
      [6, 4, 10, 10],
      [1, 0, 2, -1],
      [1, 2, 3, -1],
      [3, 2, 4, -1],
      [3, 4, 5, -1],
      [5, 4, 6, -1],
      [5, 6, 7, -1],
      [7, 6, 8, -1],
      [7, 8, 9, -1],
      [9, 8, 0, -1],
      [9, 0, 1, -1],
    ],
  };
}

function d8Definition(): DieDefinition {
  return {
    sides: 8,
    tab: 0,
    af: -Math.PI / 8,
    chamfer: 0.965,
    radiusScale: 1,
    margin: 1.2,
    vertices: [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ],
    faces: [
      [0, 2, 4, 1],
      [0, 4, 3, 2],
      [0, 3, 5, 3],
      [0, 5, 2, 4],
      [1, 3, 4, 5],
      [1, 4, 2, 6],
      [1, 2, 5, 7],
      [1, 5, 3, 8],
    ],
  };
}

function d6Definition(): DieDefinition {
  return {
    sides: 6,
    tab: 0.1,
    af: Math.PI / 4,
    chamfer: 0.96,
    radiusScale: 0.94,
    margin: 1,
    vertices: [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ],
    faces: [
      [0, 3, 2, 1, 1],
      [1, 2, 6, 5, 2],
      [0, 1, 5, 4, 3],
      [3, 7, 6, 2, 4],
      [0, 4, 7, 3, 5],
      [4, 5, 6, 7, 6],
    ],
  };
}

function d4Definition(): DieDefinition {
  return {
    sides: 4,
    tab: -0.1,
    af: (Math.PI * 7) / 6,
    chamfer: 0.96,
    radiusScale: 1.1,
    margin: 1,
    vertices: [
      [1, 1, 1],
      [-1, -1, 1],
      [-1, 1, -1],
      [1, -1, -1],
    ],
    faces: [
      [1, 0, 2, 1],
      [0, 1, 3, 2],
      [0, 3, 2, 3],
      [1, 2, 3, 4],
    ],
  };
}

function getDefinition(sides: number): DieDefinition {
  switch (sides) {
    case 4:
      return d4Definition();
    case 6:
      return d6Definition();
    case 8:
      return d8Definition();
    case 10:
      return d10Definition();
    case 12:
      return d12Definition();
    case 20:
      return d20Definition();
    default:
      return d20Definition();
  }
}

function chamferGeometry(definition: DieDefinition): ChamferedGeometry {
  const vectors = definition.vertices.map((vertex) =>
    new THREE.Vector3().fromArray(vertex).normalize(),
  );
  const chamferVectors: THREE.Vector3[] = [];
  const chamferFaces: number[][] = [];
  const cornerFaces = vectors.map((): number[] => []);

  for (const sourceFace of definition.faces) {
    const faceLength = sourceFace.length - 1;
    const centerPoint = new THREE.Vector3();
    const face: number[] = [];

    for (let index = 0; index < faceLength; index += 1) {
      const vertexIndex = sourceFace[index];
      const vertex = vectors[vertexIndex].clone();
      centerPoint.add(vertex);
      face[index] = chamferVectors.push(vertex) - 1;
      cornerFaces[vertexIndex].push(face[index]);
    }

    centerPoint.divideScalar(faceLength);
    for (const vertexIndex of face) {
      const vertex = chamferVectors[vertexIndex];
      vertex
        .subVectors(vertex, centerPoint)
        .multiplyScalar(definition.chamfer)
        .addVectors(vertex, centerPoint);
    }

    face.push(sourceFace[faceLength]);
    chamferFaces.push(face);
  }

  for (let left = 0; left < definition.faces.length - 1; left += 1) {
    for (let right = left + 1; right < definition.faces.length; right += 1) {
      const pairs: Array<[number, number]> = [];
      let lastMatch = -1;
      for (let index = 0; index < definition.faces[left].length - 1; index += 1) {
        const match = definition.faces[right].indexOf(definition.faces[left][index]);
        if (match >= 0 && match < definition.faces[right].length - 1) {
          if (lastMatch >= 0 && index !== lastMatch + 1) {
            pairs.unshift([left, index], [right, match]);
          } else {
            pairs.push([left, index], [right, match]);
          }
          lastMatch = index;
        }
      }
      if (pairs.length !== 4) continue;
      chamferFaces.push([
        chamferFaces[pairs[0][0]][pairs[0][1]],
        chamferFaces[pairs[1][0]][pairs[1][1]],
        chamferFaces[pairs[3][0]][pairs[3][1]],
        chamferFaces[pairs[2][0]][pairs[2][1]],
        -1,
      ]);
    }
  }

  for (const cornerFace of cornerFaces) {
    const face = [cornerFace[0]];
    let remaining = cornerFace.length - 1;
    while (remaining > 0) {
      for (let index = definition.faces.length; index < chamferFaces.length; index += 1) {
        const currentIndex = chamferFaces[index].indexOf(face[face.length - 1]);
        if (currentIndex >= 0 && currentIndex < 4) {
          const nextIndex = currentIndex === 0 ? 3 : currentIndex - 1;
          const nextVertex = chamferFaces[index][nextIndex];
          if (cornerFace.includes(nextVertex)) {
            face.push(nextVertex);
            break;
          }
        }
      }
      remaining -= 1;
    }
    face.push(-1);
    chamferFaces.push(face);
  }

  return { vectors: chamferVectors, faces: chamferFaces };
}

function makeGeometry(definition: DieDefinition, radius: number): THREE.BufferGeometry {
  const { vectors, faces } = chamferGeometry(definition);
  const scaledVectors = vectors.map((vector) => vector.clone().multiplyScalar(radius));
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();
  let faceFirstVertexIndex = 0;

  for (const face of faces) {
    const faceLength = face.length - 1;
    const angleStep = (Math.PI * 2) / faceLength;
    const materialIndex = face[faceLength] + 1;

    for (let index = 0; index < faceLength - 2; index += 1) {
      positions.push(...scaledVectors[face[0]].toArray());
      positions.push(...scaledVectors[face[index + 1]].toArray());
      positions.push(...scaledVectors[face[index + 2]].toArray());

      cb.subVectors(scaledVectors[face[index + 2]], scaledVectors[face[index + 1]]);
      ab.subVectors(scaledVectors[face[0]], scaledVectors[face[index + 1]]);
      cb.cross(ab).normalize();
      normals.push(...cb.toArray(), ...cb.toArray(), ...cb.toArray());

      uvs.push(
        (Math.cos(definition.af) + 1 + definition.tab) / 2 / (1 + definition.tab),
        (Math.sin(definition.af) + 1 + definition.tab) / 2 / (1 + definition.tab),
      );
      uvs.push(
        (Math.cos(angleStep * (index + 1) + definition.af) + 1 + definition.tab) /
          2 /
          (1 + definition.tab),
        (Math.sin(angleStep * (index + 1) + definition.af) + 1 + definition.tab) /
          2 /
          (1 + definition.tab),
      );
      uvs.push(
        (Math.cos(angleStep * (index + 2) + definition.af) + 1 + definition.tab) /
          2 /
          (1 + definition.tab),
        (Math.sin(angleStep * (index + 2) + definition.af) + 1 + definition.tab) /
          2 /
          (1 + definition.tab),
      );
    }

    const faceVertexCount = (faceLength - 2) * 3;
    for (let index = 0; index < faceVertexCount / 3; index += 1) {
      geometryGroup(faceFirstVertexIndex, materialIndex);
      faceFirstVertexIndex += 3;
    }
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeBoundingSphere();

  function geometryGroup(start: number, materialIndex: number) {
    geometry.addGroup(start, 3, materialIndex);
  }

  return geometry;
}

function makeShape(definition: DieDefinition, radius: number): CANNON.ConvexPolyhedron {
  const vertices = definition.vertices.map((vertex) => {
    const normalized = new THREE.Vector3().fromArray(vertex).normalize().multiplyScalar(radius);
    return new CANNON.Vec3(normalized.x, normalized.y, normalized.z);
  });
  const faces = definition.faces.map((face) => face.slice(0, face.length - 1));
  return new CANNON.ConvexPolyhedron({ vertices, faces });
}

/**
 * A caltrop d4 carries three numbers per face, one at each corner, instead of a
 * single centered value. The layout (keyed by material index 2..5, the four
 * number faces) matches the Obsidian dice-roller so that the value of the face
 * the die rests *on* appears at the upward apex — which is what the player
 * reads from above. `readUpFaceValue` reads that down face for the d4.
 */
const D4_FACE_CORNERS: Record<number, [number, number, number]> = {
  2: [2, 4, 3],
  3: [1, 3, 4],
  4: [2, 1, 4],
  5: [1, 2, 3],
};

function paintDieBackground(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  palette: DiePalette,
) {
  const body = `#${palette.body.toString(16).padStart(6, "0")}`;
  const gradient = context.createRadialGradient(88, 72, 12, 132, 132, 180);
  gradient.addColorStop(0, lightenHex(body, 38));
  gradient.addColorStop(0.55, body);
  gradient.addColorStop(1, darkenHex(body, 32));
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function finishTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createDieTexture(
  label: string,
  definition: DieDefinition,
  palette: DiePalette,
  highlighted: boolean,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.CanvasTexture(canvas);

  paintDieBackground(context, canvas, palette);

  if (highlighted) {
    context.strokeStyle = `#${palette.edge.toString(16).padStart(6, "0")}`;
    context.lineWidth = 10;
    context.globalAlpha = 0.34;
    context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
    context.globalAlpha = 1;
  }

  if (label) {
    // Fit the glyph to the face: smaller on the narrow d10 kite, and shrunk
    // again for two-digit labels so they don't overflow the face.
    const baseSize = definition.sides >= 20 ? 116 : definition.sides === 10 ? 104 : 128;
    const fontsize = label.length > 1 ? Math.round(baseSize * 0.6) : baseSize;
    context.save();
    if (definition.sides === 10) {
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate((60 * Math.PI) / 180);
      context.translate(-canvas.width / 2, -canvas.height / 2);
    }
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `700 ${fontsize}px Arial, Helvetica, sans-serif`;
    context.lineWidth = 9;
    context.strokeStyle = "rgba(0, 0, 0, 0.2)";
    context.fillStyle = highlighted ? "#ffffff" : palette.text;
    context.strokeText(label, canvas.width / 2, canvas.height / 2 + 4);
    context.fillText(label, canvas.width / 2, canvas.height / 2 + 4);
    if (definition.sides > 6 && (label === "6" || label === "9")) {
      context.font = "700 48px Arial, Helvetica, sans-serif";
      context.fillText(".", canvas.width / 2 + 42, canvas.height / 2 + 54);
    }
    context.restore();
  }

  return finishTexture(canvas);
}

function createD4Texture(
  corners: [number, number, number] | null,
  palette: DiePalette,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.CanvasTexture(canvas);

  paintDieBackground(context, canvas, palette);

  if (corners) {
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "700 52px Arial, Helvetica, sans-serif";
    context.lineWidth = 7;
    context.strokeStyle = "rgba(0, 0, 0, 0.2)";
    context.fillStyle = palette.text;
    const radius = canvas.height * 0.3;
    // Drop a number toward one corner, then rotate 120° and repeat, so the
    // three values sit at the three corners of the triangular face.
    for (const value of corners) {
      const x = canvas.width / 2;
      const y = canvas.height / 2 - radius;
      context.strokeText(String(value), x, y);
      context.fillText(String(value), x, y);
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate((Math.PI * 2) / 3);
      context.translate(-canvas.width / 2, -canvas.height / 2);
    }
  }

  return finishTexture(canvas);
}

function labelForFace(definition: DieDefinition, faceValue: number): string {
  if (faceValue <= 0) return "";
  // A d10 shows 0–9: the value 10 is printed as "0", as on a real d10.
  if (definition.sides === 10 && faceValue === 10) return "0";
  return String(faceValue);
}

function makeMaterials(
  definition: DieDefinition,
  palette: DiePalette,
): THREE.MeshPhongMaterial[] {
  return Array.from({ length: definition.sides + 2 }, (_, index) => {
    const texture =
      definition.sides === 4
        ? createD4Texture(D4_FACE_CORNERS[index] ?? null, palette)
        : createDieTexture(labelForFace(definition, index - 1), definition, palette, false);
    return new THREE.MeshPhongMaterial({
      ...MATERIAL_OPTIONS,
      color: 0xffffff,
      map: texture,
    });
  });
}

function lightenHex(hex: string, amount: number): string {
  return adjustHex(hex, amount);
}

function darkenHex(hex: string, amount: number): string {
  return adjustHex(hex, -amount);
}

function adjustHex(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((start) =>
    Math.max(0, Math.min(255, parseInt(value.slice(start, start + 2), 16) + amount)),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Read the value of the face pointing up once a die has come to rest — the
 * physical outcome of the throw. It finds the number face whose world-space
 * normal is most closely aligned with the world up vector, which under the
 * aerial camera is also the face turned toward the viewer.
 *
 * The d4 is the exception: a caltrop d4 has no top face, so the result is the
 * value of the face it rests *on* (down). Its corner numbering (see
 * `D4_FACE_CORNERS`) puts that same value at the upward apex, so the player
 * reads it from above. This mirrors the Obsidian dice-roller.
 *
 * The numbers are never moved to match a predetermined result; whatever lands
 * up is the result, so there is no post-landing "snap".
 */
export function readUpFaceValue(
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>,
  sides: number,
): number | null {
  const normals = mesh.geometry.getAttribute("normal");
  if (!normals) return null;

  const up = new THREE.Vector3(0, sides === 4 ? -1 : 1, 0);
  const normal = new THREE.Vector3();
  let value: number | null = null;
  let closestAngle = Number.POSITIVE_INFINITY;

  for (const group of mesh.geometry.groups) {
    const materialIndex = group.materialIndex ?? 0;
    // Material indices 0 and 1 are the blank chamfer/edge faces; numbers start at 2.
    if (materialIndex < 2) continue;

    const normalIndex = group.start * 3;
    normal
      .set(
        normals.array[normalIndex],
        normals.array[normalIndex + 1],
        normals.array[normalIndex + 2],
      )
      .applyQuaternion(mesh.quaternion)
      .normalize();
    const angle = normal.angleTo(up);

    if (angle < closestAngle) {
      closestAngle = angle;
      value = materialIndex - 1;
    }
  }

  return value;
}

export function createVisualDieModel(
  sides: number,
  palette: DiePalette,
  radius: number,
): VisualDieModel {
  const definition = getDefinition(sides);
  const dieRadius = radius * definition.radiusScale;
  const geometry = makeGeometry(definition, dieRadius);
  const materials = makeMaterials(definition, palette);
  const mesh = new THREE.Mesh(geometry, materials);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return {
    mesh,
    shape: makeShape(definition, dieRadius),
  };
}
