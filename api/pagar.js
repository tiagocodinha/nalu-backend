export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://tiagocodinha.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { descricao, valor } = req.body;

  const auth = Buffer.from(`${process.env.REDUNIQ_USER}:${process.env.REDUNIQ_PASS}`).toString("base64");

  try {
    const response = await fetch("https://gateway.reduniq.pt/api/payment/init", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ORDER_ID: `NALU-${Date.now()}`,
        ORDER_DESCRIPTION: descricao,
        AMOUNT: valor,
        CURRENCY: "978",
        LANGUAGE: "PT",
        RETURN_URL: "https://tiagocodinha.github.io/reduniq/sucesso.html",
        CANCEL_URL: "https://tiagocodinha.github.io/reduniq/erro.html"
      })
    });

    const data = await response.json();

        if (data.REDIRECT_URL) {
      res.status(200).json({ redirect_url: data.REDIRECT_URL });
    } else {
      console.error("Erro Reduniq:", data);
      res.status(502).json({
        error: "Erro na resposta da Reduniq",
        reduniq: data
      });
    }
  } catch (error) {
    console.error("Erro na integração com Reduniq:", error);
    res.status(500).json({ error: "Erro interno ao comunicar com Reduniq" });
  }
}