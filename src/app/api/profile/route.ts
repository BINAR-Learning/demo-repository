import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import { authMiddleware } from "@/lib/jwt";
import { ProfileData } from "@/lib/types";

async function getProfile(request: Request) {
  console.time("Profile Get Execution");

  try {
    const user = (request as any).user;

    const selectQuery = `
      SELECT 
        u.*,
        a.email,
        ur.role,
        ud.division_name,
        (SELECT COUNT(*) FROM user_logs WHERE user_id = u.id) as log_count,
        (SELECT COUNT(*) FROM user_roles WHERE user_id = u.id) as role_count,
        (SELECT COUNT(*) FROM user_divisions WHERE user_id = u.id) as division_count
      FROM users u
      LEFT JOIN auth a ON u.auth_id = a.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN user_divisions ud ON u.id = ud.user_id
      WHERE u.id = $1
    `;

    const result = await executeQuery(selectQuery, [user.userId]);

    if (result.rows.length === 0) {
      console.timeEnd("Profile Get Execution");
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const userData = result.rows[0];

    console.timeEnd("Profile Get Execution");
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        authId: userData.auth_id,
        username: userData.username,
        fullName: userData.full_name,
        email: userData.email,
        bio: userData.bio,
        longBio: userData.long_bio,
        profileJson: userData.profile_json,
        address: userData.address,
        phoneNumber: userData.phone_number,
        birthDate: userData.birth_date,
        profilePictureUrl: userData.profile_picture_url,
        role: userData.role,
        division: userData.division_name,
        logCount: userData.log_count,
        roleCount: userData.role_count,
        divisionCount: userData.division_count,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      },
    });
  } catch (error) {
    console.error("Profile get error:", error);
    console.timeEnd("Profile Get Execution");
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

async function updateProfile(request: Request) {
  console.time("Profile Update Execution");

  try {
    const {
      username,
      fullName,
      email,
      phone,
      birthDate,
      bio,
      longBio,
      address,
      profileJson,
      profilePictureUrl,
    }: ProfileData = await request.json();

    const errors: Partial<Record<keyof ProfileData, string>> = {};

    // Username validation
    if (!username || username.length < 3) {
      errors.username = "Username must be at least 3 characters.";
    } else if (username.length > 50) {
      errors.username = "Username must be 50 characters or less.";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.username =
        "Username can only contain letters, numbers, hyphens, and underscores.";
    }

    // Full name validation
    if (!fullName || fullName.trim().length === 0) {
      errors.fullName = "Full name is required.";
    } else if (fullName.length > 100) {
      errors.fullName = "Full name must be 100 characters or less.";
    }

    // Email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Must be a valid email format.";
    }

    // Phone validation
    if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ""))) {
      errors.phone = "Please enter a valid phone number.";
    }

    // Birth date validation
    if (birthDate) {
      const date = new Date(birthDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) {
        errors.birthDate = "Birth date cannot be in the future.";
      }
      const age = today.getFullYear() - date.getFullYear();
      if (age > 120) {
        errors.birthDate = "Please enter a valid birth date.";
      }
    }

    // Bio validation
    if (bio && bio.length > 160) {
      errors.bio = "Bio must be 160 characters or less.";
    }

    // Long bio validation
    if (longBio && longBio.length > 2000) {
      errors.longBio = "Long bio must be 2000 characters or less.";
    }

    if (Object.keys(errors).length > 0) {
      console.timeEnd("Profile Update Execution");
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const user = (request as any).user;

    // Get current user data for audit trail
    const currentUserQuery = `
      SELECT username, full_name, bio, long_bio, address, phone_number, 
             profile_json, profile_picture_url, birth_date
      FROM users WHERE id = $1
    `;
    const currentUserResult = await executeQuery(currentUserQuery, [
      user.userId,
    ]);
    const currentUser = currentUserResult.rows[0];

    // Prepare updated fields for audit trail
    const updatedFields: Record<string, any> = {};
    if (username !== currentUser.username)
      updatedFields.username = { old: currentUser.username, new: username };
    if (fullName !== currentUser.full_name)
      updatedFields.fullName = { old: currentUser.full_name, new: fullName };
    if (bio !== currentUser.bio)
      updatedFields.bio = { old: currentUser.bio, new: bio };
    if (longBio !== currentUser.long_bio)
      updatedFields.longBio = { old: currentUser.long_bio, new: longBio };
    if (address !== currentUser.address)
      updatedFields.address = { old: currentUser.address, new: address };
    if (phone !== currentUser.phone_number)
      updatedFields.phone = { old: currentUser.phone_number, new: phone };
    if (profilePictureUrl !== currentUser.profile_picture_url)
      updatedFields.profilePictureUrl = {
        old: currentUser.profile_picture_url,
        new: profilePictureUrl,
      };
    if (birthDate !== currentUser.birth_date)
      updatedFields.birthDate = { old: currentUser.birth_date, new: birthDate };

    // Update user profile
    const updateQuery = `
      UPDATE users 
      SET username = $1, full_name = $2, bio = $3, long_bio = $4, 
          address = $5, phone_number = $6, profile_json = $7, 
          profile_picture_url = $8, birth_date = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
    `;

    await executeQuery(updateQuery, [
      username,
      fullName,
      bio,
      longBio,
      address,
      phone,
      profileJson ? JSON.stringify(profileJson) : null,
      profilePictureUrl,
      birthDate,
      user.userId,
    ]);

    // Log profile update in audit trail if there are changes
    if (Object.keys(updatedFields).length > 0) {
      await executeQuery(
        "INSERT INTO user_profile_updates (user_id, updated_fields) VALUES ($1, $2)",
        [user.userId, JSON.stringify(updatedFields)]
      );
    }

    // Get updated user data
    const selectQuery = `
      SELECT 
        u.*,
        ur.role,
        ud.division_name,
        (SELECT COUNT(*) FROM user_logs WHERE user_id = u.id) as log_count,
        (SELECT COUNT(*) FROM user_roles WHERE user_id = u.id) as role_count
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN user_divisions ud ON u.id = ud.user_id
      WHERE u.id = $1
    `;

    const result = await executeQuery(selectQuery, [user.userId]);
    const updatedUser = result.rows[0];

    // Log the profile update action
    await executeQuery(
      "INSERT INTO user_logs (user_id, action) VALUES ($1, $2)",
      [user.userId, "update_profile"]
    );

    console.timeEnd("Profile Update Execution");
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        authId: updatedUser.auth_id,
        username: updatedUser.username,
        fullName: updatedUser.full_name,
        bio: updatedUser.bio,
        longBio: updatedUser.long_bio,
        profileJson: updatedUser.profile_json,
        address: updatedUser.address,
        phoneNumber: updatedUser.phone_number,
        birthDate: updatedUser.birth_date,
        profilePictureUrl: updatedUser.profile_picture_url,
        role: updatedUser.role,
        division: updatedUser.division_name,
        logCount: updatedUser.log_count,
        roleCount: updatedUser.role_count,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    console.timeEnd("Profile Update Execution");
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export const GET = authMiddleware(getProfile);
export const PUT = authMiddleware(updateProfile);
