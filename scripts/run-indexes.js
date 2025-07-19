const { Pool } = require("pg");

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "workshop_db",
  password: process.env.DB_PASSWORD || "admin123",
  port: parseInt(process.env.DB_PORT || "5432"),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl:
    process.env.DB_HOST && process.env.DB_HOST !== "localhost"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

async function executeQuery(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

async function createIndexes() {
  console.log(
    "🚀 Creating PostgreSQL indexes for performance optimization...\n"
  );

  const indexQueries = [
    // Primary indexes for JOINs
    "CREATE INDEX IF NOT EXISTS idx_auth_id ON auth(id)",
    "CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id)",
    "CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_user_divisions_user_id ON user_divisions(user_id)",

    // Composite indexes for better performance
    "CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON user_roles(user_id, role)",
    "CREATE INDEX IF NOT EXISTS idx_user_divisions_user_division ON user_divisions(user_id, division_name)",

    // Additional indexes for future queries
    "CREATE INDEX IF NOT EXISTS idx_auth_email ON auth(email)",
    "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",

    // Analyze tables to update statistics
    "ANALYZE users",
    "ANALYZE auth",
    "ANALYZE user_roles",
    "ANALYZE user_divisions",
  ];

  try {
    for (let i = 0; i < indexQueries.length; i++) {
      const query = indexQueries[i];
      console.log(`📝 Executing: ${query}`);

      await executeQuery(query);
      console.log(
        `✅ Success: ${query.split(" ")[0]} ${query.split(" ")[1]}\n`
      );
    }

    // Check index usage statistics
    console.log("📊 Checking index usage statistics...\n");
    const statsQuery = `
      SELECT 
        schemaname,
        relname as tablename,
        indexrelname as indexname,
        idx_scan as scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public' 
        AND relname IN ('users', 'auth', 'user_roles', 'user_divisions')
      ORDER BY relname, idx_scan DESC
    `;

    const stats = await executeQuery(statsQuery);
    console.log("📈 Index Usage Statistics:");
    console.table(stats.rows);

    // Test the optimized query
    console.log("\n🧪 Testing optimized user by ID query...\n");
    const testQuery = `
      EXPLAIN (ANALYZE, BUFFERS) 
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.birth_date,
        u.bio,
        u.long_bio,
        u.profile_json,
        u.address,
        u.phone_number,
        u.created_at,
        u.updated_at,
        a.email,
        ur.role,
        ud.division_name
      FROM users u
      LEFT JOIN auth a ON u.auth_id = a.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN user_divisions ud ON u.id = ud.user_id
      WHERE u.id = 1
      LIMIT 1
    `;

    const queryPlan = await executeQuery(testQuery);
    console.log("📋 Query Execution Plan:");
    queryPlan.rows.forEach((row) => {
      console.log(row["QUERY PLAN"]);
    });

    console.log("\n🎉 All indexes created successfully!");
    console.log("💡 Your queries should now be much faster.");
  } catch (error) {
    console.error("❌ Error creating indexes:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  createIndexes()
    .then(() => {
      console.log("\n✨ Index creation completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Failed to create indexes:", error);
      process.exit(1);
    });
}

module.exports = { createIndexes };
