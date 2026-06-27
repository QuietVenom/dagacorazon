"use client";

import { useState } from "react";
import { t, ui, useLanguage, type LocalizedText } from "@/lib/i18n";
import { schemas, equipmentCategoryGroups, type CreatorGroupTab } from "@/lib/creators";
import { useBrews, type SavedBrew, type BrewType } from "@/lib/storage";
import { useCanvas } from "@/lib/canvas";
import { InfoModal } from "@/components/info-popovers";
import type { ResourceLanguage } from "@/lib/resource-types";
import {
  serializeBrew,
  emptyBrewTemplate,
  detectResource,
  extractCanvasBrews,
  buildBackup,
  brewName,
  type BrewPayload,
} from "@/lib/resource-transfer";
import { MdCloudUpload } from "react-icons/md";
import { DownloadIcon, TrashIcon } from "@/components/icons";

const texts = {
  title: { es: "Recursos", pt: "Recursos" },
  subtitle: {
    es: "Importa y exporta tus creaciones y lienzos como archivos.",
    pt: "Importe e exporte suas criações e lienzos como arquivos.",
  },
  importTitle: { es: "Importar", pt: "Importar" },
  importDesc: {
    es: "Arrastra un objeto, un lienzo o un respaldo: la app lo guardará donde corresponde.",
    pt: "Arraste um objeto, um lienzo ou um backup: o app salvará onde corresponde.",
  },
  dropPrefix: { es: "Arrastra y suelta tu archivo, o", pt: "Arraste e solte seu arquivo, ou" },
  browse: { es: "examinar", pt: "procurar" },
  supportedFormats: {
    es: "Formato: archivo .json de Dagacorazón (objeto, lienzo o respaldo).",
    pt: "Formato: arquivo .json do Dagacorazón (objeto, lienzo ou backup).",
  },
  exportSectionTitle: { es: "Exportar", pt: "Exportar" },
  backupTitle: { es: "Respaldo completo", pt: "Backup completo" },
  backupDesc: {
    es: "Descarga todo (objetos y lienzos) en un solo archivo. Para restaurarlo, súbelo arriba.",
    pt: "Baixe tudo (objetos e lienzos) em um único arquivo. Para restaurá-lo, envie-o acima.",
  },
  exportAll: { es: "Exportar todo", pt: "Exportar tudo" },
  libraryTitle: { es: "Tu biblioteca", pt: "Sua biblioteca" },
  canvasesTitle: { es: "Tus lienzos", pt: "Seus lienzos" },
  templatesTitle: { es: "Plantillas vacías", pt: "Modelos vazios" },
  templatesDesc: {
    es: "Descarga un formato en blanco, llénalo y vuelve a cargarlo.",
    pt: "Baixe um modelo em branco, preencha e carregue de volta.",
  },
  emptyLibrary: { es: "Aún no has guardado objetos.", pt: "Você ainda não salvou objetos." },
  emptyCanvases: { es: "Aún no hay lienzos.", pt: "Ainda não há lienzos." },
  download: { es: "Descargar", pt: "Baixar" },
  unnamed: { es: "(sin nombre)", pt: "(sem nome)" },
  // Results
  importedBrew: { es: "Objeto importado:", pt: "Objeto importado:" },
  importedCanvas: { es: "Lienzo importado:", pt: "Lienzo importado:" },
  importedBackup: { es: "Respaldo restaurado:", pt: "Backup restaurado:" },
  createdInLibrary: {
    es: "objeto(s) agregado(s) a la biblioteca",
    pt: "objeto(s) adicionado(s) à biblioteca",
  },
  objects: { es: "objeto(s)", pt: "objeto(s)" },
  canvases: { es: "lienzo(s)", pt: "lienzo(s)" },
  missingImage: {
    es: "No se encontró imagen",
    pt: "Imagem não encontrada",
  },
  errorUnrecognized: {
    es: "Formato no reconocido. Sube un objeto del Taller o un lienzo exportado por Dagacorazón.",
    pt: "Formato não reconhecido. Envie um objeto da Oficina ou um lienzo exportado pelo Dagacorazón.",
  },
  errorJson: {
    es: "El archivo no es un JSON válido (¿subiste una imagen suelta?).",
    pt: "O arquivo não é um JSON válido (você enviou uma imagem solta?).",
  },
  errorVersion: {
    es: "Esta versión del archivo todavía no es compatible.",
    pt: "Esta versão do arquivo ainda não é compatível.",
  },
} satisfies Record<string, LocalizedText>;

