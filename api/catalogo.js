// api/catalogo.js
export default async function handler(req, res) {
    // ---------------------------------------------------------
    // ID CORRECTO DE RIVER SOUL (Confirmado)
    const SELLER_ID = 118858447;
    // ---------------------------------------------------------

    try {
        // 1. Buscamos los productos directamente usando el ID numérico
        const response = await fetch(`https://api.mercadolibre.com/sites/MLA/search?seller_id=${SELLER_ID}&limit=50`);
        const data = await response.json();

        // Verificamos si trajo resultados
        if (!data.results || data.results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron productos para este vendedor' });
        }

        // 2. Limpiamos los datos para enviar al HTML
        const productos = data.results.map(item => ({
            id: item.id,
            titulo: item.title,
            precio: item.price,
            stock: item.available_quantity, // Dato clave para el aviso de "Últimas unidades"
            link: item.permalink,
            imagen: item.thumbnail.replace('I.jpg', 'O.jpg'), // Mejora la calidad de la imagen
            cuotas: item.installments ? `Hasta ${item.installments.quantity}x` : null,
            envioGratis: item.shipping.free_shipping
        }));

        // 3. Cacheamos la respuesta por 1 hora para que la web vuele
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        // 4. Enviamos la respuesta
        res.status(200).json(productos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error de conexión con Mercado Libre' });
    }
}