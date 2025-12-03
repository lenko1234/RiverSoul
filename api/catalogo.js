// api/catalogo.js
export default async function handler(req, res) {
    // 1. Definimos el NICKNAME del vendedor (tal cual aparece en ML)
    const SELLER_NICKNAME = 'RIVERSOUL';

    try {
        // 2. Buscamos el ID del vendedor usando su nickname
        const sellerSearch = await fetch(`https://api.mercadolibre.com/sites/MLA/search?nickname=${SELLER_NICKNAME}`);
        const sellerData = await sellerSearch.json();
        const sellerId = sellerData.seller?.id;

        if (!sellerId) {
            // Fallback: Si no encuentra por nickname, usamos el ID directo si lo conseguimos después
            return res.status(404).json({ error: 'Vendedor no encontrado' });
        }

        // 3. Buscamos los productos de ese vendedor
        // Limitamos a 50 productos para que sea rápido
        const response = await fetch(`https://api.mercadolibre.com/sites/MLA/search?seller_id=${sellerId}&limit=50`);
        const data = await response.json();

        // 4. Limpiamos los datos para enviar solo lo que nos importa al HTML
        const productos = data.results.map(item => ({
            id: item.id,
            titulo: item.title,
            precio: item.price,
            link: item.permalink,
            imagen: item.thumbnail.replace('I.jpg', 'O.jpg'), // Truco para mejor calidad de imagen
            cuotas: item.installments ? `Hasta ${item.installments.quantity}x` : null,
            envioGratis: item.shipping.free_shipping
        }));

        // 5. Cacheamos la respuesta por 1 hora (3600 segundos)
        // Esto hace que funcione súper rápido y no sature a Mercado Libre
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        // 6. Devolvemos el JSON listo
        res.status(200).json(productos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error conectando con Mercado Libre' });
    }
}