const hubInfo: LocalizedText = {
  es: `## Qué hace este módulo

Es el centro para **guardar, compartir y restaurar** tus recursos como archivos \`.json\`.

## Exportar

- **Tu biblioteca**: descarga cualquier objeto guardado (adversario, coloso, entorno, equipo).
- **Tus lienzos**: descarga una sesión de la Mesa. Las imágenes viajan **dentro** del mismo archivo.
- **Respaldo completo**: un solo archivo con todo, ideal para copia de seguridad o cambiar de dispositivo.

## Importar

Sube un archivo y la app detecta qué es y lo guarda donde va:

- Un **objeto** se agrega a tu biblioteca como copia nueva.
- Un **lienzo** se abre como una sesión nueva; además, los objetos que contenga y que aún no tengas se **agregan a tu biblioteca**.
- Si un lienzo pide una imagen que no existe, esa pieza se omite y se avisa con "No se encontró imagen".

## Plantillas vacías

Descarga un formato en blanco, llénalo a mano y cárgalo aquí.

> Si el archivo no tiene el formato esperado (por ejemplo, una imagen suelta), se mostrará un error.`,
  pt: `## O que este módulo faz

É o centro para **salvar, compartilhar e restaurar** seus recursos como arquivos \`.json\`.

## Exportar

- **Sua biblioteca**: baixe qualquer objeto salvo (adversário, colosso, ambiente, equipamento).
- **Seus lienzos**: baixe uma sessão da Mesa. As imagens viajam **dentro** do próprio arquivo.
- **Backup completo**: um único arquivo com tudo, ideal para cópia de segurança ou trocar de dispositivo.

## Importar

Envie um arquivo e o app detecta o que é e salva onde deve:

- Um **objeto** é adicionado à sua biblioteca como uma nova cópia.
- Um **lienzo** abre como uma nova sessão; além disso, os objetos que ele contém e que você ainda não tem são **adicionados à sua biblioteca**.
- Se um lienzo pedir uma imagem que não existe, essa peça é ignorada e avisamos com "Imagem não encontrada".

## Modelos vazios

Baixe um modelo em branco, preencha à mão e carregue aqui.

> Se o arquivo não tiver o formato esperado (por exemplo, uma imagem solta), será mostrado um erro.`,
};

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "recurso"
  );
}

