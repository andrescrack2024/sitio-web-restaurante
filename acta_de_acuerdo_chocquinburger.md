# ACTA DE ACUERDO Y CONTRATO DE PRESTACIÓN DE SERVICIOS DE DESARROLLO DE SOFTWARE

En la ciudad de Quibdó, Chocó, a los ______ días del mes de junio de 2026, se celebra el presente contrato de prestación de servicios tecnológicos entre las partes abajo firmantes:

1. **EL CONTRATISTA (Desarrollador)**:  
   **SHARLY ANDRES MOSQUERA RODRIGUEZ**, mayor de edad, identificado con Cédula de Ciudadanía N°. `[Tu Cédula Aquí]`, actuando en calidad de desarrollador de software independiente.
   
2. **EL CONTRATANTE (Cliente)**:  
   **EDWIN [Apellido del Cliente]** (Representante de Chocquinburger), identificado con la Cédula / NIT N°. `[Cédula o NIT del Cliente]`.

Ambas partes han acordado libre y voluntariamente suscribir el presente documento regulado por las siguientes cláusulas:

---

## CLÁUSULAS

### PRIMERA: OBJETO DEL CONTRATO
**EL CONTRATISTA** se compromete a realizar el diseño, desarrollo, implementación, optimización y puesta en marcha del sitio web oficial de pedidos de comida rápida y helados de la marca **CHOCQUINBURGER** (bajo la identidad visual de "Rápido & Deli"), incluyendo su panel de administración y monitor de pedidos táctil en tiempo real.

### SEGUNDA: ALCANCE DEL PROYECTO (ENTREGABLES)
El desarrollo contratado incluye las siguientes especificaciones y características funcionales:
1. **Catálogo Digital Interactivo**: Diseño visual premium responsivo con modo oscuro por defecto y modo claro alternable.
2. **Selector de Salsas Táctiles**: Sistema de pastillas táctiles grandes para selección rápida de salsas en hamburguesas, perros y salchipapas.
3. **Carrito de Compras y Checkout**: Cálculo dinámico del total, sumando los costos específicos de domicilio por barrios reales de Quibdó (Jardín, Centro, Medrano, Porvenir, etc.).
4. **Mensajería Estructurada de WhatsApp**: Generación de un mensaje estructurado y detallado para enviar directamente el pedido al chat de WhatsApp de la empresa de manera limpia.
5. **Modal de Confirmación de Datos**: Formulario emergente para Nombre, Teléfono, Dirección de Entrega y Método de Pago (Efectivo o Llave/Transfiya).
6. **Guía Interactiva Bidireccional Táctica**: Asistente con manitos indicadoras (`👇` / `👆`) que guían al cliente paso a paso por los campos de compra. Si el cliente regresa a un campo anterior, la guía retrocede reactivamente con él.
7. **Instrucciones de Pago con Copiado de Un Clic**: Caja interactiva para pagos digitales que permite copiar el número de la cuenta al portapapeles con un botón y muestra la manito apuntadora.
8. **Cargador Rápido (Cold Start)**: Pantalla de carga (loader) inmediata con aviso al cliente mientras el servidor en la nube (Render) despierta.
9. **Caché de Alto Rendimiento (SWR)**: Carga instantánea del catálogo en 0 ms usando almacenamiento local y sincronización en segundo plano con la base de datos.
10. **Panel de Administración Privado (`/#admin`)**: Acceso restringido por contraseña para gestionar platos, precios, descripciones e ingredientes.
11. **Compresión de Imágenes en Cliente (Ahorro de Costos)**: Reducción automática de peso de fotos a base64 (20KB - 50KB) mediante HTML5 Canvas, permitiendo almacenar imágenes directamente en Firestore y mantener el servidor 100% gratuito sin usar almacenamiento de pago.
12. **Monitor POS de Pedidos en Vivo**: Pantalla de control de comandas en tiempo real con recepción de pedidos, cambio de estados, validación de transferencias y notificaciones de estados al cliente por WhatsApp.
13. **Impresión de Comandas Térmicas de Cocina**: Formato adaptable a tamaño de página completa o ticket térmico con desglose legible de salsas e ingredientes.

### TERCERA: PRECIO Y VALOR DEL CONTRATO
Las partes acuerdan fijar el valor total del proyecto en la suma de **UN MILLÓN OCHO CIENTOS MIL PESOS COLOMBIANOS ($1.800.000 COP)** netos.

### CUARTA: FORMA DE PAGO
El valor estipulado en la Cláusula Tercera se cancelará de la siguiente manera:
*   **Anticipo del 50% ($900.000 COP)**: A la firma del presente contrato y previo al inicio del desarrollo técnico en producción.
*   **Saldo del 50% ($900.000 COP)**: Contra entrega final del sitio web en el dominio definitivo del cliente y validación de su correcto funcionamiento.

Los pagos serán realizados vía transferencia electrónica a las cuentas de **EL CONTRATISTA** (Nequi / Daviplata / Transfiya).

### QUINTA: PLAZO DE ENTREGA
**EL CONTRATISTA** entregará el desarrollo web completo y funcional en un plazo máximo de [Especificar días, ej. 15] días hábiles contados a partir del recibo del anticipo del 50% y de la entrega de toda la información (menú, precios definitivos, logos e insumos gráficos) por parte de **EL CONTRATANTE**.

### SÉPTIMA: PROPIEDAD INTELECTUAL Y GARANTÍA DE PAGO (PROTECCIÓN CONTRA FRAUDE)
1. **EL CONTRATISTA** mantendrá la autoría de la propiedad intelectual y el control técnico exclusivo del alojamiento del sitio web (hosting/servidor) y la base de datos hasta que **EL CONTRATANTE** liquide el 100% del valor acordado.
2. **CLÁUSULA DE SUSPENSIÓN POR INCUMPLIMIENTO**: En caso de que **EL CONTRATANTE** no realice el pago del saldo final del 50% en un plazo máximo de Ascender a cinco (5) días calendario posteriores a la entrega y conformidad del sitio, **EL CONTRATISTA** queda plenamente facultado para suspender de forma temporal o definitiva el funcionamiento del sitio web, dar de baja los archivos en el servidor o desvincular la base de datos Firestore, sin que esto constituya incumplimiento contractual ni genere derecho a reclamación o indemnización alguna a favor del cliente. El servicio se reactivará una vez se verifique la liquidación total del saldo pendiente.

### OCTAVA: SOPORTE Y GARANTÍA
**EL CONTRATISTA** ofrece una garantía de soporte técnico de treinta (30) días calendario a partir de la entrega final para corregir cualquier fallo técnico inherente al código o base de datos. Modificaciones del alcance, nuevos productos, cambios de diseño o funcionalidades adicionales no estipuladas en este documento se cotizarán como servicios independientes.

Para constancia y cumplimiento, las partes firman el presente contrato por duplicado a los ______ días del mes de junio de 2026.

<br><br><br>

| | |
| :--- | :--- |
| __________________________________________ | __________________________________________ |
| **EL CONTRATISTA** | **EL CONTRATANTE** |
| **Sharly Andres Mosquera Rodriguez** | **Edwin [Apellido del Cliente]** (Chocquinburger) |
| C.C. `[Tu Cédula]` | C.C. / NIT. `[Cédula o NIT]` |
| Cel. 312 660 2583 | Cel. __________________________________ |
| Desarrollador de Software | Cliente |
