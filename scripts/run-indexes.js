const { executeQuery } = require("../src/lib/database");

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
        tablename,
        indexname,
        idx_scan as scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public' 
        AND tablename IN ('users', 'auth', 'user_roles', 'user_divisions')
      ORDER BY tablename, idx_scan DESC
    `;

    const stats = await executeQuery(statsQuery);
    console.log("📈 Index Usage Statistics:");
    console.table(stats.rows);

    console.log("\n🎉 All indexes created successfully!");
    console.log("💡 Your queries should now be much faster.");
  } catch (error) {
    console.error("❌ Error creating indexes:", error.message);
    process.exit(1);
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
