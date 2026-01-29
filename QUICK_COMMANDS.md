# 🚀 Quick Commands Reference

## Para Probar Localmente

```bash
# Terminal 1 - Backend
cd /Users/sebastian/realestate/server
npm run dev

# Terminal 2 - Frontend
cd /Users/sebastian/realestate/client
npm run dev

# Luego abre: http://localhost:3000
```

## Para Verificar TypeScript

```bash
cd /Users/sebastian/realestate/client
npx tsc --noEmit
```

## Para Hacer Build (Antes de Deploy)

```bash
# Frontend
cd /Users/sebastian/realestate/client
npm run build

# Backend
cd /Users/sebastian/realestate/server
npm run build
```

## Para Limpiar Node Modules (Si algo falla)

```bash
# Frontend
cd /Users/sebastian/realestate/client
rm -rf node_modules package-lock.json
npm install

# Backend
cd /Users/sebastian/realestate/server
rm -rf node_modules package-lock.json
npm install
```

## Para Hacer Lint

```bash
cd /Users/sebastian/realestate/client
npm run lint
```

## Para Correr en Producción

```bash
# Frontend
cd /Users/sebastian/realestate/client
npm run build
npm start

# Backend (en otra terminal)
cd /Users/sebastian/realestate/server
npm run build
npm start
```

---

## 📊 Ver Performance en DevTools

1. Abre http://localhost:3000
2. Presiona F12 (DevTools)
3. Ve a Network tab
4. Recarga la página (Cmd+R o Ctrl+R)
5. Observa que los requests se ejecutan en paralelo (no secuenciales)

---

## 📚 Leer Documentación

```bash
# Resumen ejecutivo (2 minutos)
cat /Users/sebastian/realestate/OPTIMIZATION_SUMMARY.md

# Documentación técnica completa (15 minutos)
cat /Users/sebastian/realestate/PERFORMANCE_OPTIMIZATION_COMPLETE.md

# Guía de testing (10 minutos)
cat /Users/sebastian/realestate/TESTING_GUIDE.md

# Índice de toda la documentación
cat /Users/sebastian/realestate/DOCUMENTATION_INDEX.md
```

---

**Hecho**: Ready to go! ✅
