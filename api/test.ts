export default function handler(req: any, res: any) {
  res.status(200).json({ ok: true, ts: Date.now(), method: req.method });
}
