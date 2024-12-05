# @bridge

## Descripción

@bridge es un proyecto que actúa como puente entre diferentes sistemas, facilitando la gestión de créditos y débitos a través de una API.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

- `src/`: Contiene el código fuente principal
  - `handlers/`: Manejadores para créditos y débitos
  - `middleware/`: Middleware para manejo de errores y logging
  - `core.js`: Funcionalidades centrales del proyecto
  - `index.js`: Punto de entrada de la aplicación
  - `ledger.js`: Configuración y funciones relacionadas con el ledger

## Requisitos

- Node.js (versión recomendada: 14.x o superior)
- npm (normalmente viene con Node.js)

## Instalación

1. Clonar este repositorio
2. Navegar al directorio del proyecto
3. Ejecutar `npm install` para instalar las dependencias

## Base de datos

La carpeta `db` contiene un yaml con la configuración de la base de datos que requiere el servicio, instale docket (https://docs.docker.com/get-docker/) y sobre la carpeta ejecute.

```bash
docker compose up
```

## Configuración

Debe configurar las variables de entorno necesarias antes de ejecutar la aplicación. Debe actualizar el archivo `config.js` en la raíz del proyecto con las siguientes variables:

```
export const config ={
    LEDGER_SERVER :[URL del servidor donde reside el ledger]
    LEDGER_HANDLE : [Nombre de la instacia del ledger]
    LEDGER_PUBLIC : [llave pública del ledger]
    BRIDGE_PUBLIC: [Llave pública del bridge que está configurando
    BRIDGE_PRIVATE: [Llave privada del bridge que está configurando]
    FORMAT: 'ed25519-raw',
    HASHING_ALGORITHM: 'sha256'
}
```

para obtener la llave pública del ledger, ejecute:

```bash
minka signer show system
```

Si usó el CLI, para generar la llave pública y privada del bridge, puede usar el siguiente comando para obtener la información

```bash
minka signer show [signer] -s
```

## Reglas de negocio

El archivo `validators.js` contiene el nombre de la cuenta (wallet) y el esquema de la mismas. Debe actualizar esta información con la configuración de su cuenta. Por ejemplo, el código está configurado para validar información de:

```bash
const BANK_WALLET = 'test.bank'
const SCHEMA_DEF = 'svgs'
```

Esto quiere decir, que una transferencia desde o hacia `tel:312330@test.bank` no va funcionar
