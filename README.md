# LanzaExpress - App de Gestión de Lavandería

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

---

## Cómo Subir Este Proyecto a GitHub

Sigue estos pasos para subir tu código a un repositorio en GitHub.

### Prerrequisito: Crear un Repositorio en GitHub

1.  Ve a [GitHub](https://github.com) e inicia sesión.
2.  Haz clic en el botón **"New"** para crear un nuevo repositorio.
3.  Dale un nombre (por ejemplo, `lanza-express-app`), elige si será público o privado y **no inicialices** con un `README` o `.gitignore`, ya que el proyecto ya los tiene.
4.  Copia la URL del repositorio que te proporciona GitHub (será algo como `https://github.com/tu-usuario/tu-repositorio.git`).

### Paso 1: Inicializar Git en tu Proyecto Local

Abre una terminal en la carpeta raíz de tu proyecto y ejecuta este comando. Si ya lo hiciste, puedes saltar este paso.

```bash
git init -b main
```

### Paso 2: Conectar tu Repositorio Local con GitHub

Usa la URL que copiaste de GitHub en el siguiente comando.

```bash
git remote add origin TU_URL_DEL_REPOSITORIO.git
```
*Reemplaza `TU_URL_DEL_REPOSITORIO.git` con tu URL real.*

### Paso 3: Añadir y Confirmar tus Archivos (Commit)

Estos comandos preparan y guardan una "instantánea" de tu proyecto.

```bash
git add .
git commit -m "Primer commit: Versión inicial del proyecto"
```

### Paso 4: Subir tu Código a GitHub

Finalmente, este comando envía tus archivos a tu repositorio en GitHub.

```bash
git push -u origin main
```

¡Y listo! Tu código ya estará visible en tu perfil de GitHub.
