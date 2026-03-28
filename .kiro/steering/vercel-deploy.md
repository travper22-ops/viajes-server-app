---
inclusion: manual
---

# Guía de Despliegue en Vercel

## Estructura del proyecto
Este proyecto tiene dos partes separadas que se despliegan de forma independiente:
- `client/` → Frontend React/Vite
- `server/` → Backend Express/Node

---

## Despliegue del Cliente

```bash
cd client && vercel --prod --yes --name aeroviajes
```

Alias (dominio personalizado):
```bash
vercel alias set https://client-csc586ipj-travper22-ops-projects.vercel.app aeroviajes
```

URLs del cliente:
- https://client-csc586ipj-travper22-ops-projects.vercel.app
- https://client-weld-ten-81.vercel.app

---

## Despliegue del Servidor

```bash
cd server && vercel --prod --yes --name aeroviajes-server
```

URLs del servidor:
- https://aeroviajes-server.vercel.app
- https://aeroviajes-server-cs2jaxmnu-travper22-ops-projects.vercel.app

Verificar deployments activos:
```bash
vercel ls aeroviajes-server
```

---

## Notas importantes
- El cliente corre en Vite (puerto local 5173)
- El servidor corre en Express (puerto local 5002)
- Esperar ~20s entre deploy del server y deploy del client para que Vercel registre el nuevo endpoint
- Si hay errores de build, revisar variables de entorno en el dashboard de Vercel
- Las variables de entorno del servidor (API keys de Amadeus, Stripe, etc.) deben estar configuradas en Vercel → Settings → Environment Variables
