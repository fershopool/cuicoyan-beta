# Lanzamiento beta en GitHub Pages

El despliegue lo hace `.github/workflows/pages.yml`. Se ejecuta en cada push a `main` o a mano (`workflow_dispatch`).

## Pasos

1. **Repo de publicación.** Crea el repo (o usa el existente) y sube la rama `mvp-beta` a `main`, porque el workflow solo escucha `main`.
2. **Activar Pages.** En Settings > Pages, en Source elige **GitHub Actions**.
3. **Variables.** En Settings > Secrets and variables > Actions > Variables, crea:
   - `SUPABASE_URL`: URL del proyecto Supabase.
   - `SUPABASE_ANON_KEY`: clave anon (pública; no pongas aquí la service role).
   - `SITE_BASE`: `/` para dominio propio.
4. **DNS.** En el proveedor de `ollin.digital`, crea un registro CNAME:
   - Nombre: `beta.cuicoyan` para la beta (la producción usará `cuicoyan`).
   - Valor: `<usuario>.github.io` (usuario u organización de GitHub).
5. **Dominio en GitHub.** En Settings > Pages > Custom domain escribe `beta.cuicoyan.ollin.digital` y guarda. No añadas un archivo CNAME al repo.
6. **HTTPS.** Cuando termine la verificación DNS, activa **Enforce HTTPS**.
7. **Comprobar.** Lanza el workflow desde la pestaña Actions y abre el dominio. Si la carga falla, revisa que `config.js` exista en el sitio publicado.
