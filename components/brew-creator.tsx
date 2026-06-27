"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  attackRangeOptions,
  attackTypeOptions,
} from "@/lib/adversary-attack";
import { toPng } from "html-to-image";
import { t, ui, useLanguage, type LocalizedText } from "@/lib/i18n";
import {
  type CreatorField,
  type CreatorSchema,
} from "@/lib/creators";
import { useBrews, type SavedBrew, type SavedSegment } from "@/lib/storage";
import type { ResourceLanguage } from "@/lib/resource-types";
import {
  emptySegment,
  emptySegmentAttack,
  segmentCount,
} from "@/lib/colossus";
import { normalizeBrewData } from "@/lib/brew-normalization";
import { featureTypeLabel, featureTypeOptions } from "@/lib/feature-types";
import {
  featureTitle,
  instantiateFeature,
  type FeatureLibrary,
} from "@/lib/feature-library";
import { adversaryFeatures } from "@/lib/adversary-features";
import { colossusFeatures } from "@/lib/colossus-features";
import { useCanvas } from "@/lib/canvas";
import { isValidDamage, normalizeDamage } from "@/lib/dice";
import { emptyTrackerState, type Trait, type TrackerConfig } from "@/lib/types";
import { Statblock } from "@/components/statblock";
import { SegmentCard } from "@/components/segment-card";
import { Collapsible } from "@/components/collapsible";
import { InfoModal, ValueHelp } from "@/components/info-popovers";
import {
  moduleInfo,
  valueExplanationFor,
  fieldHasExplanations,
} from "@/lib/information";
import { detectResource, serializeBrew } from "@/lib/resource-transfer";
import { useResourcePicker } from "@/lib/use-resource-picker";
import { TrashIcon, DownloadIcon, PlusIcon, ImageIcon, MapIcon } from "@/components/icons";

const texts = {
  saved: { es: "Guardado en tu taller ✓", pt: "Salvo na sua oficina ✓" },
  library: { es: "Biblioteca", pt: "Biblioteca" },
  emptyLibrary: {
    es: "Aún no has guardado ninguno.",
    pt: "Você ainda não salvou nenhum.",
  },
  load: { es: "Cargar", pt: "Carregar" },
  segment: { es: "Segmento", pt: "Segmento" },
  segments: { es: "Segmentos del coloso", pt: "Segmentos do colosso" },
  segmentName: { es: "Nombre del segmento", pt: "Nome do segmento" },
  segmentCount: { es: "Cantidad", pt: "Quantidade" },
  pluralName: { es: "Nombre plural", pt: "Nome plural" },
  difficulty: { es: "Dificultad", pt: "Dificuldade" },
  standardAttack: { es: "Ataque estándar", pt: "Ataque padrão" },
  attackModifier: { es: "Modificador", pt: "Modificador" },
  attackName: { es: "Nombre del ataque", pt: "Nome do ataque" },
  range: { es: "Rango", pt: "Alcance" },
  damage: { es: "Daño", pt: "Dano" },
  damageType: { es: "Tipo de daño", pt: "Tipo de dano" },
  segmentFeatures: { es: "Rasgos del segmento", pt: "Características do segmento" },
  featureType: { es: "Tipo", pt: "Tipo" },
  adjacent: { es: "Segmentos adyacentes", pt: "Segmentos adjacentes" },
  importJson: { es: "Importar JSON", pt: "Importar JSON" },
  imported: { es: "Importado ✓", pt: "Importado ✓" },
  importInvalidJson: {
    es: "El archivo no es un JSON válido.",
    pt: "O arquivo não é um JSON válido.",
  },
  importUnsupportedVersion: {
    es: "Esta versión del archivo todavía no es compatible.",
    pt: "Esta versão do arquivo ainda não é compatível.",
  },
  importWrongType: {
    es: "El archivo pertenece a otro tipo de objeto.",
    pt: "O arquivo pertence a outro tipo de objeto.",
  },
  importInvalidResource: {
    es: "El archivo no contiene un objeto compatible del Taller.",
    pt: "O arquivo não contém um objeto compatível da Oficina.",
  },
  invalidDamage: {
    es: "Formato no válido. Dados: d4, d6, d8, d10, d12, d20 (p. ej. 1d8+3).",
    pt: "Formato inválido. Dados: d4, d6, d8, d10, d12, d20 (ex. 1d8+3).",
  },
  emptyPreview: {
    es: "Empieza a escribir y tu creación tomará forma aquí.",
    pt: "Comece a escrever e sua criação tomará forma aqui.",
  },
  startFrom: { es: "Empezar desde", pt: "Começar de" },
  fromScratch: { es: "— Desde cero —", pt: "— Do zero —" },
  contentLanguage: { es: "Idioma del contenido", pt: "Idioma do conteúdo" },
  languageFilter: { es: "Idioma", pt: "Idioma" },
  allTab: { es: "Todos", pt: "Todos" },
  result: { es: "resultado", pt: "resultado" },
  results: { es: "resultados", pt: "resultados" },
  trackersTitle: { es: "Contadores", pt: "Contadores" },
  healthTracker: { es: "Salud / Estrés", pt: "Vida / Estresse" },
  countdownTracker: { es: "Cuenta atrás", pt: "Contagem regressiva" },
  tokenTracker: { es: "Fichas", pt: "Fichas" },
  saveImage: { es: "Guardar imagen", pt: "Salvar imagem" },
  addToCanvas: { es: "Enviar a la Mesa", pt: "Enviar para a Mesa" },
  sentToCanvas: { es: "Enviado a la Mesa ✓", pt: "Enviado para a Mesa ✓" },
};

