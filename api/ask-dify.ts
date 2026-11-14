declare const process: { env: Record<string, string | undefined> }
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.DIFY_API_KEY
  const base = process.env.DIFY_BASE_URL ?? 'https://api.dify.ai/v1'
  if (!key) {
    return res.status(500).json({ error: 'Chưa cấu hình DIFY_API_KEY trên Vercel' })
  }

  const { query, inputs } = req.body ?? {}
  try {
    const r = await fetch(`${base}/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: inputs ?? {},
        query: query ?? '',
        response_mode: 'blocking',
        user: 'web-user',
      }),
    })
    const data = await r.json()
    if (!r.ok) {
      return res.status(r.status).json({ error: data.message ?? 'Dify trả lỗi' })
    }
    return res.status(200).json({ answer: data.answer })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}