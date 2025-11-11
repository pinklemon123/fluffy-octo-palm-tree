import { requireUser } from './_utils/auth-node.js';

export default async function handler(req, res) {
  try {
    const username = requireUser(req);
    res.json({ ok: true, user: username });
  } catch (e) {
    res.status(401).json({ ok: false, error: e.message });
  }
}
