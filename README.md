# ¿Cuándo nacerá Santiago? 🍼

Web interactiva para que familiares y amigos apuesten en qué día y hora va a nacer Santiago.

## ✨ Funcionalidades

- **Calendario visual interactivo** con el mismo estilo del PDF impreso (ilustraciones SVG infantiles: patito, chupete, nube, sonajero).
- **Click en un día → popup** que pide nombre, email y hora (0-23).
- **Una apuesta por email** (validado). Si ya votaste y querés cambiar, te pregunta si confirmás el cambio.
- **Ranking público en vivo** con las fechas más votadas.
- **Día 16 de diciembre destacado** (fecha probable de parto del médico, con estrella).
- **Panel admin para los papás** (`/admin` via botón "Panel de los papás" en la home):
  - Ver todas las apuestas (con emails).
  - Marcar la fecha real de nacimiento de Santiago.
  - Calcular automáticamente al ganador (quién estuvo más cerca en horas).

## 🛠️ Stack técnico

- **Next.js 16** con App Router
- **TypeScript** estricto
- **Tailwind CSS 4** + **shadcn/ui**
- **Prisma ORM**
- **SQLite** en desarrollo / **PostgreSQL** (Neon o Vercel Postgres) en producción
- **Fredoka** y **Inter** fonts (Google Fonts)

## 🚀 Cómo correrlo localmente

```bash
# 1. Instalar dependencias
bun install

# 2. Inicializar la base de datos SQLite local
bun run db:push

# 3. (Opcional) Crear la configuración global de admin (password por defecto: santiago2026)
bun scripts/seed.mjs

# 4. Levantar el dev server
bun run dev
```

Abrí http://localhost:3000 y jugá!

## 📦 Deploy a Vercel (gratis)

### 1. Subir el código a GitHub

```bash
cd /ruta/al/proyecto
git init
git add .
git commit -m "Calendario interactivo: ¿Cuándo nacerá Santiago?"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/calendario-santiago.git
git push -u origin main
```

### 2. Crear base de datos Postgres gratuita

Recomendado: **Neon** (https://neon.tech)
- Crear cuenta (se autentica con GitHub)
- Crear proyecto nuevo → nombre: `calendario-santiago`
- Copiar la **connection string** (formato `postgresql://user:pass@host/db?sslmode=require`)

Alternativa: **Vercel Postgres** desde el dashboard de Vercel → Storage → Create Database → Postgres.

### 3. Importar en Vercel

- Ir a https://vercel.com/new
- Elegir el repo `calendario-santiago` que acabás de subir
- Framework Preset: **Next.js** (se autodetecta)
- **NO tocar** el Build Command (lo dejamos automático)
- En **Environment Variables**, agregar:
  - `DATABASE_URL` = (la connection string de Neon)
  - `ADMIN_PASSWORD` = (elegir un password nuevo, ej: `miPasswordSeguro123`)
- Click **Deploy**

### 4. Configurar build para Postgres

El build de Vercel automáticamente corre `prisma generate`. Pero como el schema actual usa SQLite, hay que cambiarlo a Postgres.

**Opción A (recomendada): renombrar los archivos localmente y pushear**

Antes del deploy, hacer:
```bash
mv prisma/schema.prisma prisma/schema.sqlite.prisma
mv prisma/schema.postgres.prisma prisma/schema.prisma
git add -A
git commit -m "Usar Postgres como schema principal"
git push
```

**Opción B: modificar el build command en Vercel**

En Vercel → Settings → Build & Development Settings:
- Build Command: `cp prisma/schema.postgres.prisma prisma/schema.prisma && bun install && bunx prisma generate && bunx prisma db push --accept-data-loss && bun run build`

### 5. Sembrar la configuración inicial de admin

Después del primer deploy, hay que inicializar el Setting global con el password. Para eso:
- Ir al dashboard de Neon → SQL Editor
- Ejecutar:
```sql
INSERT INTO "Setting" (id, "adminPassword", "createdAt", "updatedAt")
VALUES ('global', 'TU_PASSWORD_QUE_ELEGISTE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET "adminPassword" = EXCLUDED."adminPassword";
```

## 🔐 Seguridad

- **Emails**: la DB los guarda en texto plano (suficiente para un baby shower, pero no para datos sensibles reales).
- **Panel admin**: protegido por password simple (token en localStorage). No usar para casos de producción con datos sensibles.
- **Rate limiting**: no implementado. Si esperás muchas visitas, considerar agregar Vercel Edge Rate Limit.

## 📂 Estructura

```
prisma/
  schema.prisma              # SQLite (dev)
  schema.postgres.prisma     # PostgreSQL (prod)
  db/                        # SQLite DB files (gitignored)
src/
  app/
    api/
      votes/route.ts         # GET (público), POST (crear/cambiar voto)
      admin/
        login/route.ts       # POST (login admin)
        votes/route.ts       # GET (lista completa), POST (marcar nacimiento)
        result/route.ts      # GET (calcular ganador)
    page.tsx                  # Home con calendario + ranking
    layout.tsx                # Layout + fonts
  components/
    calendar/
      calendar-grid.tsx       # Grilla de días
      vote-modal.tsx           # Modal de voto
      ranking-panel.tsx       # Ranking en vivo
      admin-panel.tsx         # Modal admin completo
      icons.tsx               # Ilustraciones SVG (patito, chupete, etc.)
  lib/
    calendar.ts               # Constantes y helpers
    db.ts                     # Cliente Prisma
```

## 🎨 Personalización

- **Colores**: editar `src/app/globals.css` y los colores inline en `page.tsx`.
- **Ilustraciones**: `src/components/calendar/icons.tsx`.
- **Rango de fechas**: `src/lib/calendar.ts` → `CALENDAR_RANGES` y `MIN_DATE`/`MAX_DATE`.
- **Password admin por defecto**: en el seed `scripts/seed.mjs` (mejor cambiar vía SQL directo en prod).

## 📝 Licencia

Personal use. Hecho con 💛 para esperar a Santiago.
