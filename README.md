# Defiende San Martín · David Landa Tucto

Web de campaña de David Landa Tucto (Fuerza Popular) al Gobierno Regional de San Martín:
portada con sus propuestas y registro de personeros de mesa (`/unirse`) guardado en Supabase.

Hecha con Next.js 16 (App Router), Tailwind 4, Supabase y ExcelJS.

## Desarrollo

```bash
cp .env.example .env.local   # y completa los valores
npm install
npm run dev                  # http://localhost:3000
```

## Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com). Para menor latencia desde Perú elige la región **South America (São Paulo)**.
2. **SQL Editor → New query**: pega `supabase/migrations/0001_personeros.sql` y ejecuta **Run**.
3. **Project Settings → API**: copia la *Project URL* y la clave **service_role**.

La tabla `personeros` tiene RLS activado y ningún acceso público: solo el servidor de la web
(con la service_role key) inserta registros y genera el Excel.

## Variables de entorno

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `SUPABASE_URL` | Sí | URL del proyecto de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Clave secreta del servidor (nunca con prefijo `NEXT_PUBLIC_`) |
| `ADMIN_EXPORT_PASSWORD` | Sí | Contraseña para descargar el Excel (tres toques en el bigote) |
| `DNI_API_URL` | No | API de DNI (por defecto `https://api.apis.net.pe/v1/dni`) |
| `DNI_API_TOKEN` | No | Token de la API de DNI, si la pide |

## Deploy en Vercel

1. Sube el código a GitHub (`git push`).
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio. Vercel detecta Next.js solo: no cambies los comandos de build.
3. En **Environment Variables** agrega las variables de la tabla de arriba (para *Production* y *Preview*).
4. **Deploy**. Cada `git push` a `main` vuelve a publicar.
5. (Opcional) **Settings → Domains** para conectar tu dominio.

`vercel.json` fija las funciones en la región **gru1 (São Paulo)**, la más cercana a Perú; conviene
que Supabase esté en la misma región.

### Después del primer deploy, verifica

- Registrar un personero de prueba en `/unirse` y verlo en Supabase (**Table Editor → personeros**).
- Tres toques en el bigote → contraseña → se descarga el Excel.
- Borrar el registro de prueba en Supabase.

### Notas

- Los límites de intentos (consulta de DNI y contraseña del Excel) se guardan en la memoria de
  cada función; en Vercel cada instancia lleva su propia cuenta. Usa una contraseña larga en
  `ADMIN_EXPORT_PASSWORD`.
- Las fotos originales (PNG de alta resolución) están en `design/fotos-originales/` y no se
  publican; la web usa las versiones optimizadas de `public/fotos/`.
