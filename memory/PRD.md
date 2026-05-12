# Propiedades Turísticas RD - PRD

## Descripción del Proyecto
Sitio web inmobiliario moderno y profesional para República Dominicana.

## Stack Técnico
- **Frontend**: React CRA con Craco
- **Backend**: FastAPI (Python)
- **Base de Datos**: MongoDB local
- **Autenticación**: JWT con bcrypt
- **Mapa**: Leaflet (OpenStreetMap) - GRATUITO

## Estado Actual: ✅ FUNCIONANDO

### Hero Móvil (≤768px) — Última actualización Feb 2026
- Layout fullscreen 100dvh con video YouTube cover.
- Logo (`hero_logo_url`) centrado en parte superior (140px ancho).
- Sin nombre de agencia duplicado dentro del Hero.
- Sin botón CTA "Ver Propiedades" sobre el video.
- Título y subtítulo centrados verticalmente.
- Indicadores de imagen e ícono de visitas en parte inferior.
- Desktop NO modificado.

### Configuración del Hero (Página de Inicio)

| Campo | Descripción | Rango |
|-------|-------------|-------|
| `hero_logo_url` | Logo flotante | URL |
| `hero_logo_width/height` | Tamaño del logo | 50-500 / 30-300 px |
| `logo_position` | Posición del logo | 9 posiciones |
| `hero_title_size` | Tamaño del título | 24-80 px |
| `hero_subtitle_size` | Tamaño del subtítulo | 12-36 px |
| `hero_title_position` | Alineación horizontal | left, center, right |
| `hero_title_vertical_position` | Posición vertical | 20-80% (arriba-abajo) |

### Página de Nosotros - Editable desde Admin

1. **Header** - Título editable
2. **Imagen + Historia** - Sin botón, descripción principal
3. **Misión, Visión y Valores** - 3 tarjetas con títulos y descripciones editables
4. **Estadísticas** - 4 iconos con números editables
5. **CTA** - Botones Ver Propiedades / Contactar

### Página de Contacto
- Información de contacto
- Botón WhatsApp
- **Mapa interactivo Leaflet/OpenStreetMap**
- Formulario de contacto

## Panel de Administración

### Marca y Logo
- Logo del Header (upload)
- Logo Flotante del Hero (upload + tamaño configurable)
- Posición del logo flotante
- **Estilo de Títulos del Hero**:
  - Posición horizontal (izq/centro/der)
  - Posición vertical (arriba/abajo con slider)
  - Tamaño del título
  - Tamaño del subtítulo

### Página "Sobre Nosotros" (100% editable)
- Título de la página
- Descripción principal (Nuestra Historia)
- **Misión, Visión y Valores**:
  - Título de cada tarjeta editable
  - Descripción de cada tarjeta editable
- Estadísticas (4 números)

## Credenciales
- **Admin**: `admin` / `admin123`
- **Agente**: `agente1` / `agente123`

## Historial de Cambios

### 2025-04-25 (Última actualización)
- **Posición vertical de títulos**: Slider para mover arriba/abajo (20-80%)
- **Misión, Visión, Valores**: Reemplaza las 3 features, 100% editable
- Eliminado botón "Contáctanos" de la sección Historia
- Mapa en página de Contacto
- Logo Hero redimensionable
- ScrollToTop automático
