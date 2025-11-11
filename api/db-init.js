import { q } from './_utils/db-node.js';

export default async function handler(req, res) {
  try {
    // 检查数据库连接
    const connectionTest = await q('SELECT now() as now, current_user as user');
    
    // 检查表是否存在
    const tableCheck = await q(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'files', 'posts', 'follows')
      ORDER BY table_name
    `);
    
    const tables = tableCheck.rows.map(row => row.table_name);
    const expectedTables = ['users', 'files', 'posts', 'follows'];
    const missingTables = expectedTables.filter(table => !tables.includes(table));
    
    // 检查视图是否存在
    const viewCheck = await q(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name IN ('posts_view', 'user_files_view', 'follows_view')
      ORDER BY table_name
    `);
    
    const views = viewCheck.rows.map(row => row.table_name);
    const expectedViews = ['posts_view', 'user_files_view', 'follows_view'];
    const missingViews = expectedViews.filter(view => !views.includes(view));
    
    res.json({
      ok: true,
      connection: connectionTest.rows[0],
      database: {
        tables: {
          existing: tables,
          missing: missingTables,
          allPresent: missingTables.length === 0
        },
        views: {
          existing: views,
          missing: missingViews,
          allPresent: missingViews.length === 0
        }
      },
      ready: missingTables.length === 0 && missingViews.length === 0,
      message: missingTables.length === 0 && missingViews.length === 0 
        ? '数据库已就绪' 
        : `缺少: ${[...missingTables, ...missingViews].join(', ')}`
    });
    
  } catch (e) {
    res.status(500).json({
      ok: false,
      env: !!process.env.DATABASE_URL,
      error: e.message,
      message: '数据库连接失败或表结构未初始化'
    });
  }
}