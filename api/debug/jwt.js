// JWT调试工具 - 检查token内容和验证过程
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization;
    
    if (!auth) {
      return res.json({
        step: 'no_auth_header',
        error: 'No Authorization header found',
        headers: Object.keys(req.headers)
      });
    }

    if (!auth.startsWith('Bearer ')) {
      return res.json({
        step: 'invalid_auth_format', 
        error: 'Authorization header does not start with Bearer',
        auth_header: auth
      });
    }

    const token = auth.slice(7);
    
    if (!token) {
      return res.json({
        step: 'empty_token',
        error: 'Token is empty after Bearer',
        auth_header: auth
      });
    }

    // 尝试解码但不验证（看payload内容）
    let decoded;
    try {
      decoded = jwt.decode(token);
    } catch (e) {
      return res.json({
        step: 'decode_failed',
        error: 'Cannot decode JWT',
        token_length: token.length,
        token_start: token.substring(0, 20) + '...'
      });
    }

    // 检查JWT_SECRET
    const secret = process.env.JWT_SECRET || 'dev';
    
    // 尝试验证
    let verified;
    try {
      verified = jwt.verify(token, secret);
    } catch (e) {
      return res.json({
        step: 'verify_failed',
        error: e.message,
        decoded_payload: decoded,
        secret_exists: !!process.env.JWT_SECRET,
        secret_length: secret.length
      });
    }

    return res.json({
      step: 'success',
      decoded_payload: decoded,
      verified_payload: verified,
      has_sub: !!verified.sub,
      has_userId: !!verified.userId,
      has_username: !!verified.username,
      secret_length: secret.length
    });

  } catch (e) {
    res.status(500).json({
      step: 'server_error',
      error: e.message,
      stack: e.stack
    });
  }
}