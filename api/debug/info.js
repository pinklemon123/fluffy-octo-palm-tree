// api/debug/info.js
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
    node_version: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString(),
  });
}