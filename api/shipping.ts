export default async function handler(req: any, res: any) {
  return res.status(200).json({ ok: true, test: 'shipping-alive', method: req.method });
}
