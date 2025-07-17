import type { LaundryItem, StoredItem } from './types';

// Los datos ahora se gestionan a través de Firebase Firestore.
// Estos arrays se dejan vacíos.
export const initialLaundryItems: LaundryItem[] = [];
export const initialStoredItems: StoredItem[] = [];

export const COLORES = [
     "Blanco", "Azul", "Verde", "Amarillo", "Naranja",
    "Morado", "Rosado"
];

export const RANGOS = {
  "Oficiales": [
    "General", "Mayor General", "Brigadier General", "Coronel", "Teniente Coronel",
    "Mayor", "Capitán", "Teniente", "Subteniente"
  ],
  "Suboficiales": [
    "Sargento Mayor de Comando Conjunto", "Sargento Mayor de Comando", "Sargento Mayor",
    "Sargento Primero", "Sargento Viceprimero", "Sargento Segundo", "Cabo Primero",
    "Cabo Segundo", "Cabo Tercero", "Soldado", "Soldado Regular"
  ],
  "Otros": [
    "Sin Rango / Civil"
  ]
};
