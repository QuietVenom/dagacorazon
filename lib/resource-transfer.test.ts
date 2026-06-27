import { describe, expect, it } from "vitest";
import { equipmentCategoryGroups, schemas } from "@/lib/creators";
import {
  BREW_FORMAT,
  BREW_VERSION,
  buildBackup,
  countMissingCanvasImages,
  detectResource,
  emptyBrewTemplate,
  extractCanvasBrews,
  serializeBrew,
  type BrewPayload,
} from "@/lib/resource-transfer";
import type { SavedBrew } from "@/lib/storage";

const adversary: BrewPayload = {
  type: "adversary",
  language: "es",
  data: {
    name: "Lobo",
    role: "Bruiser",
    tier: "1",
    hp: "3",
    stress: "2",
    attackRange: "Melee",
    attackType: "Physical",
    attackDamage: "1d8+2",
  },
  traits: [{ name: "Embate", description: "Golpea fuerte", type: "Passive" }],
  segments: [],
  trackers: { health: true, countdown: false, token: false },
};

const environment: BrewPayload = {
  type: "environment",
  language: "es",
  data: {
    name: "Río",
    category: "Event",
    tier: "2",
    difficulty: "14",
    impulses: "Arrastrar",
  },
  traits: [{ name: "Corriente", description: "Empuja", type: "Action" }],
  segments: [],
  trackers: { health: false, countdown: false, token: false },
};

const equipment: BrewPayload = {
  type: "equipment",
  language: "es",
  data: {
    name: "Espada",
    category: "Physical Weapon",
    tier: "1",
    trait: "Agility",
    range: "Melee",
    damage: "1d8+1",
    damageType: "Physical",
    burden: "One-Handed",
  },
  traits: [{ name: "Filo", description: "Afilada", type: "Passive" }],
  segments: [],
  trackers: { health: false, countdown: false, token: false },
};

const colossus: BrewPayload = {
  type: "colossus",
  language: "es",
  data: {
    name: "Ikeri",
    title: "Heridas Incontables",
    tier: "1",
    stress: "6",
    description: "Criatura simiesca",
    motives: "Intimidar",
    size: "29 m",
    thresholds: "11 / 22",
    experience: "Ojos de águila +3",
  },
  traits: [{ name: "Poder colosal", description: "Gana Miedo", type: "Reaction" }],
  segments: [
    {
      name: "Cabeza",
      hp: "5",
      count: 1,
      pluralName: "",
      difficulty: "16",
      attack: {
        modifier: "+2",
        name: "Picotazo",
        range: "Melee",
        damage: "1d10+1",
        damageType: "Physical",
      },
      features: [{ name: "Fatal", description: "Derrota a Ikeri", type: "Passive" }],
      adjacentSegments: ["Torso"],
    },
  ],
  trackers: { health: true, countdown: false, token: false },
};

describe("v2 resource codecs", () => {
  for (const brew of [adversary, environment, equipment, colossus]) {
    it(`round-trips a ${brew.type}`, () => {
      const detected = detectResource(serializeBrew(brew));
      expect(detected.kind).toBe("brew");
      if (detected.kind !== "brew") return;
      expect(detected.payload).toEqual(brew);
    });
  }

  it("writes the common v2 metadata on every type", () => {
    for (const brew of [adversary, environment, equipment, colossus]) {
      const json = JSON.parse(serializeBrew(brew));
      expect(json).toMatchObject({
        format: BREW_FORMAT,
        version: BREW_VERSION,
        type: brew.type,
        language: brew.language,
      });
    }
  });

  it("omits segments from flat contracts", () => {
    for (const brew of [adversary, environment, equipment]) {
      expect(JSON.parse(serializeBrew(brew))).not.toHaveProperty("segments");
    }
  });

  it("keeps traits on adversaries and environments", () => {
    for (const brew of [adversary, environment]) {
      const json = JSON.parse(serializeBrew({ ...brew, traits: [] }));
      expect(json.traits).toEqual([]);
    }
  });

  it("omits empty equipment traits but preserves populated features", () => {
    const empty = JSON.parse(serializeBrew({ ...equipment, traits: [] }));
    const populated = JSON.parse(serializeBrew(equipment));
    expect(empty).not.toHaveProperty("traits");
    expect(populated.traits).toEqual(equipment.traits);
  });

  it("keeps the external colossus shape with metadata and language", () => {
    const json = JSON.parse(serializeBrew(colossus));
    expect(Object.keys(json).sort()).toEqual(
      [
        "format",
        "version",
        "type",
        "language",
        "name",
        "title",
        "tier",
        "description",
        "motives",
        "size",
        "thresholdMinor",
        "thresholdMajor",
        "stress",
        "experiences",
        "features",
        "segments",
        "showStats",
        "countdownTracker",
        "tokenTracker",
      ].sort(),
    );
    expect(json.thresholdMinor).toBe("11");
    expect(json.thresholdMajor).toBe("22");
    expect(json.segments[0].standardAttack.damageType).toBe("phy");
    expect(json).not.toHaveProperty("traits");
  });

  it("uses exact flat keys per type", () => {
    expect(Object.keys(JSON.parse(serializeBrew(adversary))).sort()).toEqual(
      ["data", "format", "language", "trackers", "traits", "type", "version"].sort(),
    );
    expect(Object.keys(JSON.parse(serializeBrew(environment))).sort()).toEqual(
      ["data", "format", "language", "trackers", "traits", "type", "version"].sort(),
    );
    expect(
      Object.keys(JSON.parse(serializeBrew({ ...equipment, traits: [] }))).sort(),
    ).toEqual(
      ["data", "format", "language", "trackers", "type", "version"].sort(),
    );
  });
});

