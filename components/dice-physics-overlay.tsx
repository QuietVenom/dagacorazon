"use client";

import { useEffect, useRef, useState } from "react";
import * as CANNON from "cannon-es";
import * as THREE from "three";
import {
  createVisualDieModel,
  readUpFaceValue,
  type DiePalette,
} from "@/lib/dice-physics/visual-die";

export type VisualDieTone = "neutral" | "hope" | "fear" | "damage";

export interface VisualDie {
  id: string;
  sides: number;
  tone: VisualDieTone;
  label?: string;
}

interface DicePhysicsOverlayProps {
  dice: VisualDie[];
  rollKey: number;
  /**
   * Called once per throw with the up-face value of each die, in the same order
   * as `dice`, the moment they have all come to rest. The physical roll is the
   * result — the caller fills the panel from these values.
   */
  onResult?: (values: number[]) => void;
}

const MAX_PIXEL_RATIO = 2;
const TABLE_Y = -1.95;
const DIE_RADIUS = 0.56;
// Hard cap on a throw: the dice are flung in from the edges and given a long
// tumble, but if they never settle we still tear the scene down by this point.
const RENDER_MS = 7000;
const FADE_MS = 700;
// How long the settled dice linger on screen before fading, so the result is
// readable on the dice themselves, not just the panel.
const LINGER_MS = 1100;
// If a die has not settled by this point, read whatever face is up so the
// result still resolves before the dice fade out.
const RESULT_READ_DEADLINE_MS = RENDER_MS - LINGER_MS - FADE_MS - 200;
// Frames a die must stay below the speed thresholds before we trust it as
// settled, so a momentary low-speed point mid-bounce is not read early.
const SETTLE_FRAMES = 10;
const SETTLED_LINEAR_SPEED = 0.34;
const SETTLED_ANGULAR_SPEED = 0.6;
const WALL_THICKNESS = 0.18;
const WALL_HEIGHT = 6;
const WALL_DEPTH = 8;

const toneColors: Record<
  VisualDieTone,
  { body: number; edge: number; text: string; label: string }
> = {
  neutral: { body: 0x26304d, edge: 0xd4a843, text: "#f0d060", label: "#e8e4dc" },
  hope: { body: 0xd4a843, edge: 0xf0d060, text: "#11111f", label: "#f0d060" },
  fear: { body: 0x6655bd, edge: 0xbcb0ff, text: "#ffffff", label: "#c7bcff" },
  damage: { body: 0x91313d, edge: 0xf0d060, text: "#fff2d0", label: "#e05060" },
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function diePalette(tone: VisualDieTone): DiePalette {
  const palette = toneColors[tone];
  return {
    body: palette.body,
    edge: palette.edge,
    text: palette.text,
  };
}

interface PhysicalDie {
  body: CANNON.Body;
  mesh: THREE.Mesh;
  edge: THREE.LineSegments;
  sides: number;
  settled: boolean;
  calmFrames: number;
}

interface DiceBounds {
  bodies: CANNON.Body[];
  xLimit: number;
  backLimit: number;
  frontLimit: number;
}

function addInvisibleBounds(
  world: CANNON.World,
  material: CANNON.Material,
  width: number,
  height: number,
): DiceBounds {
  const aspect = width / height;
  const xLimit = Math.max(2.6, Math.min(6.8, 4.1 * aspect));
  const backLimit = -4.1;
  const frontLimit = 3.6;
  const centerY = TABLE_Y + WALL_HEIGHT / 2;

  const leftWall = new CANNON.Body({
    mass: 0,
    material,
    shape: new CANNON.Box(new CANNON.Vec3(WALL_THICKNESS, WALL_HEIGHT, WALL_DEPTH)),
  });
  leftWall.position.set(-xLimit, centerY, 0);

  const rightWall = new CANNON.Body({
    mass: 0,
    material,
    shape: new CANNON.Box(new CANNON.Vec3(WALL_THICKNESS, WALL_HEIGHT, WALL_DEPTH)),
  });
  rightWall.position.set(xLimit, centerY, 0);

  const backWall = new CANNON.Body({
    mass: 0,
    material,
    shape: new CANNON.Box(new CANNON.Vec3(xLimit, WALL_HEIGHT, WALL_THICKNESS)),
  });
  backWall.position.set(0, centerY, backLimit);

  const frontWall = new CANNON.Body({
    mass: 0,
    material,
    shape: new CANNON.Box(new CANNON.Vec3(xLimit, WALL_HEIGHT, WALL_THICKNESS)),
  });
  frontWall.position.set(0, centerY, frontLimit);

  const bodies = [leftWall, rightWall, backWall, frontWall];
  bodies.forEach((body) => world.addBody(body));

  return { bodies, xLimit, backLimit, frontLimit };
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
      child.geometry.dispose();
      const material = child.material;
      if (Array.isArray(material)) {
        material.forEach((item) => {
          if ("map" in item) item.map?.dispose();
          item.dispose();
        });
      } else {
        if ("map" in material) material.map?.dispose();
        material.dispose();
      }
    }
  });
}

