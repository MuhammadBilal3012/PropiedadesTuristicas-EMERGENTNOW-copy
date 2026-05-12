# Guía de Despliegue — Vercel (Frontend) + Render (Backend) + MongoDB Atlas (BD)

Esta guía te lleva paso a paso para desplegar **Propiedades Turísticas RD** en producción usando los planes gratuitos de Vercel + Render + MongoDB Atlas.

---

## 1. MongoDB Atlas (base de datos)

1. Ve a https://cloud.mongodb.com y crea una cuenta gratuita.
2. **Build a Database** → elige `M0 Free` → región `AWS / N. Virginia` (más cercana a Render Oregon).
3. **Database Access** → `Add New Database User`:
   - Username: `propiedadesrd`
   - Password: genera una segura (guárdala)
   - Built-in role: `Atlas admin`
4. **Network Access** → `Add IP Address` → `Allow access from anywhere` (0.0.0.0/0).
5. **Connect** (botón verde) → `Drivers` → copia el connection string. Se ve así:
   ```
   mongodb+srv://propiedadesrd:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Reemplaza `<password>` con la real y agrega el nombre de la BD antes del `?`:
   ```
   mongodb+srv://propiedadesrd:TU_PASSWORD@cluster0.xxxxx.mongodb.net/propiedades_rd?retryWrites=true&w=majority
   ```

---

## 2. Render (backend FastAPI)

### Opción A — usando el archivo `render.yaml` incluido (más fácil)

1. Sube el repo a GitHub.
2. Ve a https://dashboard.render.com → **New** → **Blueprint**.
3. Conecta tu repo. Render detectará `render.yaml`.
4. Te pedirá rellenar las variables marcadas como `sync: false`:
   - `MONGO_URL`: connection string de MongoDB Atlas (paso 1)
   - `CORS_ORIGINS`: pega la URL de Vercel (la obtendrás después). Inicialmente puedes poner `*` y restringir luego.
5. **Apply** → Render construye y despliega.
6. Cuando termine, copia la URL pública (ej. `https://propiedades-rd-backend.onrender.com`).

### Opción B — manual

1. **New** → **Web Service** → conecta tu repo.
2. Configuración:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
3. **Environment Variables**:
   ```
   MONGO_URL=mongodb+srv://...
   DB_NAME=propiedades_rd
   JWT_SECRET=<genera-uno-largo-y-aleatorio>
   CORS_ORIGINS=https://tu-app.vercel.app
   ```
4. **Create Web Service**.

> ⚠️ **Plan Free de Render**: el servicio se duerme tras 15 min sin tráfico. La primera petición tras dormir tarda ~30s. Para producción real considera el plan `Starter` (USD 7/mes).

> ⚠️ **Uploads de archivos**: en plan Free el disco NO es persistente. Las imágenes subidas vía panel admin se borrarán en cada redeploy. Para imágenes persistentes sube a un servicio externo (Cloudinary, AWS S3) o usa el plan con disco persistente de Render.

---

## 3. Vercel (frontend React)

### Opción A — desde la UI

1. Sube el repo a GitHub (si no lo hiciste).
2. Ve a https://vercel.com → **Add New** → **Project** → importa el repo.
3. Configuración:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend` (clic en `Edit` y selecciona la carpeta)
   - **Build Command**: `yarn build` (default)
   - **Output Directory**: `build` (default)
4. **Environment Variables**:
   ```
   REACT_APP_BACKEND_URL=https://propiedades-rd-backend.onrender.com
   ```
   (Sin slash final.)
5. **Deploy**.

### Opción B — usando `vercel.json` (incluido en el repo)

El archivo `/app/vercel.json` ya tiene la configuración. Sólo:
- Importa el repo en Vercel.
- Añade la variable `REACT_APP_BACKEND_URL`.
- Deploy.

---

## 4. Conectar todo (CORS)

Después de desplegar Vercel:
1. Copia la URL pública de Vercel (ej. `https://propiedades-rd.vercel.app`).
2. Vuelve a Render → tu servicio → **Environment** → edita `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://propiedades-rd.vercel.app,http://localhost:3000
   ```
3. Render redesplegará automáticamente.

---

## 5. Variables de entorno — resumen

### Backend (Render)
| Variable | Valor | Obligatoria |
|---|---|---|
| `MONGO_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/propiedades_rd?retryWrites=true&w=majority` | ✅ |
| `DB_NAME` | `propiedades_rd` | ✅ |
| `JWT_SECRET` | string aleatorio largo (≥32 chars) | ✅ |
| `CORS_ORIGINS` | `https://tu-app.vercel.app,http://localhost:3000` | ✅ |
| `PYTHON_VERSION` | `3.11` | recomendado |

> Render expone `$PORT` automáticamente. **NO** definas `PORT` manualmente.

### Frontend (Vercel)
| Variable | Valor | Obligatoria |
|---|---|---|
| `REACT_APP_BACKEND_URL` | `https://propiedades-rd-backend.onrender.com` | ✅ |

---

## 6. Primera sembrada de datos

La primera vez que cargue la home, el frontend llamará a `POST /api/seed` automáticamente. Si la base de datos está vacía, sembrará:
- 6 propiedades de ejemplo
- 8 ubicaciones
- Usuario admin: `admin` / `admin123` ⚠️ **Cambia esta contraseña inmediatamente** desde el panel admin (botón 🔑 Contraseña en la barra superior).

Si la BD ya tiene datos, el seed no hace nada (es idempotente). **Tus datos del panel admin se mantienen entre deploys.**

---

## 7. Persistencia de datos

✅ Toda la información introducida desde el panel admin (propiedades, agentes, configuración, mensajes) vive en MongoDB Atlas — no se pierde con redeploys ni reinicios.

⚠️ Las **imágenes subidas** vía panel admin se almacenan en disco local del backend. En el plan Free de Render, el disco se borra en cada deploy. Soluciones:
- **Recomendado**: integrar Cloudinary (gratis hasta 25GB) o AWS S3 para almacenamiento persistente de imágenes.
- **Alternativa**: usar plan de pago de Render con disco persistente.

---

## 8. Checklist final

- [ ] MongoDB Atlas creado y connection string copiado
- [ ] Render desplegado, URL del backend copiada
- [ ] Vercel desplegado con `REACT_APP_BACKEND_URL` configurado
- [ ] `CORS_ORIGINS` en Render actualizado con la URL de Vercel
- [ ] Visitaste `https://tu-app.vercel.app` y carga correctamente
- [ ] Hiciste login en `/admin` y cambiaste la contraseña por defecto
- [ ] Verificaste que las propiedades del seed aparecen en la página

---

## 9. Tips de producción

- **Custom domain** en Vercel: Settings → Domains → añade el dominio.
- **Mantén Render despierto**: usa https://uptimerobot.com (gratis) para hacer ping cada 5 min al backend, así no se duerme.
- **Logs**:
  - Render: Dashboard → tu servicio → Logs
  - Vercel: Dashboard → tu proyecto → Logs
- **MongoDB backups**: Atlas M0 incluye snapshots cada 6h automáticos.