function downloadJSON(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function pickFile(onPick: (file: File) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.onchange = () => {
    const file = input.files?.[0];
    if (file) onPick(file);
  };
  input.click();
}

export function ResourceHub() {
  const { language } = useLanguage();
  const templateLanguage: ResourceLanguage = language === "pt" ? "pt-br" : "es";
  const { brews, save, remove } = useBrews();
  const { sessions, exportSession, importSession } = useCanvas();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const typeTitle = (type: BrewType) => {
    const schema = schemas.find((s) => s.id === type);
    return schema ? t(schema.title, language) : type;
  };

  const brewExists = (type: BrewType, name: string) =>
    brews.some(
      (b) => b.type === type && brewName(b).toLowerCase() === name.toLowerCase(),
    );

  // "Import as copy": never overwrite; suffix the name on collision.
  const uniqueName = (base: string, type: BrewType) => {
    const root = base.trim() || t(texts.unnamed, language);
    if (!brewExists(type, root)) return root;
    let n = 2;
    while (brewExists(type, `${root} (${n})`)) n += 1;
    return `${root} (${n})`;
  };

  const saveCopy = (payload: BrewPayload) => {
    const name = uniqueName(brewName(payload), payload.type);
    save({ ...payload, data: { ...payload.data, name } });
  };

  const handleFile = async (file: File) => {
    setStatus(null);
    setError(null);
    const text = await file.text();
    let detected;
    try {
      detected = detectResource(text);
    } catch (e) {
      const reason = e instanceof Error ? e.message : "unrecognized";
      const message =
        reason === "invalid-json"
          ? texts.errorJson
          : reason === "unsupported-version"
            ? texts.errorVersion
            : texts.errorUnrecognized;
      setError(t(message, language));
      return;
    }

    if (detected.kind === "brew") {
      saveCopy(detected.payload);
      setStatus(
        `${t(texts.importedBrew, language)} ${typeTitle(detected.payload.type)} · ${detected.name || t(texts.unnamed, language)}`,
      );
      return;
    }

    if (detected.kind === "canvas") {
      await importSession(detected.source);
      // Add embedded objects the user doesn't already have.
      let created = 0;
      for (const { name, payload } of extractCanvasBrews(detected.source)) {
        if (!brewExists(payload.type, name)) {
          save({ ...payload, data: { ...payload.data, name } });
          created += 1;
        }
      }
      const parts = [
        `${t(texts.importedCanvas, language)} ${detected.name || t(texts.unnamed, language)}`,
      ];
      if (created > 0) parts.push(`${created} ${t(texts.createdInLibrary, language)}`);
      if (detected.missingImages > 0)
        parts.push(`⚠ ${t(texts.missingImage, language)} (${detected.missingImages})`);
      setStatus(parts.join(" · "));
      return;
    }

    // Backup: overwrite by id so restoring is idempotent (the backup wins).
    detected.brews.forEach((brew) => save(brew));
    for (const session of detected.sessions) await importSession(session);
    setStatus(
      `${t(texts.importedBackup, language)} ${detected.brews.length} ${t(texts.objects, language)} · ${detected.sessions.length} ${t(texts.canvases, language)}`,
    );
  };

  const exportBrew = (brew: SavedBrew) => {
    const name = brewName(brew) || brew.type;
    const ext = brew.type === "colossus" ? "colossus.json" : `${brew.type}.json`;
    downloadJSON(`${slugify(name)}.${ext}`, serializeBrew(brew));
  };

  const exportCanvas = async (id: string) => {
    const file = await exportSession(id);
    downloadJSON(file.filename, file.contents);
  };

  const exportEverything = async () => {
    const sessionExports = await Promise.all(
      sessions.map((s) => exportSession(s.id).then((d) => JSON.parse(d.contents))),
    );
    downloadJSON("respaldo.dagacorazon.json", buildBackup(brews, sessionExports));
  };

  const downloadTemplate = (type: BrewType, group?: CreatorGroupTab) => {
    const schema = schemas.find((s) => s.id === type);
    if (!schema) return;
    // Grouped creators (equipment) get a template per category.
    const category = group?.values[0];
    const filename = group
      ? `plantilla-equipo-${group.id}.json`
      : type === "colossus"
        ? "plantilla.colossus.json"
        : `plantilla-${type}.json`;
    downloadJSON(
      filename,
      emptyBrewTemplate(type, schema.fields, templateLanguage, category),
    );
  };

  const sectionClasses = "rounded-card border border-edge bg-card p-5";
  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-gold-dim/60 bg-gold/10 px-4 py-2 font-display text-[12px] font-semibold tracking-wide text-gold uppercase transition-colors hover:bg-gold/15 active:bg-gold/20";
  const rowButton =
    "inline-flex items-center gap-1.5 rounded-md border border-edge px-2.5 py-1.5 text-[12px] text-mist transition-colors hover:border-gold-dim hover:text-bone active:bg-white/5";
  const rowDangerButton =
    "inline-flex items-center gap-1.5 rounded-md border border-edge px-2.5 py-1.5 text-[12px] text-haze transition-colors hover:border-blood/60 hover:bg-blood/15 hover:text-blood-bright active:bg-blood/20";

  const brewsByType = schemas
    .map((s) => ({ type: s.id, list: brews.filter((b) => b.type === s.id) }))
    .filter((g) => g.list.length > 0);

  return (
    <main className="animate-fade-in mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-semibold">{t(texts.title, language)}</h1>
        <InfoModal title={t(texts.title, language)} content={t(hubInfo, language)} />
      </div>
      <p className="mt-1 mb-6 text-[15px] text-mist">{t(texts.subtitle, language)}</p>

      {/* Import — single dropzone for objects, canvases and backups */}
      <section className={sectionClasses}>
        <h2 className="font-display text-sm font-semibold text-gold">
          {t(texts.importTitle, language)}
        </h2>
        <p className="mt-1 mb-3 text-[13px] text-mist">{t(texts.importDesc, language)}</p>
        <div
          role="button"
          tabIndex={0}
          aria-label={t(texts.importTitle, language)}
          onClick={() => pickFile(handleFile)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              pickFile(handleFile);
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-9 text-center transition-colors ${
            dragging
              ? "border-gold bg-gold/10"
              : "border-edge bg-ink/40 hover:border-gold-dim"
          }`}
        >
          <MdCloudUpload size={38} className="text-gold" />
          <p className="text-[14px] text-mist">
            {t(texts.dropPrefix, language)}{" "}
            <span className="font-semibold text-gold underline">
              {t(texts.browse, language)}
            </span>
          </p>
          <p className="text-[12px] text-haze">{t(texts.supportedFormats, language)}</p>
        </div>
        {status && (
          <p role="status" className="mt-3 rounded-md border border-gold-dim/30 bg-gold/5 px-3 py-2 text-[13px] text-bone">
            {status}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 rounded-md border border-blood/40 bg-blood/10 px-3 py-2 text-[13px] text-blood-bright">
            {error}
          </p>
        )}
      </section>

      <h2 className="mt-8 mb-3 font-display text-[11px] font-semibold tracking-[0.2em] text-haze uppercase">
        {t(texts.exportSectionTitle, language)}
      </h2>

      {/* Library export */}
      <section className={sectionClasses}>
        <h2 className="mb-3 font-display text-sm font-semibold text-gold">
          {t(texts.libraryTitle, language)}
        </h2>
        {brewsByType.length === 0 ? (
          <p className="text-[13px] text-haze italic">{t(texts.emptyLibrary, language)}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {brewsByType.map(({ type, list }) => (
              <div key={type}>
                <h3 className="mb-2 font-display text-[10px] font-semibold tracking-[0.15em] text-mist uppercase">
                  {typeTitle(type)}
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {list.map((brew) => (
                    <li
                      key={brew.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-edge bg-ink/40 px-3 py-2"
                    >
                      <span className="truncate text-[14px] text-bone">
                        {brewName(brew) || t(texts.unnamed, language)}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <button type="button" className={rowButton} onClick={() => exportBrew(brew)}>
                          <DownloadIcon size={13} /> {t(texts.download, language)}
                        </button>
                        <button
                          type="button"
                          className={rowDangerButton}
                          onClick={() => remove(brew.id)}
                          aria-label={`${t(ui.remove, language)}: ${brewName(brew) || t(texts.unnamed, language)}`}
                          title={t(ui.remove, language)}
                        >
                          <TrashIcon size={13} />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Canvas export */}
      <section className={`${sectionClasses} mt-5`}>
        <h2 className="mb-3 font-display text-sm font-semibold text-gold">
          {t(texts.canvasesTitle, language)}
        </h2>
        {sessions.length === 0 ? (
          <p className="text-[13px] text-haze italic">{t(texts.emptyCanvases, language)}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-3 rounded-md border border-edge bg-ink/40 px-3 py-2"
              >
                <span className="truncate text-[14px] text-bone">{session.name}</span>
                <button type="button" className={rowButton} onClick={() => exportCanvas(session.id)}>
                  <DownloadIcon size={13} /> {t(texts.download, language)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Full backup export */}
      <section className={`${sectionClasses} mt-5`}>
        <h2 className="font-display text-sm font-semibold text-gold">
          {t(texts.backupTitle, language)}
        </h2>
        <p className="mt-1 mb-3 text-[13px] text-mist">{t(texts.backupDesc, language)}</p>
        <button type="button" className={primaryButton} onClick={exportEverything}>
          <DownloadIcon /> {t(texts.exportAll, language)}
        </button>
      </section>

      {/* Empty templates */}
      <section className={`${sectionClasses} mt-5`}>
        <h2 className="font-display text-sm font-semibold text-gold">
          {t(texts.templatesTitle, language)}
        </h2>
        <p className="mt-1 mb-3 text-[13px] text-mist">{t(texts.templatesDesc, language)}</p>
        <div className="flex flex-wrap gap-2">
          {schemas.map((schema) =>
            schema.id === "equipment"
              ? equipmentCategoryGroups.map((group) => (
                  <button
                    key={`equipment-${group.id}`}
                    type="button"
                    className={rowButton}
                    onClick={() => downloadTemplate("equipment", group)}
                  >
                    <DownloadIcon size={13} /> {t(schema.title, language)}: {t(group.label, language)}
                  </button>
                ))
              : (
                  <button
                    key={schema.id}
                    type="button"
                    className={rowButton}
                    onClick={() => downloadTemplate(schema.id)}
                  >
                    <DownloadIcon size={13} /> {t(schema.title, language)}
                  </button>
                ),
          )}
        </div>
      </section>
    </main>
  );
}
