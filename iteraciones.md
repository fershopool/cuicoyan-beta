# Registro de iteraciones

> Plantilla base para solicitar cambios después de generar una pantalla. Cada registro debe describir un cambio puntual, indicar qué debe conservarse y permitir comprobar el resultado.

## Reglas de uso

- Trabajar sobre una pantalla identificada por su ID.
- Solicitar una modificación principal por iteración.
- Señalar el elemento exacto que debe cambiarse.
- Indicar explícitamente qué debe permanecer igual.
- No mezclar cambios de estructura, contenido, estilo y funcionalidad sin prioridad.
- Usar lenguaje directo y términos concretos de UI/UX.
- Guardar una captura o versión cuando el resultado sea correcto.

## Ficha de iteración

### Identificación

- **ID de iteración:**
- **Fecha:**
- **Pantalla afectada:**
- **Versión anterior:**
- **Versión solicitada:**
- **Responsable de la revisión:**
- **Estado:** pendiente / enviada / aprobada / descartada:
- **Enlace a captura o versión:**

### Objetivo del cambio

- **¿Qué problema se quiere corregir?**
- **Tipo de cambio:** estructura / contenido / estilo / responsive / interacción / estado / accesibilidad:
- **Prioridad:** crítica / alta / media / baja:

### Cambio solicitado

- **Elemento exacto:**
- **Ubicación exacta:**
- **Cambio que debe realizarse:**
- **Resultado visual o funcional esperado:**

### Debe conservarse

- **Estructura que no debe cambiar:**
- **Componentes que no deben cambiar:**
- **Colores y tipografías que no deben cambiar:**
- **Contenido que no debe cambiar:**
- **Comportamiento que no debe cambiar:**

### No hacer

- 

### Criterios de aceptación

- [ ] El cambio solicitado está aplicado.
- [ ] Solo se modificó el elemento indicado.
- [ ] La estructura aprobada se conserva.
- [ ] La identidad visual se conserva.
- [ ] No se agregaron secciones o funciones no solicitadas.
- [ ] El resultado funciona en los tamaños responsive definidos.
- [ ] La captura o versión final fue guardada.

### Prompt de iteración

```text
En la pantalla [ID], conserva [elementos que no deben cambiar].

Realiza únicamente este cambio:
- [cambio específico]

Modifica el elemento [elemento exacto] ubicado en [ubicación].
El resultado esperado es [resultado].

No agregues [elementos excluidos] ni cambies [restricciones].
```

### Resultado

- **¿Se aplicó correctamente?:** sí / parcialmente / no:
- **Qué funcionó:**
- **Qué falta corregir:**
- **Siguiente iteración recomendada:**

## Historial resumido

| ID | Pantalla | Cambio principal | Estado | Versión aprobada | Enlace |
|---|---|---|---|---|---|
| ITER-001 |  |  |  |  |  |
| ITER-002 |  |  |  |  |  |
| ITER-003 |  |  |  |  |  |