/** Display labels for content languages (codes, not translatable prose). */
const RESOURCE_LANGUAGE_LABELS: Record<ResourceLanguage, string> = {
  en: "EN",
  es: "ES",
  "pt-br": "PT-BR",
};

/** Localized names for the content-language picker in the form. */
const CONTENT_LANGUAGE_OPTIONS: { value: ResourceLanguage; label: LocalizedText }[] = [
  { value: "es", label: { es: "Español", pt: "Espanhol" } },
  { value: "pt-br", label: { es: "Portugués (BR)", pt: "Português (BR)" } },
  { value: "en", label: { es: "Inglés", pt: "Inglês" } },
];

const fieldClasses =
  "w-full rounded-lg border border-edge bg-field px-3.5 py-2.5 font-body text-[15px] text-bone placeholder:italic placeholder:text-haze focus:border-gold-dim focus:shadow-[0_0_0_3px_rgba(212,168,67,0.1)] focus:outline-none transition-[border-color,box-shadow]";

// Compact filter dropdowns for the resource picker (intrinsic width, not full).
const facetClasses =
  "cursor-pointer rounded-lg border border-edge bg-field px-3 py-1.5 font-body text-[13px] text-bone focus:border-gold-dim focus:outline-none";

function getOptionLabel(field: CreatorField, value: string, language: "es" | "pt") {
  const option = field.options?.find((item) => item.value === value);
  return option ? t(option.label, language) : value;
}

/** Labelled on/off switch. */
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-bone select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-gold" : "bg-edge"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-abyss transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
      <span>{label}</span>
    </label>
  );
}

/**
 * Damage text input: normalizes ("1 d 8 + 3" → "1d8+3") on blur and flags an
 * invalid format once the field has been touched.
 */
