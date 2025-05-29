export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://tiagocodinha.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const auth = Buffer.from(`${process.env.REDUNIQ_USER}:${process.env.REDUNIQ_PASS}`).toString("base64");

    const response = await fetch("https://gateway.reduniq.pt/api/payment/init", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ORDER_ID: `TESTE-${Date.now()}`,
        ORDER_DESCRIPTION: "Teste Reduniq",
        AMOUNT: 1500,
        CURRENCY: "978",
        LANGUAGE: "PT",
        RETURN_URL: "https://google.com",
        CANCEL_URL: "https://google.com"
      })
    });

    const data = await response.json();
    console.log("Reduniq response:", data);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro no fetch:", error);
    return res.status(500).json({ error: "Erro no fetch", detalhe: error.message });
  }
}
