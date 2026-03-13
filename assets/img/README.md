# Carpeta de Imágenes de Productos

Esta carpeta almacena las imágenes de los productos de Roses Bienestar.

## Uso en el CRM

En el panel de administración de productos (`crm/product.html`), tienes dos opciones para agregar imágenes:

### 1. **Subir Imagen Local**
- Haz clic en el botón **"Subir Imagen"** al lado del campo de URL
- Selecciona una imagen de tu computadora
- La imagen se convertirá automáticamente a Base64 y se guardará en localStorage
- Verás un preview de la imagen inmediatamente

### 2. **URL de Imagen**
- Pega directamente una URL de imagen en el campo "Imagen"
- Presiona Enter o cambia de campo
- Verás un preview de la imagen

## Formatos Soportados
- JPG / JPEG
- PNG
- WebP
- GIF
- SVG

## Almacenamiento
Las imágenes se guardan en **localStorage** como Base64, lo que permite:
- Almacenamiento local sin servidor
- Sincronización automática con el catálogo
- Persistencia de datos entre sesiones

## Límites
El navegador tiene límites de almacenamiento en localStorage:
- **Límite típico: 5-10 MB** por dominio
- Si añades muchas imágenes grandes, considera usar URLs externas

## Recomendaciones
1. **Optimiza imágenes** antes de subirlas (máximo 500x500px)
2. **Reduce el tamaño** de los archivos (< 200KB por imagen)
3. **Usa formatos modernos** como WebP para mejor compresión
4. Para **muchos productos**, considera usar URLs de servidores externos (Cloudinary, Imgur, etc.)