describe("empty templates", () => {
  const schema = (type: BrewPayload["type"]) => {
    const match = schemas.find((candidate) => candidate.id === type);
    if (!match) throw new Error(`missing schema: ${type}`);
    return match;
  };

  it("uses the shared serializer and selected language", () => {
    const adversaryTemplate = JSON.parse(
      emptyBrewTemplate("adversary", schema("adversary").fields, "pt-br"),
    );
    expect(adversaryTemplate).toMatchObject({
      format: BREW_FORMAT,
      version: BREW_VERSION,
      type: "adversary",
      language: "pt-br",
      traits: [{ name: "", description: "", type: "Passive" }],
    });
    expect(adversaryTemplate).not.toHaveProperty("segments");

    const colossusTemplate = JSON.parse(
      emptyBrewTemplate("colossus", schema("colossus").fields, "es"),
    );
    expect(colossusTemplate).toMatchObject({
      type: "colossus",
      language: "es",
      features: [{ title: "", description: "", type: "Passive" }],
      segments: [
        {
          name: "",
          count: 1,
          pluralName: "",
          difficulty: "",
          hp: "",
          standardAttack: {
            modifier: "",
            name: "",
            range: "Melee",
            damage: "",
            damageType: "phy",
          },
          features: [{ title: "", description: "", type: "Passive" }],
          adjacentSegments: [],
          adjacentSegmentsText: "",
        },
      ],
    });
  });

  it("documents the environment trait shape", () => {
    const environmentTemplate = JSON.parse(
      emptyBrewTemplate("environment", schema("environment").fields, "es"),
    );
    expect(environmentTemplate.traits).toEqual([
      { name: "", description: "", type: "Passive" },
    ]);
    expect(environmentTemplate).not.toHaveProperty("segments");
  });

  for (const group of equipmentCategoryGroups) {
    it(`filters the equipment template for ${group.id}`, () => {
      const equipmentSchema = schema("equipment");
      const category = group.values[0];
      const json = JSON.parse(
        emptyBrewTemplate("equipment", equipmentSchema.fields, "es", category),
      );
      const expectedKeys = equipmentSchema.fields
        .filter(
          (field) =>
            !field.categories || field.categories.includes(category),
        )
        .map((field) => field.key);

      expect(json.data.category).toBe(category);
      expect(Object.keys(json.data).sort()).toEqual(expectedKeys.sort());
      expect(json).not.toHaveProperty("traits");
      expect(json).not.toHaveProperty("segments");
    });
  }
});

