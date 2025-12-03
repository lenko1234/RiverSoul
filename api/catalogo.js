// api/catalogo.js - ¡VERSIÓN FINAL Y COMPLETA!
export default async function handler(req, res) {
    // ---------------------------------------------------------
    // ID CORRECTO Y DEFINITIVO DE RIVER SOUL
    const SELLER_ID = 253763784;
    // ---------------------------------------------------------

    try {
        const apiUrl = `https://api.mercadolibre.com/sites/MLA/search?seller_id=${SELLER_ID}&limit=50`;

        // Ejecutamos el fetch con el encabezado User-Agent (Para evadir el bloqueo 403)
        const response = await fetch(apiUrl, {
            headers: {
                // Se hace pasar por un navegador Chrome estándar
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            // Si el 403 persiste, es un bloqueo total de ML.
            console.error('API Error Response:', response.status);
            return res.status(response.status).json({
                error: 'Fallo al conectar con ML. El bloqueo 403 persiste.',
                details: 'Esto es un bloqueo de seguridad temporal de Mercado Libre a la IP de Vercel.'
            });
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron productos activos para este ID' });
        }

        const productos = data.results.map(item => ({
            id: item.id,
            titulo: item.title,
            precio: item.price,
            stock: item.available_quantity,
            link: item.permalink,
            imagen: item.thumbnail.replace('I.jpg', 'O.jpg'),
            cuotas: item.installments ? `Hasta ${item.installments.quantity}x` : null,
            envioGratis: item.shipping.free_shipping
        }));

        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.status(200).json(productos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno en la función de Vercel' });
    }
}