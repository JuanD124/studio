# Lanzaexpres - App de Gestión de Lavandería

Este es un proyecto Next.js para gestionar artículos almacenados y servicios de lavandería, construido con React, TypeScript, Tailwind CSS, ShadCN UI y Firebase.

## Cómo ejecutar este proyecto en tu ordenador

Sigue estos pasos para tener una copia del proyecto funcionando en tu máquina local.

### Prerrequisitos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (se recomienda la versión LTS). Esto también instalará `npm`, el gestor de paquetes que necesitas.

### Paso 1: Instalar las dependencias

Una vez que hayas descargado y descomprimido el proyecto, abre una terminal en la carpeta raíz del proyecto y ejecuta el siguiente comando para instalar todas las librerías necesarias:

```bash
npm install
```

### Paso 2: Configurar tus credenciales de Firebase

La aplicación se conecta a Firebase para guardar y leer todos los datos. Necesitas añadir tus propias credenciales para que funcione.

1.  Abre el archivo: `src/lib/firebase.ts`
2.  Busca el objeto `firebaseConfig`.
3.  Reemplaza los valores de marcador de posición con las credenciales reales de tu proyecto de Firebase. Puedes encontrarlas en la **Configuración de tu proyecto** en la consola de Firebase.

```typescript
// Ejemplo en src/lib/firebase.ts
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### Paso 3: ¡Ejecutar el proyecto!

Una vez instaladas las dependencias y configurado Firebase, inicia el servidor de desarrollo local con este comando:

```bash
npm run dev
```

Abre tu navegador y ve a [http://localhost:3000](http://localhost:3000). ¡Deberías ver tu aplicación funcionando!