describe("compatibility and validation", () => {
  it("accepts the legacy v1 wrapper and ignores inapplicable arrays", () => {
    const legacy = JSON.stringify({
      format: BREW_FORMAT,
      version: 1,
      brew: {
        type: "adversary",
        data: { name: "Viejo" },
        traits: [],
        segments: [{ name: "extra", hp: "1" }],
        trackers: {},
      },
    });
    const detected = detectResource(legacy);
    expect(detected.kind).toBe("brew");
    if (detected.kind !== "brew") return;
    expect(detected.payload.data.name).toBe("Viejo");
    expect(detected.payload.segments).toEqual([]);
  });

  it("accepts an unversioned colossus without type or language", () => {
    const detected = detectResource(
      JSON.stringify({
        name: "Antiguo",
        thresholdMinor: "5",
        thresholdMajor: "10",
        features: [],
        segments: [],
      }),
    );
    expect(detected.kind).toBe("brew");
    if (detected.kind !== "brew") return;
    expect(detected.payload.type).toBe("colossus");
    expect(detected.payload.language).toBeUndefined();
    expect(detected.payload.data.thresholds).toBe("5 / 10");
  });

  it("rejects future versions", () => {
    expect(() =>
      detectResource(
        JSON.stringify({
          format: BREW_FORMAT,
          version: BREW_VERSION + 1,
          type: "adversary",
          language: "es",
        }),
      ),
    ).toThrow("unsupported-version");
  });

  it("requires type and language in v2", () => {
    expect(() =>
      detectResource(
        JSON.stringify({ format: BREW_FORMAT, version: BREW_VERSION }),
      ),
    ).toThrow("invalid-brew-type");
    expect(() =>
      detectResource(
        JSON.stringify({
          format: BREW_FORMAT,
          version: BREW_VERSION,
          type: "adversary",
          data: {},
        }),
      ),
    ).toThrow("invalid-brew-language");
  });

  it("throws on invalid or unrecognized JSON", () => {
    expect(() => detectResource("not json")).toThrow("invalid-json");
    expect(() => detectResource(JSON.stringify({ hello: "world" }))).toThrow(
      "unrecognized",
    );
  });
});

describe("enum normalization", () => {
  it("normalizes Spanish and Portuguese enum values on import", () => {
    const inputs = [
      {
        type: "adversary",
        data: {
          role: "Bruto",
          attackRange: "Cuerpo a cuerpo",
          attackType: "Físico",
        },
        traits: [{ name: "X", description: "", type: "Pasiva" }],
      },
      {
        type: "environment",
        data: { category: "Travessia" },
        traits: [{ name: "X", description: "", type: "Ação" }],
      },
      {
        type: "equipment",
        data: {
          category: "Arma mágica",
          trait: "Fuerza",
          range: "Cuerpo a cuerpo",
          damageType: "Mágico",
          burden: "Una mano",
        },
      },
    ];

    const [normalizedAdversary, normalizedEnvironment, normalizedEquipment] =
      inputs.map((input) => {
        const detected = detectResource(JSON.stringify(input));
        expect(detected.kind).toBe("brew");
        if (detected.kind !== "brew") throw new Error("expected brew");
        return detected.payload;
      });

    expect(normalizedAdversary.data).toMatchObject({
      role: "Bruiser",
      attackRange: "Melee",
      attackType: "Physical",
    });
    expect(normalizedAdversary.traits[0].type).toBe("Passive");
    expect(normalizedEnvironment.data.category).toBe("Traversal");
    expect(normalizedEnvironment.traits[0].type).toBe("Action");
    expect(normalizedEquipment.data).toMatchObject({
      category: "Magic Weapon",
      trait: "Strength",
      range: "Melee",
      damageType: "Magical",
      burden: "One-Handed",
    });
  });
});

describe("backup and canvas helpers", () => {
  it("recognizes a canvas session", () => {
    const source = JSON.stringify({
      format: "dagacorazon-lienzo",
      version: 1,
      session: { name: "Mesa 1", elements: [] },
    });
    const detected = detectResource(source);
    expect(detected.kind).toBe("canvas");
    if (detected.kind === "canvas") expect(detected.name).toBe("Mesa 1");
  });

  it("keeps backup version 1 and restores brews by id", () => {
    const saved: SavedBrew = { ...adversary, id: "abc", savedAt: "2020-01-01" };
    const backup = buildBackup([saved], []);
    expect(JSON.parse(backup).version).toBe(1);
    const detected = detectResource(backup);
    expect(detected.kind).toBe("backup");
    if (detected.kind === "backup") expect(detected.brews[0].id).toBe("abc");
  });

  const canvasWithStatblockAndBrokenImage = JSON.stringify({
    format: "dagacorazon-lienzo",
    version: 1,
    session: {
      name: "Encuentro",
      elements: [
        {
          kind: "statblock",
          name: "Goblin",
          statblock: {
            brewType: "adversary",
            data: { name: "Goblin", role: "Minion" },
            traits: [],
            segments: [],
            trackers: { health: true, countdown: false, token: false },
          },
        },
        { kind: "image", name: "mapa", image: "broken" },
      ],
    },
  });

  it("extracts canvas brews without changing the snapshot format", () => {
    const brews = extractCanvasBrews(canvasWithStatblockAndBrokenImage);
    expect(brews).toHaveLength(1);
    expect(brews[0].payload.type).toBe("adversary");
    expect(brews[0].name).toBe("Goblin");
  });

  it("counts missing canvas images", () => {
    expect(countMissingCanvasImages(canvasWithStatblockAndBrokenImage)).toBe(1);
  });
});
