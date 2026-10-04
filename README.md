# ProLnk

Aplicación React de apoyo académico con cuentas gestionadas por Netlify Identity, perfiles e historial en Netlify Database y un tutor conectado a Netlify AI Gateway mediante funciones del servidor.

## Desarrollo

Instala las dependencias con `bun install` y ejecuta `netlify dev --port 8889`. El servidor de Netlify ofrece la interfaz de Vite y los endpoints de cuentas y chats en el mismo origen. `npm run dev` sirve únicamente la interfaz y no emula los servicios de Netlify.

Ejecuta `npm run lint` para comprobar los tipos.

## Cuentas y perfiles

Las cuentas requieren correo y contraseña; cuando Identity exige confirmación, el registro muestra instrucciones para verificar el correo antes de acceder. La aplicación procesa los enlaces de confirmación y los retornos OAuth al abrir la página. El inicio de sesión restaura el perfil existente sin sobrescribir los cambios guardados.

El botón de Google usa Netlify Identity y comprueba si el proveedor está habilitado. Para ofrecer ese acceso, configura Google en las opciones de Identity del sitio. El registro por correo no depende de Google.

Demo Login se mantiene como una visita de demostración sin contraseña compartida ni cuenta real. Su perfil se puede editar durante la visita, pero no se guarda de forma permanente. Los chats de la demo usan el mismo asistente real que la vista pública, con los límites de visitantes.

## Persistencia y chats

El esquema está en `db/schema.ts`, con migraciones en `netlify/database/migrations`. Netlify aplica las migraciones durante el despliegue y configura la conexión automáticamente. Si cambia el esquema, genera una migración con `npx drizzle-kit generate --name nombre_descriptivo`.

Los chats usan `gpt-4.1-mini` desde una función de Netlify, sin credenciales en el navegador. Las cuentas autenticadas conservan su historial, separado por cuenta y vista. Los visitantes envían el contexto de la conversación actual sin guardar un historial personal. La preferencia de explicación del perfil se utiliza al responder.

Los errores de autenticación, guardado e inferencia se muestran sin fingir una sesión válida ni sustituir las respuestas por texto prefabricado. Los límites de solicitudes se mantienen en la base de datos y las operaciones de escritura comprueban el origen de la solicitud.

Identity queda marcado para activación en el despliegue. AI Gateway requiere que las funciones desplegadas tengan acceso al servicio y que exista un despliegue de producción del sitio. La validación local de interfaces puede realizarse sin crear cuentas reales; las pruebas de correo, OAuth, persistencia e inferencia reales requieren los servicios activados en el entorno desplegado.
