import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import {
  httpRequestsTotal,
  httpRequestDuration,
  databaseQueryDuration,
} from "@/lib/metrics";

export async function GET(request: Request) {
  console.time("Users API Execution");
  const start = Date.now();
  const method = request.method;
  const route = "/api/users";

  try {
    // Parse query parameters with proper validation
    const url = new URL(request.url);
    const divisionFilter = url.searchParams.get("division");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50"),
      100
    ); // Max 100 per page
    const offset = (page - 1) * limit;

    // Optimized query using window functions and proper joins
    let query = `
      WITH user_stats AS (
        SELECT 
          user_id,
          COUNT(*) as log_count,
          COUNT(CASE WHEN action = 'login' THEN 1 END) as login_count,
          COUNT(CASE WHEN action = 'update_profile' THEN 1 END) as update_count,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_logs
        FROM user_logs 
        GROUP BY user_id
      ),
      user_aggregates AS (
        SELECT 
          COUNT(*) OVER() as total_users,
          COUNT(*) OVER(ORDER BY created_at DESC) as newer_users
        FROM users
        LIMIT 1
      )
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
        ud.division_name,
        -- Use window functions instead of correlated subqueries
        ua.total_users,
        ua.newer_users,
        COALESCE(us.log_count, 0) as log_count,
        CASE WHEN ur.role IS NOT NULL THEN 1 ELSE 0 END as role_count,
        CASE WHEN ud.division_name IS NOT NULL THEN 1 ELSE 0 END as division_count,
        COALESCE(us.login_count, 0) as login_count,
        COALESCE(us.update_count, 0) as update_count,
        COALESCE(us.recent_logs, 0) as recent_logs,
        -- Simplified string operations
        u.full_name || ' (' || COALESCE(ur.role, 'no role') || ')' as display_name,
        COALESCE(NULLIF(u.bio, ''), 'No bio available') as bio_display,
        -- Simplified JSON operations
        COALESCE(
          u.profile_json->'social_media'->>'instagram',
          'No Instagram'
        ) as instagram_handle
      FROM users u
      LEFT JOIN auth a ON u.auth_id = a.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN user_divisions ud ON u.id = ud.user_id
      LEFT JOIN user_stats us ON u.id = us.user_id
      CROSS JOIN user_aggregates ua
    `;

    // Add WHERE clause with proper parameterization
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (divisionFilter && divisionFilter !== "all") {
      query += ` WHERE ud.division_name = $${paramIndex}`;
      params.push(divisionFilter);
      paramIndex++;
    }

    // Add pagination
    query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    params.push(limit, offset);

    const dbStart = Date.now();
    const result = await executeQuery(query, params);
    const dbDuration = (Date.now() - dbStart) / 1000;
    databaseQueryDuration.observe({ query_type: "users_query" }, dbDuration);

    // Simplified data processing
    const users = result.rows.map((user: any) => {
      const profileJson = user.profile_json || {};

      // Calculate derived fields efficiently
      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(user.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const isActive = user.log_count > 5;
      const isSenior = user.role === "admin" || user.role === "moderator";

      // Calculate profile completeness
      const profileFields = [
        user.bio,
        user.address,
        user.phone_number,
        user.profile_json,
      ];
      const profileCompleteness =
        (profileFields.filter(Boolean).length / 4) * 100;

      return {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        birthDate: user.birth_date,
        bio: user.bio,
        longBio: user.long_bio,
        profileJson: profileJson,
        address: user.address,
        phoneNumber: user.phone_number,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        role: user.role,
        division: user.division_name,
        displayName: user.display_name,
        bioDisplay: user.bio_display,
        instagramHandle: user.instagram_handle,
        // Optimized calculated fields
        totalUsers: user.total_users,
        newerUsers: user.newer_users,
        logCount: user.log_count,
        roleCount: user.role_count,
        divisionCount: user.division_count,
        loginCount: user.login_count,
        updateCount: user.update_count,
        recentLogs: user.recent_logs,
        // Derived fields
        daysSinceCreated,
        isActive,
        isSenior,
        socialMedia: profileJson.social_media || {},
        preferences: profileJson.preferences || {},
        skills: profileJson.skills || [],
        interests: profileJson.interests || [],
        // Boolean flags
        hasProfile: !!user.profile_json,
        hasBio: !!user.bio,
        hasAddress: !!user.address,
        hasPhone: !!user.phone_number,
        profileCompleteness,
      };
    });

    // Efficient summary calculation
    const summary = users.reduce(
      (acc, user) => {
        if (user.isActive) acc.activeUsers++;
        if (user.isSenior) acc.seniorUsers++;
        if (user.profileCompleteness > 75) acc.usersWithCompleteProfiles++;
        acc.usersByDivision[user.division] =
          (acc.usersByDivision[user.division] || 0) + 1;
        return acc;
      },
      {
        activeUsers: 0,
        seniorUsers: 0,
        usersWithCompleteProfiles: 0,
        usersByDivision: {} as Record<string, number>,
      }
    );

    const {
      activeUsers: activeUserCount,
      seniorUsers: seniorUserCount,
      usersWithCompleteProfiles: usersWithCompleteProfileCount,
      usersByDivision: summarizedUsersByDivision,
    } = summary;

    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe({ method, route }, duration);
    httpRequestsTotal.inc({ method, route, status: "200" });

    console.timeEnd("Users API Execution");
    return NextResponse.json({
      users,
      total: users.length,
      activeUsers: activeUserCount,
      seniorUsers: seniorUserCount,
      usersWithCompleteProfiles: usersWithCompleteProfileCount,
      usersByDivision: summarizedUsersByDivision,
      filteredBy: divisionFilter || "all",
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("Users API error:", error);
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe({ method, route }, duration);
    httpRequestsTotal.inc({ method, route, status: "500" });

    console.timeEnd("Users API Execution");
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