function DamageInput({
  id,
  value,
  onChange,
  placeholder,
  className,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const { language } = useLanguage();
  const [touched, setTouched] = useState(false);
  const invalid = touched && !isValidDamage(value);
  return (
    <>
      <input
        id={id}
        className={`${className ?? fieldClasses} ${invalid ? "border-blood/70 focus:border-blood focus:shadow-none" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          setTouched(true);
          const normalized = normalizeDamage(value);
          if (normalized !== value) onChange(normalized);
        }}
      />
      {invalid && (
        <p className="mt-1 text-[11px] text-blood-bright">{t(texts.invalidDamage, language)}</p>
      )}
    </>
  );
}

function Field({
  field,
  value,
  onChange,
  schemaId,
}: {
  field: CreatorField;
  value: string;
  onChange: (v: string) => void;
  schemaId: string;
}) {
  const { language } = useLanguage();
  const id = `field-${field.key}`;
  const placeholder = field.placeholder ? t(field.placeholder, language) : undefined;
  // Per-value directed explanations (e.g. an adversary's role).
  const showHelp = fieldHasExplanations(schemaId, field.key);
  const explanation = valueExplanationFor(schemaId, field.key, value);
  const selectedOption = field.options?.find((o) => o.value === value);
  const helpLabel = selectedOption ? t(selectedOption.label, language) : t(field.label, language);

  return (
    <div className={field.width === "full" ? "col-span-2" : "col-span-2 sm:col-span-1"}>
      <div className="mb-1.5 flex items-center gap-2">
        <label
          htmlFor={id}
          className="block font-display text-[11px] font-semibold tracking-wider text-mist uppercase"
        >
          {t(field.label, language)}
        </label>
        {showHelp && (
          <ValueHelp
            label={helpLabel}
            explanation={explanation ? t(explanation, language) : undefined}
          />
        )}
      </div>
      {field.type === "textarea" ? (
        <textarea
          id={id}
          className={`${fieldClasses} min-h-20 resize-y leading-relaxed`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          className={`${fieldClasses} cursor-pointer`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.label, language)}
            </option>
          ))}
        </select>
      ) : field.damage ? (
        <DamageInput id={id} value={value} onChange={onChange} placeholder={placeholder} />
      ) : (
        <input
          id={id}
          className={fieldClasses}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function TraitsEditor({
  traits,
  setTraits,
  withType,
  title,
  contentLanguage,
  featureLibrary,
}: {
  traits: Trait[];
  setTraits: (r: Trait[]) => void;
  /** Show a Passive/Action/Reaction type select per feature. */
  withType?: boolean;
  title?: string;
  contentLanguage: ResourceLanguage;
  /** Optional recommendations the user can start a trait from. */
  featureLibrary?: FeatureLibrary;
}) {
  const { language } = useLanguage();
  const update = (i: number, patch: Partial<Trait>) =>
    setTraits(traits.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <fieldset className="mt-5 rounded-lg border border-edge bg-ink p-4">
      <legend className="flex items-center gap-3 px-1 font-display text-sm font-semibold text-gold">
        {title ?? t(ui.traits, language)}
      </legend>
      {traits.map((trait, i) => (
        <div key={i} className="mb-2.5 flex gap-2.5 rounded-lg bg-field p-2.5">
          <div className="flex flex-1 flex-col gap-2">
            {featureLibrary && (
              <div>
                <label
                  htmlFor={`recommendation-${i}`}
                  className="mb-1 block font-display text-[10px] font-semibold tracking-wider text-mist uppercase"
                >
                  {featureLibrary.label[contentLanguage]}
                </label>
                <select
                  id={`recommendation-${i}`}
                  className={`${fieldClasses} cursor-pointer border-gold-dim/50`}
                  value={trait.libraryId ?? ""}
                  onChange={(e) => {
                    const template = featureLibrary.templates.find(
                      (item) => item.id === e.target.value,
                    );
                    if (template) {
                      update(i, instantiateFeature(template, contentLanguage));
                    } else {
                      update(i, { libraryId: undefined });
                    }
                  }}
                >
                  <option value="">{featureLibrary.choose[contentLanguage]}</option>
                  {featureLibrary.groups.map((group) => {
                    const options = featureLibrary.templates.filter(
                      (item) => item.group === group.key,
                    );
                    if (options.length === 0) return null;
                    return (
                      <optgroup key={group.key} label={group.label[contentLanguage]}>
                        {options.map((option) => (
                          <option key={option.id} value={option.id}>
                            {featureTitle(option, contentLanguage)} ·{" "}
                            {featureTypeLabel(option.type, contentLanguage)}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <input
                className={`${fieldClasses} flex-1`}
                aria-label={t(ui.traitName, language)}
                placeholder={t(ui.traitName, language)}
                value={trait.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              {withType && (
                <select
                  className={`${fieldClasses} max-w-40 cursor-pointer`}
                  aria-label={t(texts.featureType, language)}
                  value={trait.type ?? ""}
                  onChange={(e) => update(i, { type: e.target.value })}
                >
                  <option value="">
                    {contentLanguage === "en"
                      ? "Type"
                      : contentLanguage === "es"
                        ? "Tipo"
                        : "Tipo"}
                  </option>
                  {featureTypeOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {featureTypeLabel(o.value, contentLanguage)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <textarea
              className={`${fieldClasses} min-h-14 resize-y text-sm`}
              aria-label={t(ui.traitDesc, language)}
              placeholder={t(ui.traitDesc, language)}
              value={trait.description}
              onChange={(e) => update(i, { description: e.target.value })}
            />
          </div>
          <button
            onClick={() => setTraits(traits.filter((_, j) => j !== i))}
            aria-label={t(ui.remove, language)}
            className="mt-1 h-fit rounded p-1.5 text-haze transition-colors hover:bg-blood/15 hover:text-blood-bright"
          >
            <TrashIcon />
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          setTraits([
            ...traits,
            { name: "", description: "", ...(withType ? { type: "" } : {}) },
          ])
        }
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-gold-dim bg-gold/8 px-3.5 py-2 font-display text-[11px] font-semibold tracking-wide text-gold transition-colors hover:bg-gold/15"
      >
        <PlusIcon /> {t(ui.add, language)}
      </button>
    </fieldset>
  );
}

/** Compact label above an input, in the segment editor. */
const segLabel = "mb-1 block font-display text-[10px] font-semibold tracking-wider text-mist uppercase";

/** A stepper for the segment copy count. */
function CountStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex w-fit items-center overflow-hidden rounded-lg border border-edge bg-field">
      <button
        type="button"
        aria-label="−"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="px-3 py-2 text-mist hover:bg-white/5"
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm font-bold text-bone">{value}</span>
      <button
        type="button"
        aria-label="+"
        onClick={() => onChange(Math.min(20, value + 1))}
        className="px-3 py-2 text-mist hover:bg-white/5"
      >
        +
      </button>
    </div>
  );
}

/** Rich editor for one colossus segment: count, stats, attack, features, adjacency. */
function SegmentsEditor({
  segments,
  setSegments,
  contentLanguage,
}: {
  segments: SavedSegment[];
  setSegments: (s: SavedSegment[]) => void;
  contentLanguage: ResourceLanguage;
}) {
  const { language } = useLanguage();
  const update = (i: number, patch: Partial<SavedSegment>) =>
    setSegments(segments.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const updateAttack = (i: number, patch: Partial<SavedSegment["attack"] & object>) =>
    update(i, { attack: { ...emptySegmentAttack(), ...segments[i].attack, ...patch } });
  const toggleAdjacent = (i: number, name: string) => {
    const current = segments[i].adjacentSegments ?? [];
    update(i, {
      adjacentSegments: current.includes(name)
        ? current.filter((n) => n !== name)
        : [...current, name],
    });
  };

  return (
    <fieldset className="mt-5 rounded-lg border border-edge bg-ink p-4">
      <legend className="px-1 font-display text-sm font-semibold text-gold">
        {t(texts.segments, language)}
      </legend>
      {segments.map((seg, i) => {
        const count = segmentCount(seg);
        const others = segments.filter((_, j) => j !== i && segments[j].name).map((s) => s.name);
        const adjacent = seg.adjacentSegments ?? [];
        return (
          <div key={i} className="mb-3 rounded-lg border border-edge bg-field/40 p-3">
            <div className="mb-2 flex items-start gap-2">
              <div className="flex-1">
                <label className={segLabel}>{t(texts.segmentName, language)}</label>
                <input
                  className={fieldClasses}
                  placeholder={t(texts.segmentName, language)}
                  value={seg.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                />
              </div>
              <button
                onClick={() => setSegments(segments.filter((_, j) => j !== i))}
                aria-label={t(ui.remove, language)}
                className="mt-5 rounded p-1.5 text-haze transition-colors hover:bg-blood/15 hover:text-blood-bright"
              >
                <TrashIcon />
              </button>
            </div>

            <div className="mb-2 flex flex-wrap gap-3">
              <div>
                <label className={segLabel}>{t(texts.segmentCount, language)}</label>
                <CountStepper value={count} onChange={(n) => update(i, { count: n })} />
              </div>
              {count > 1 && (
                <div className="flex-1">
                  <label className={segLabel}>{t(texts.pluralName, language)}</label>
                  <input
                    className={fieldClasses}
                    placeholder={t(texts.pluralName, language)}
                    value={seg.pluralName ?? ""}
                    onChange={(e) => update(i, { pluralName: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="mb-2 grid grid-cols-2 gap-3">
              <div>
                <label className={segLabel}>{t(texts.difficulty, language)}</label>
                <input
                  className={fieldClasses}
                  value={seg.difficulty ?? ""}
                  onChange={(e) => update(i, { difficulty: e.target.value })}
                />
              </div>
              <div>
                <label className={segLabel}>PG</label>
                <input
                  className={fieldClasses}
                  value={seg.hp}
                  onChange={(e) => update(i, { hp: e.target.value })}
                />
              </div>
            </div>

            {/* Standard attack — independent fields */}
            <div className="mb-2 rounded-lg border border-edge bg-ink/50 p-2.5">
              <p className="mb-2 font-display text-[10px] font-semibold tracking-wider text-mist uppercase">
                {t(texts.standardAttack, language)}
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div>
                  <label className={segLabel}>{t(texts.attackModifier, language)}</label>
                  <input
                    className={fieldClasses}
                    placeholder="+2"
                    value={seg.attack?.modifier ?? ""}
                    onChange={(e) => updateAttack(i, { modifier: e.target.value })}
                  />
                </div>
                <div>
                  <label className={segLabel}>{t(texts.attackName, language)}</label>
                  <input
                    className={fieldClasses}
                    placeholder="Stomp"
                    value={seg.attack?.name ?? ""}
                    onChange={(e) => updateAttack(i, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={segLabel}>{t(texts.range, language)}</label>
                  <select
                    className={`${fieldClasses} cursor-pointer`}
                    value={seg.attack?.range ?? ""}
                    onChange={(e) => updateAttack(i, { range: e.target.value })}
                  >
                    <option value="">—</option>
                    {attackRangeOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {t(o.label, language)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={segLabel}>{t(texts.damage, language)}</label>
                  <DamageInput
                    value={seg.attack?.damage ?? ""}
                    onChange={(v) => updateAttack(i, { damage: v })}
                    placeholder="4d8 + 10"
                  />
                </div>
                <div>
                  <label className={segLabel}>{t(texts.damageType, language)}</label>
                  <select
                    className={`${fieldClasses} cursor-pointer`}
                    value={seg.attack?.damageType ?? ""}
                    onChange={(e) => updateAttack(i, { damageType: e.target.value })}
                  >
                    <option value="">—</option>
                    {attackTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {t(o.label, language)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <TraitsEditor
              traits={seg.features ?? []}
              setTraits={(f) => update(i, { features: f })}
              withType
              title={t(texts.segmentFeatures, language)}
              contentLanguage={contentLanguage}
              featureLibrary={colossusFeatures}
            />

            {others.length > 0 && (
              <div className="mt-2">
                <label className={segLabel}>{t(texts.adjacent, language)}</label>
                <div className="flex flex-wrap gap-1.5">
                  {others.map((name) => {
                    const on = adjacent.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleAdjacent(i, name)}
                        aria-pressed={on}
                        className={`rounded-full border px-2.5 py-1 text-[12px] transition-colors ${
                          on
                            ? "border-gold-dim/60 bg-gold/15 text-gold"
                            : "border-edge text-haze hover:text-bone"
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <button
        onClick={() => setSegments([...segments, emptySegment()])}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-gold-dim bg-gold/8 px-3.5 py-2 font-display text-[11px] font-semibold tracking-wide text-gold transition-colors hover:bg-gold/15"
      >
        <PlusIcon /> {t(texts.segment, language)}
      </button>
    </fieldset>
  );
}

export function BrewCreator({ schema }: { schema: CreatorSchema }) {
  const { language } = useLanguage();
  const [data, setData] = useState<Record<string, string>>({});
  const [traits, setTraits] = useState<Trait[]>([]);
  const [segments, setSegments] = useState<SavedSegment[]>([]);
  const [currentId, setCurrentId] = useState<string | undefined>();
  const [savedNotice, setSavedNotice] = useState(false);
  const [canvasNotice, setCanvasNotice] = useState(false);
  const [importNotice, setImportNotice] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addElement } = useCanvas();
  // Statblocks with HP/Stress fields default to showing health trackers.
  const hasVitals = schema.fields.some((f) => f.key === "hp" || f.key === "stress");
  const [trackers, setTrackers] = useState<TrackerConfig>({
    health: hasVitals,
    countdown: false,
    token: false,
  });
  const { brews, save: saveToStorage, remove } = useBrews();
  const normalizeData = useCallback(
    (value: Record<string, string>) => normalizeBrewData(schema.id, value),
    [schema.id],
  );
  const normalizedData = useMemo(() => normalizeData(data), [data, normalizeData]);

  const preferredLanguage: ResourceLanguage = language === "pt" ? "pt-br" : "es";
  // Language this creation is written in (saved on the brew, filterable in the
  // library). null = follow the UI default until the user picks or loads one.
  const [brewLanguage, setBrewLanguage] = useState<ResourceLanguage | null>(null);
  const contentLanguage: ResourceLanguage = brewLanguage ?? preferredLanguage;
  const updateField = (key: string, value: string) =>
    setData((current) => normalizeData({ ...current, [key]: value }));

  // ── Category tabs (grouped creators, e.g. equipment) ──
  // The active tab segments both the picker and the library, and decides which
  // category-scoped filters are relevant. "all" = no category constraint.
  const groups = schema.groups;
  const groupField = groups?.field ?? "";
  const [activeTab, setActiveTab] = useState("all");
  const activeTabValues = useMemo(() => {
    if (!groups || activeTab === "all") return [] as string[];
    return groups.tabs.find((tab) => tab.id === activeTab)?.values ?? [];
  }, [groups, activeTab]);
  const {
    facetFields,
    facetOptions,
    facets,
    filteredResources,
    hasResourcePicker,
    inActiveTab,
    resourceLanguage,
    resourceLanguages,
    selectedResource,
    setFacets,
    setPickedLanguage,
    setSelectedResource,
    resetResourceSelection,
  } = useResourcePicker({
    schema,
    language,
    normalizeData,
    activeTabValues,
    groupField,
  });

  const saved = useMemo(
    () =>
      brews
        .filter((b) => b.type === schema.id)
        .map((brew) => ({ ...brew, data: normalizeData(brew.data) })),
    [brews, normalizeData, schema.id],
  );
  const visibleSaved = useMemo(
    () => saved.filter((b) => inActiveTab(b.data)),
    [saved, inActiveTab],
  );
  // Library filters: same filterable fields, options drawn from saved brews.
  const [libraryFacets, setLibraryFacets] = useState<Record<string, string>>({});
  const [libraryLanguage, setLibraryLanguage] = useState("");
  const libraryFacetOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const field of facetFields) {
      const values = [...new Set(visibleSaved.map((b) => b.data[field.key]).filter(Boolean))];
      values.sort((a, b) => {
        const na = Number(a);
        const nb = Number(b);
        return !isNaN(na) && !isNaN(nb) ? na - nb : a.localeCompare(b);
      });
      map[field.key] = values;
    }
    return map;
  }, [facetFields, visibleSaved]);
  // Languages actually present among saved brews, in canonical order.
  const libraryLanguageOptions = useMemo(() => {
    const present = new Set(visibleSaved.map((b) => b.language).filter(Boolean));
    return (["en", "es", "pt-br"] as ResourceLanguage[]).filter((l) => present.has(l));
  }, [visibleSaved]);
  const filteredSaved = useMemo(
    () =>
      visibleSaved.filter(
        (b) =>
          (!libraryLanguage || b.language === libraryLanguage) &&
          facetFields.every((f) => !libraryFacets[f.key] || b.data[f.key] === libraryFacets[f.key]),
      ),
    [visibleSaved, facetFields, libraryFacets, libraryLanguage],
  );

  const save = () => {
    const brew = saveToStorage({
      id: currentId,
      type: schema.id,
      data: normalizedData,
      traits,
      segments,
      trackers,
      language: contentLanguage,
    });
    setCurrentId(brew.id);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const load = (b: SavedBrew) => {
    setData(normalizeData(b.data));
    setTraits(b.traits);
    setSegments(b.segments);
    setTrackers(b.trackers ?? { health: hasVitals, countdown: false, token: false });
    setBrewLanguage(b.language ?? null);
    setCurrentId(b.id);
  };

  const exportJson = () => {
    // Single source of truth for the file shape (colossus external / flat).
    const contents = serializeBrew({
      type: schema.id,
      language: contentLanguage,
      data: normalizedData,
      traits,
      segments,
      trackers,
    });
    const blob = new Blob([contents], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${data.name || schema.id}.${schema.id === "colossus" ? "colossus.json" : "json"}`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importJson = async (file: File) => {
    setImportError(null);
    setImportNotice(false);
    try {
      const detected = detectResource(await file.text());
      if (detected.kind !== "brew") throw new Error("invalid-resource-kind");
      if (detected.payload.type !== schema.id) throw new Error("invalid-brew-type");

      setData(normalizeData(detected.payload.data));
      setTraits(detected.payload.traits);
      setSegments(detected.payload.segments);
      setTrackers(detected.payload.trackers);
      setBrewLanguage(detected.payload.language ?? null);
      setCurrentId(undefined);
      setImportNotice(true);
      setTimeout(() => setImportNotice(false), 2500);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unrecognized";
      const message =
        reason === "invalid-json"
          ? texts.importInvalidJson
          : reason === "unsupported-version"
            ? texts.importUnsupportedVersion
            : reason === "invalid-brew-type"
              ? texts.importWrongType
              : texts.importInvalidResource;
      setImportError(t(message, language));
    }
  };

  const saveImage = async () => {
    if (!cardRef.current) return;
    const url = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.name || schema.id}.png`;
    link.click();
  };

  const addToCanvas = () => {
    addElement({
      kind: "statblock",
      name: normalizedData.name || schema.id,
      x: 300 + Math.random() * 80,
      y: 240 + Math.random() * 80,
      statblock: {
        brewType: schema.id,
        data: normalizedData,
        traits,
        segments,
        trackers,
        language: contentLanguage,
      },
      trackerState: emptyTrackerState(),
    });
    setCanvasNotice(true);
    setTimeout(() => setCanvasNotice(false), 2500);
  };

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 py-8 lg:grid-cols-[1fr_340px]">
      <main className="animate-fade-in">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold">{t(schema.title, language)}</h1>
          <InfoModal
            title={t(schema.title, language)}
            content={t(moduleInfo[schema.id], language)}
          />
        </div>
        <p className="mt-1 mb-5 text-[15px] text-mist">{t(schema.subtitle, language)}</p>

        {groups && (
          <div className="mb-6 flex flex-wrap gap-1.5 border-b border-edge pb-3">
            {[{ id: "all", label: texts.allTab }, ...groups.tabs].map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={activeTab === tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  resetResourceSelection();
                  setLibraryFacets({});
                  setLibraryLanguage("");
                }}
                className={`rounded-lg border px-3.5 py-1.5 font-display text-[12px] font-semibold tracking-wide uppercase transition-colors ${
                  activeTab === tab.id
                    ? "border-gold-dim/60 bg-gold/12 text-gold"
                    : "border-transparent text-haze hover:text-bone"
                }`}
              >
                {t(tab.label, language)}
              </button>
            ))}
          </div>
        )}

        {visibleSaved.length > 0 && (
          <div className="mb-6 rounded-lg border border-edge bg-ink/60 p-3">
            <Collapsible
              title={`${t(texts.library, language)} · ${t(schema.title, language)}`}
              count={visibleSaved.length}
            >
              {(facetFields.length > 0 || libraryLanguageOptions.length > 0) && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {facetFields.map((field) => (
                    <select
                      key={field.key}
                      aria-label={t(field.label, language)}
                      className={facetClasses}
                      value={libraryFacets[field.key] ?? ""}
                      onChange={(e) =>
                        setLibraryFacets((f) => ({ ...f, [field.key]: e.target.value }))
                      }
                    >
                      <option value="">{t(field.label, language)}</option>
                      {libraryFacetOptions[field.key]?.map((value) => (
                        <option key={value} value={value}>
                          {getOptionLabel(field, value, language)}
                        </option>
                      ))}
                    </select>
                  ))}
                  {libraryLanguageOptions.length > 0 && (
                    <select
                      aria-label={t(texts.languageFilter, language)}
                      className={facetClasses}
                      value={libraryLanguage}
                      onChange={(e) => setLibraryLanguage(e.target.value)}
                    >
                      <option value="">{t(texts.languageFilter, language)}</option>
                      {libraryLanguageOptions.map((lang) => (
                        <option key={lang} value={lang}>
                          {RESOURCE_LANGUAGE_LABELS[lang]}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              <ul className="max-h-64 space-y-1.5 overflow-y-auto">
                {filteredSaved.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-edge bg-ink px-3 py-2 text-sm"
                  >
                    <span className="truncate text-bone">
                      {b.data.name || `(${t(schema.title, language)})`}
                    </span>
                    <span className="flex shrink-0 gap-1">
                      <button
                        onClick={() => load(b)}
                        className="rounded px-2 py-0.5 text-xs text-gold hover:bg-gold/10"
                      >
                        {t(texts.load, language)}
                      </button>
                      <button
                        onClick={() => remove(b.id)}
                        aria-label={t(ui.remove, language)}
                        className="rounded p-1 text-haze hover:bg-blood/15 hover:text-blood-bright"
                      >
                        <TrashIcon />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </Collapsible>
          </div>
        )}

        {hasResourcePicker && (
          <div className="mb-5">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="start-from"
                className="font-display text-[11px] font-semibold tracking-wider text-gold uppercase"
              >
                {t(texts.startFrom, language)}
              </label>
              {resourceLanguages.length > 1 && (
                <div
                  className="flex rounded-md border border-edge text-[10px] font-semibold"
                  role="group"
                  aria-label={t(texts.contentLanguage, language)}
                >
                  {resourceLanguages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setPickedLanguage(lang);
                        resetResourceSelection();
                      }}
                      aria-pressed={resourceLanguage === lang}
                      className={`px-2 py-1 uppercase transition-colors first:rounded-l-md last:rounded-r-md ${
                        resourceLanguage === lang
                          ? "bg-gold-dim/30 text-gold-bright"
                          : "text-haze hover:text-mist"
                      }`}
                    >
                      {RESOURCE_LANGUAGE_LABELS[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {facetFields.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {facetFields.map((field) => (
                  <select
                    key={field.key}
                    aria-label={t(field.label, language)}
                    className={facetClasses}
                    value={facets[field.key] ?? ""}
                    onChange={(e) => {
                      setFacets((f) => ({ ...f, [field.key]: e.target.value }));
                      setSelectedResource("");
                    }}
                  >
                    <option value="">{t(field.label, language)}</option>
                    {facetOptions[field.key]?.map((value) => (
                      <option key={value} value={value}>
                        {getOptionLabel(field, value, language)}
                      </option>
                    ))}
                  </select>
                ))}
                <span className="ml-auto font-mono text-[11px] text-haze">
                  {filteredResources.length}{" "}
                  {t(
                    filteredResources.length === 1 ? texts.result : texts.results,
                    language,
                  )}
                </span>
              </div>
            )}
            <select
              id="start-from"
              className={`${fieldClasses} cursor-pointer border-gold-dim/50`}
              value={selectedResource}
              onChange={(e) => {
                setSelectedResource(e.target.value);
                const resource = filteredResources[Number(e.target.value)];
                if (!resource) return;
                // Load as new creation: saved separately from the resource.
                setData(normalizeData(resource.data));
                setTraits(resource.traits);
                setSegments(resource.segments);
                setBrewLanguage(resource.language);
                setCurrentId(undefined);
              }}
            >
              <option value="">{t(texts.fromScratch, language)}</option>
              {filteredResources.map((r, i) => (
                <option key={i} value={i}>
                  {r.data.name} · {r.source}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {schema.fields.map((field) => {
            // Category-scoped fields (e.g. a weapon trait) only show once the
            // chosen category calls for them.
            if (field.categories && field.categories.length > 0) {
              const category = normalizedData[groupField] ?? "";
              if (!field.categories.includes(category)) return null;
            }
            return (
              <Field
                key={field.key}
                field={field}
                value={normalizedData[field.key] ?? ""}
                onChange={(v) => updateField(field.key, v)}
                schemaId={schema.id}
              />
            );
          })}
          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="content-language"
              className="mb-1.5 block font-display text-[11px] font-semibold tracking-wider text-mist uppercase"
            >
              {t(texts.contentLanguage, language)}
            </label>
            <select
              id="content-language"
              className={`${fieldClasses} cursor-pointer`}
              value={contentLanguage}
              onChange={(e) =>
                setBrewLanguage(e.target.value as ResourceLanguage)
              }
            >
              {CONTENT_LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.label, language)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {schema.withTraits && (
          <TraitsEditor
            traits={traits}
            setTraits={setTraits}
            withType={schema.id !== "equipment"}
            contentLanguage={contentLanguage}
            featureLibrary={
              schema.id === "adversary"
                ? adversaryFeatures
                : schema.id === "colossus"
                  ? colossusFeatures
                  : undefined
            }
          />
        )}

        {schema.withSegments && (
          <SegmentsEditor
            segments={segments}
            setSegments={setSegments}
            contentLanguage={contentLanguage}
          />
        )}

        <fieldset className="mt-5 rounded-lg border border-edge bg-ink p-4">
          <legend className="px-1 font-display text-sm font-semibold text-gold">
            {t(texts.trackersTitle, language)}
          </legend>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {hasVitals && (
              <Toggle
                label={t(texts.healthTracker, language)}
                checked={trackers.health}
                onChange={(v) => setTrackers((tr) => ({ ...tr, health: v }))}
              />
            )}
            <Toggle
              label={t(texts.countdownTracker, language)}
              checked={trackers.countdown}
              onChange={(v) => setTrackers((tr) => ({ ...tr, countdown: v }))}
            />
            <Toggle
              label={t(texts.tokenTracker, language)}
              checked={trackers.token}
              onChange={(v) => setTrackers((tr) => ({ ...tr, token: v }))}
            />
          </div>
        </fieldset>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-gold to-gold-bright px-6 py-3 font-display text-[13px] font-bold tracking-widest text-abyss uppercase shadow-lg shadow-gold/25 transition-transform hover:-translate-y-px"
          >
            {t(ui.save, language)}
          </button>
          <button
            onClick={exportJson}
            className="flex items-center gap-2 rounded-lg border border-edge bg-ink px-4 py-3 font-display text-[11px] font-semibold tracking-wider text-mist uppercase transition-colors hover:border-gold-dim hover:text-bone"
          >
            <DownloadIcon /> {t(ui.exportJson, language)}
          </button>
          <button
            onClick={saveImage}
            className="flex items-center gap-2 rounded-lg border border-edge bg-ink px-4 py-3 font-display text-[11px] font-semibold tracking-wider text-mist uppercase transition-colors hover:border-gold-dim hover:text-bone"
          >
            <ImageIcon /> {t(texts.saveImage, language)}
          </button>
          <button
            onClick={addToCanvas}
            className="flex items-center gap-2 rounded-lg border border-gold-dim/60 bg-gold/10 px-4 py-3 font-display text-[11px] font-semibold tracking-wider text-gold uppercase transition-colors hover:bg-gold/20"
          >
            <MapIcon size={16} /> {t(texts.addToCanvas, language)}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importJson(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-edge bg-ink px-4 py-3 font-display text-[11px] font-semibold tracking-wider text-mist uppercase transition-colors hover:border-gold-dim hover:text-bone"
          >
            <DownloadIcon /> {t(texts.importJson, language)}
          </button>
          <span aria-live="polite" className="text-sm text-emerald">
            {savedNotice && t(texts.saved, language)}
            {canvasNotice && t(texts.sentToCanvas, language)}
            {importNotice && t(texts.imported, language)}
          </span>
          {importError && (
            <span role="alert" className="text-sm text-blood-bright">
              {importError}
            </span>
          )}
        </div>
      </main>

      <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <div>
          <h2 className="mb-2 font-display text-[11px] font-semibold tracking-[0.2em] text-haze uppercase">
            {t(ui.preview, language)}
          </h2>
          <div ref={cardRef} className="space-y-3">
            <Statblock
              brewType={schema.id}
              data={normalizedData}
              traits={traits}
              segments={segments}
              trackers={trackers}
              contentLanguage={contentLanguage}
              emptyHint={t(texts.emptyPreview, language)}
              hideSegments={schema.withSegments}
            />
            {schema.withSegments &&
              segments.map((seg, i) => (
                <SegmentCard key={i} segment={seg} segments={segments} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
