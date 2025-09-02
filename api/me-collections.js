// Vercel Serverless Function: /api/me-collections
// Proxy Magic Eden (clé gardée côté serveur)

export default async function handler(req, res) {
  try {
    const { address, offset = "0", limit = "100" } = req.query;
    if (!address) return res.status(400).json({ error: "Missing address" });

    // NOTE: adapte l’URL si tu passes en mainnet pur plus tard
    const url = `https://api-mainnet.magiceden.dev/v3/rtp/monad-testnet/users/${address}/collections/v3?includeTopBid=false&includeLiquidCount=false&offset=${offset}&limit=${limit}`;

    const r = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: process.env.ME_API_KEY, // <-- clé stockée sur Vercel
      },
    });

    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
