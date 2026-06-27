# Dagacorazón

Plataforma de homebrew de **Daggerheart** para la comunidad LATAM, en español y portugués. Crea adversarios, colosos, entornos y equipo en el **Taller**, llévalos a la **Mesa** (un lienzo libre con tokens e imágenes) y, próximamente, compártelos con la **Comunidad**.

Construida con [Next.js 16](https://nextjs.org) (App Router + Turbopack), Tailwind CSS 4, Auth.js y MongoDB.

> Este proyecto usa **pnpm** (fijado en `package.json` vía `packageManager`). No mezcles npm/yarn: generarían un lockfile duplicado.

## Requisitos

- Node.js 20.9 o superior.
- pnpm 10.x. Si usas Corepack:

```bash
corepack enable
corepack prepare pnpm@10.33.2 --activate
```

## Configuración local

Instala dependencias:

```bash
pnpm install
```

Levanta el servidor de desarrollo:

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

La app puede correr sin variables de entorno: las creaciones se guardan en el navegador (`localStorage`). Para habilitar MongoDB y login con Google, crea tu archivo local:

```bash
cp .env.example .env.local
```

Completa estas variables:

| Variable | Uso | Requerida para desarrollo básico |
| --- | --- | --- |
| `MONGODB_URI` | URI de MongoDB Atlas o una instancia local. | No |
| `MONGODB_DB` | Nombre de la base de datos. | No |
| `AUTH_SECRET` | Secret de Auth.js. Puedes generarlo con `npx auth secret`. | No |
| `AUTH_GOOGLE_ID` | Client ID de OAuth en Google Cloud. | No |
| `AUTH_GOOGLE_SECRET` | Client secret de OAuth en Google Cloud. | No |

Para Google OAuth en local, configura este redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

No commitees `.env.local` ni otros archivos `.env*` con secretos.

## Variables de entorno

Los detalles y comentarios viven en [.env.example](.env.example). Next.js carga automáticamente `.env.local` desde la raíz del proyecto.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Levanta el servidor de desarrollo con Turbopack. |
| `pnpm build` | Genera el build de producción. |
| `pnpm start` | Sirve el build de producción. Debe ejecutarse después de `pnpm build`. |
| `pnpm lint` | Corre ESLint con las reglas de Next.js, Core Web Vitals y TypeScript. |
| `pnpm test` | Corre la suite de Vitest una vez. |

Actualmente no hay script de formateo en `package.json`.

## Tests y calidad

Antes de abrir un PR o entregar un cambio, corre:

```bash
pnpm lint
pnpm test
```

Los tests usan Vitest en entorno Node. La configuración está en [vitest.config.ts](vitest.config.ts) y por ahora incluye archivos `lib/**/*.test.ts`.

Para validar el build completo:

```bash
pnpm build
```

## Flujo de desarrollo

1. Crea o actualiza tu `.env.local` solo si necesitas MongoDB o Google OAuth.
2. Corre `pnpm dev` y trabaja contra `http://localhost:3000`.
3. Mantén la lógica reutilizable en `lib/` y los componentes de UI en `components/`.
4. Agrega o actualiza tests cuando cambies lógica de import/export, normalización o contratos de datos.
5. Corre `pnpm lint` y `pnpm test` antes de cerrar el cambio.

## Persistencia local

Mientras no se configure MongoDB, los recursos del Taller y sesiones de Mesa viven en el navegador. Esto es útil para desarrollo, pero significa que:

- Cambiar de navegador o limpiar storage borra esos datos.
- Los datos no se comparten entre dispositivos.
- Importar/exportar desde `/taller/recursos` es la forma recomendada de respaldarlos.

## Estructura

```text
app/
  taller/           Hub de creación + creadores por tipo ([tipo])
  mesa/             Lienzo de juego (tokens, imágenes, pan/zoom)
  comunidad/        Biblioteca compartida (en construcción)
  entrar/           Acceso con Google
  api/auth/         Route handler de Auth.js
components/         UI: creador con vista previa en vivo, lienzo, nav, dados
lib/
  creators.ts       Esquemas declarativos de los creadores (es/pt)
  i18n.tsx          Idioma es/pt por contexto cliente
  storage.ts        Persistencia local de brews (puente hacia MongoDB)
  resources.ts      Registro y adaptadores del directorio resources/
  db/mongodb.ts     Cliente MongoDB (conexión perezosa) y colecciones
resources/          Contenido existente consumible en formato SRD
                    (adversarios, colosos, entornos, equipo) — ver su README
public/marca/       Logotipos y assets de marca (se sirven como /marca/…)
```

## Troubleshooting

- **El puerto 3000 está ocupado**: detén el proceso anterior o corre `pnpm dev -- --port 3001`.
- **El login con Google falla en local**: revisa que el redirect URI configurado en Google Cloud sea exactamente `http://localhost:3000/api/auth/callback/google`.
- **No aparecen recursos guardados**: verifica que estés en el mismo navegador/perfil; sin MongoDB, la biblioteca se guarda en `localStorage`.
- **`pnpm start` falla**: primero ejecuta `pnpm build`.

## Aviso

Proyecto comunitario sin afiliación con Darrington Press. Daggerheart™ es propiedad de sus autores.