function freezeBody(body: CANNON.Body) {
  body.velocity.set(0, 0, 0);
  body.angularVelocity.set(0, 0, 0);
  body.force.set(0, 0, 0);
  body.torque.set(0, 0, 0);
  body.sleep();
}

function hasSettled(body: CANNON.Body): boolean {
  return (
    body.velocity.length() < SETTLED_LINEAR_SPEED &&
    body.angularVelocity.length() < SETTLED_ANGULAR_SPEED
  );
}

export function DicePhysicsOverlay({
  dice,
  rollKey,
  onResult,
}: DicePhysicsOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  // Keep the latest callback without restarting the throw effect.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (dice.length === 0 || rollKey === 0 || prefersReducedMotion()) return;

    const container = containerRef.current;
    if (!container) return;

    setVisible(true);
    setFading(false);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();
    // Near top-down (aerial) view of the tray, with a slight tilt so the dice
    // keep some thickness. The face pointing up is the one toward the camera,
    // which is exactly what `readUpFaceValue` reads.
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 13, 3.3);
    camera.lookAt(0, TABLE_Y, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x000000, 0);
    container.replaceChildren(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    const keyLight = new THREE.SpotLight(0xfff0c8, 5, 22, Math.PI / 3, 0.5, 1.1);
    keyLight.position.set(2.5, 9, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(ambient, keyLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 26),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.26 }),
    );
    floor.position.y = TABLE_Y;
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -21, 0),
    });
    world.broadphase = new CANNON.NaiveBroadphase();
    world.allowSleep = true;

    const dieMaterial = new CANNON.Material("die");
    const tableMaterial = new CANNON.Material("table");
    const barrierMaterial = new CANNON.Material("barrier");
    world.addContactMaterial(
      new CANNON.ContactMaterial(tableMaterial, dieMaterial, {
        friction: 0.18,
        restitution: 0.48,
      }),
    );
    world.addContactMaterial(
      new CANNON.ContactMaterial(dieMaterial, dieMaterial, {
        friction: 0.1,
        restitution: 0.42,
      }),
    );
    world.addContactMaterial(
      new CANNON.ContactMaterial(barrierMaterial, dieMaterial, {
        friction: 0.04,
        restitution: 0.5,
      }),
    );

    const tableBody = new CANNON.Body({
      mass: 0,
      material: tableMaterial,
      shape: new CANNON.Plane(),
    });
    tableBody.position.set(0, TABLE_Y, 0);
    tableBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(tableBody);
    const bounds = addInvisibleBounds(world, barrierMaterial, width, height);

    const physicalDice: PhysicalDie[] = dice.map((die) => {
      const palette = toneColors[die.tone];
      const model = createVisualDieModel(die.sides, diePalette(die.tone), DIE_RADIUS);
      const mesh = model.mesh;

      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry, 18),
        new THREE.LineBasicMaterial({ color: palette.edge, transparent: true, opacity: 0.28 }),
      );
      mesh.add(edge);

      const body = new CANNON.Body({
        mass: 1,
        material: dieMaterial,
        shape: model.shape,
      });
      // Spawn each die just inside a random point on the tray's edge and fling
      // it across the table toward the opposite side, so it skids and tumbles
      // in from the screen border instead of dropping from above.
      const edgeAngle = Math.random() * Math.PI * 2;
      const spawnX = Math.cos(edgeAngle) * (bounds.xLimit - 0.5);
      const spawnZ = Math.sin(edgeAngle) * (bounds.frontLimit - 0.5);
      body.position.set(spawnX, TABLE_Y + 0.8 + Math.random() * 0.7, spawnZ);

      // Aim back across the table (with random spread) and a small upward toss.
      const aim = edgeAngle + Math.PI + (Math.random() - 0.5) * 0.9;
      const speed = 7.5 + Math.random() * 4.5;
      body.velocity.set(
        Math.cos(aim) * speed,
        1.2 + Math.random() * 1.4,
        Math.sin(aim) * speed,
      );
      body.angularVelocity.set(
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 26,
      );
      body.linearDamping = 0.07;
      body.angularDamping = 0.09;
      world.addBody(body);
      scene.add(mesh);

      return { body, mesh, edge, sides: die.sides, settled: false, calmFrames: 0 };
    });

    let animationFrame = 0;
    let last = performance.now();
    const started = last;
    let fadeTimer = 0;
    let hideTimer = 0;
    let reported = false;

    const reportResult = () => {
      if (reported) return;
      reported = true;
      const values = physicalDice.map(
        (die) => readUpFaceValue(die.mesh, die.sides) ?? 1,
      );
      onResultRef.current?.(values);
      // Fade out a moment after the dice come to rest, so faster rolls clear
      // sooner and longer rolls stay on screen for their whole tumble.
      fadeTimer = window.setTimeout(() => setFading(true), LINGER_MS);
      hideTimer = window.setTimeout(() => {
        setVisible(false);
        setFading(false);
        cleanupScene();
      }, LINGER_MS + FADE_MS);
    };

    const resize = () => {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      renderer.setSize(nextWidth, nextHeight);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);

    const animate = (now: number) => {
      const delta = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      world.step(1 / 60, delta, 3);

      const pastDeadline = now - started > RESULT_READ_DEADLINE_MS;
      let allSettled = true;
      for (const die of physicalDice) {
        die.mesh.position.set(die.body.position.x, die.body.position.y, die.body.position.z);
        die.mesh.quaternion.set(
          die.body.quaternion.x,
          die.body.quaternion.y,
          die.body.quaternion.z,
          die.body.quaternion.w,
        );

        // Let the die come to rest naturally — the face that lands up is the
        // result. We never rotate the mesh or relabel the faces.
        if (!die.settled) {
          if (hasSettled(die.body)) {
            die.calmFrames += 1;
            if (die.calmFrames >= SETTLE_FRAMES) {
              die.settled = true;
              freezeBody(die.body);
            }
          } else {
            die.calmFrames = 0;
          }
        }
        if (!die.settled) allSettled = false;
      }

      renderer.render(scene, camera);

      if (allSettled || pastDeadline) {
        reportResult();
      }

      if (now - started < RENDER_MS) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    let disposed = false;
    const cleanupScene = () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
      window.removeEventListener("resize", resize);
      physicalDice.forEach((die) => {
        world.removeBody(die.body);
        disposeObject(die.mesh);
      });
      bounds.bodies.forEach((body) => world.removeBody(body));
      disposeObject(floor);
      renderer.dispose();
      renderer.domElement.remove();
    };

    animationFrame = requestAnimationFrame(animate);

    return cleanupScene;
  }, [dice, rollKey]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[80] transition-opacity duration-700 ${
        visible && !fading ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
