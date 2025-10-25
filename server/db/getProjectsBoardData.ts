import { query } from './db'
import type { ProjectsBoardData } from '../../app/types'

export async function getProjectsBoardData(userId: number): Promise<ProjectsBoardData> {
  const sql = `
    WITH user_profile AS (
        SELECT 
            u.id AS user_id,
            u.username,
            u.email,
            p.id AS profile_id,
            p.name,
            p.designation,
            p.bio,
            p.city,
            p.province,
            p.country,
            p.phone_number,
            p.secondary_email,
            p.introduction,
            p.hide_phone_on_website,
            p.hide_secondary_email_on_website,
            p.hide_introduction_on_website,
            p.override_email,
            p.public_url,
            p.share_profile,
            p.website_url,
            p.personal_website_url,
            p.share_website,
            p.share_personal_website,
            -- Projects Board URL (only if share_profile is true)
            CASE 
                WHEN p.share_profile = TRUE AND p.public_url IS NOT NULL THEN p.public_url 
                ELSE NULL 
            END AS projects_board_url,
            -- Profile Photo
            (
                SELECT a.filename
                FROM assets a
                JOIN asset_types at ON a.asset_type_id = at.id
                WHERE a.assetable_id = p.id
                  AND a.assetable_type = 'App\\Models\\Profile'
                  AND a.display_name = 'Profile Photo'
                  AND at.key = 'images'
                  AND a.deleted_at IS NULL
                LIMIT 1
            ) AS profile_photo_url,
            -- Profile Links
            (
                SELECT COALESCE(jsonb_agg(
                    jsonb_build_object(
                        'title', l.name,
                        'url', l.url,
                        'type', lt.key
                    )
                ), '[]'::jsonb)
                FROM links l
                JOIN link_types lt ON l.link_type_id = lt.id
                WHERE l.linkable_id = p.id
                  AND l.linkable_type = 'App\\Models\\Profile'
                  AND l.deleted_at IS NULL
            ) AS links,
            -- Profile Documents
            (
                SELECT COALESCE(jsonb_agg(
                    jsonb_build_object(
                        'id', a.id,
                        'name', a.display_name,
                        'display_name', a.display_name,
                        'filename', a.filename,
                        'url', a.filename,
                        'type', at.key
                    )
                ), '[]'::jsonb)
                FROM assets a
                JOIN asset_types at ON a.asset_type_id = at.id
                WHERE a.assetable_id = p.id
                  AND a.assetable_type = 'App\\Models\\Profile'
                  AND a.display_name <> 'Profile Photo'
                  AND at.key = 'documents'
                  AND a.deleted_at IS NULL
            ) AS documents
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
        WHERE u.id = $1
    )

    SELECT jsonb_build_object(
        'userProfile', (SELECT row_to_json(up) FROM user_profile up),

        'projects', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', pr.id,
                    'key', pr.key,
                    'name', pr.name,
                    'description', pr.description,
                    'start_date', pr.start_date,
                    'end_date', pr.end_date,
                    'is_public', pr.is_public,
                    'hide_on_website', pr.hide_on_website,
                    'sorting_order', pr.sorting_order,
                    'created_at', pr.created_at,
                    'updated_at', pr.updated_at,
                    'category', c.name,
                    'status', s.key,
                    -- Project Settings
                    'settings', (
                        SELECT row_to_json(ps)
                        FROM project_settings ps
                        WHERE ps.project_id = pr.id
                          AND ps.user_id = $1
                    ),
                    -- Project Links
                    'links', (
                        SELECT COALESCE(jsonb_agg(
                            jsonb_build_object(
                                'title', l.name,
                                'url', l.url,
                                'type', lt.key
                            )
                        ), '[]'::jsonb)
                        FROM links l
                        JOIN link_types lt ON l.link_type_id = lt.id
                        WHERE l.linkable_id = pr.id
                          AND l.linkable_type = 'App\\Models\\Project'
                          AND l.deleted_at IS NULL
                    ),
                    -- Project Assets
                    'assets', (
                        SELECT COALESCE(jsonb_agg(
                            jsonb_build_object(
                                'id', a.id,
                                'display_name', a.display_name,
                                'filename', a.filename,
                                'path', a.filename,
                                'url', a.filename,
                                'type', at.key,
                                'asset_type', jsonb_build_object(
                                    'key', at.key,
                                    'name', at.name
                                )
                            )
                        ), '[]'::jsonb)
                        FROM assets a
                        JOIN asset_types at ON a.asset_type_id = at.id
                        WHERE a.assetable_id = pr.id
                          AND a.assetable_type = 'App\\Models\\Project'
                          AND a.deleted_at IS NULL
                    ),
                    -- Project Tags (Technologies only)
                    'technologies', (
                        SELECT COALESCE(
                            to_jsonb(array_agg(DISTINCT value)), '[]'::jsonb
                        )
                        FROM tags t,
                             LATERAL jsonb_array_elements_text(t.name::jsonb) AS value
                        WHERE t.project_id = pr.id
                          AND t.type = 'technology'
                          AND t.user_id = $1
                    )
                )
                ORDER BY pr.sorting_order ASC, pr.created_at DESC
            ), '[]'::jsonb)
            FROM projects pr
            LEFT JOIN categories c ON pr.category_id = c.id
            LEFT JOIN status s ON pr.status_id = s.id
            WHERE pr.user_id = $1
              AND pr.is_public = TRUE
              AND pr.deleted_at IS NULL
        ),

        'certifications', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'description', c.description,
                    'start_date', c.start_date,
                    'end_date', c.end_date,
                    'institute_name', c.institute_name,
                    'certificate_pdf', c.certificate_pdf,
                    'hide_on_website', c.hide_on_website
                )
            ), '[]'::jsonb)
            FROM certifications c
            JOIN profiles p ON c.profile_id = p.id
            WHERE p.user_id = $1
              AND c.deleted_at IS NULL
        ),

        'achievements', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', a.id,
                    'description', a.description,
                    'hide_on_website', a.hide_on_website
                )
            ), '[]'::jsonb)
            FROM achievements a
            JOIN profiles p ON a.profile_id = p.id
            WHERE p.user_id = $1
              AND a.deleted_at IS NULL
        ),

        'experiences', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', e.id,
                    'company_name', e.company_name,
                    'role', e.role,
                    'start_date', e.start_date,
                    'end_date', e.end_date,
                    'description', e.description,
                    'skills', e.skills,
                    'company_logo', e.company_logo,
                    'location', e.location,
                    'hide_on_website', e.hide_on_website
                )
            ), '[]'::jsonb)
            FROM experiences e
            JOIN profiles p ON e.profile_id = p.id
            WHERE p.user_id = $1
              AND e.deleted_at IS NULL
        ),

        'publications', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', pub.id,
                    'paper_name', pub.paper_name,
                    'conference_name', pub.conference_name,
                    'description', pub.description,
                    'published_date', pub.published_date,
                    'paper_pdf', pub.paper_pdf,
                    'paper_link', pub.paper_link,
                    'hide_on_website', pub.hide_on_website
                )
            ), '[]'::jsonb)
            FROM publications pub
            JOIN profiles p ON pub.profile_id = p.id
            WHERE p.user_id = $1
              AND pub.deleted_at IS NULL
        ),

        'skills', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', s.id,
                    'name', s.name,
                    'category_id', s.category_id,
                    'category', jsonb_build_object(
                        'id', c.id,
                        'name', c.name,
                        'user_id', c.user_id
                    ),
                    'proficiency_level', s.proficiency_level,
                    'description', s.description,
                    'hide_on_website', s.hide_on_website
                )
            ), '[]'::jsonb)
            FROM skills s
            JOIN profiles p ON s.profile_id = p.id
            LEFT JOIN skill_categories c ON s.category_id = c.id
            WHERE p.user_id = $1
        ),

        'education', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', e.id,
                    'university_name', e.university_name,
                    'degree', e.degree,
                    'from_date', e.from_date,
                    'end_date', e.end_date,
                    'location', e.location,
                    'cgpa', e.cgpa,
                    'hide_on_website', e.hide_on_website
                )
            ), '[]'::jsonb)
            FROM education e
            JOIN profiles p ON e.profile_id = p.id
            WHERE p.user_id = $1
              AND e.deleted_at IS NULL
        ),

        'categories', (
            SELECT COALESCE(jsonb_agg(row_to_json(cats)), '[]'::jsonb)
            FROM (
                SELECT id, name, key
                FROM categories
                WHERE user_id = $1 OR user_id IS NULL
            ) cats
        ),

        'technologies', (
            SELECT COALESCE(
                to_jsonb(array_agg(DISTINCT value)), '[]'::jsonb
            )
            FROM tags t,
                 LATERAL jsonb_array_elements_text(t.name::jsonb) AS value
            WHERE t.type = 'technology'
              AND t.user_id = $1
              AND t.project_id IS NOT NULL
        )
    ) AS result;
  `

  const result = await query<{ result: ProjectsBoardData }>(sql, [userId])
  
  if (result.length === 0) {
    throw new Error('No data found for user')
  }

  // The query returns a single row with a 'result' column containing the JSON data
  return result[0].result
}

export async function getPublicWebsiteData(userId: number): Promise<ProjectsBoardData> {
  const sql = `
    WITH user_profile AS (
        SELECT 
            u.id AS user_id,
            u.username,
            u.email,
            p.id AS profile_id,
            p.name,
            p.designation,
            p.bio,
            p.city,
            p.province,
            p.country,
            p.phone_number,
            p.secondary_email,
            p.introduction,
            p.hide_phone_on_website,
            p.hide_secondary_email_on_website,
            p.hide_introduction_on_website,
            p.override_email,
            p.public_url,
            p.share_profile,
            p.website_url,
            p.personal_website_url,
            p.share_website,
            p.share_personal_website,
            -- Projects Board URL (only if share_profile is true)
            CASE 
                WHEN p.share_profile = TRUE AND p.public_url IS NOT NULL THEN p.public_url 
                ELSE NULL 
            END AS projects_board_url,
            -- Profile Photo
            (
                SELECT a.filename
                FROM assets a
                JOIN asset_types at ON a.asset_type_id = at.id
                WHERE a.assetable_id = p.id
                  AND a.assetable_type = 'App\\Models\\Profile'
                  AND a.display_name = 'Profile Photo'
                  AND at.key = 'images'
                  AND a.deleted_at IS NULL
                LIMIT 1
            ) AS profile_photo_url,
            -- Profile Links
            (
                SELECT COALESCE(jsonb_agg(
                    jsonb_build_object(
                        'title', l.name,
                        'url', l.url,
                        'type', lt.key
                    )
                ), '[]'::jsonb)
                FROM links l
                JOIN link_types lt ON l.link_type_id = lt.id
                WHERE l.linkable_id = p.id
                  AND l.linkable_type = 'App\\Models\\Profile'
                  AND l.deleted_at IS NULL
            ) AS links,
            -- Profile Documents
            (
                SELECT COALESCE(jsonb_agg(
                    jsonb_build_object(
                        'id', a.id,
                        'name', a.display_name,
                        'display_name', a.display_name,
                        'filename', a.filename,
                        'url', a.filename,
                        'type', at.key
                    )
                ), '[]'::jsonb)
                FROM assets a
                JOIN asset_types at ON a.asset_type_id = at.id
                WHERE a.assetable_id = p.id
                  AND a.assetable_type = 'App\\Models\\Profile'
                  AND a.display_name <> 'Profile Photo'
                  AND at.key = 'documents'
                  AND a.deleted_at IS NULL
            ) AS documents
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
        WHERE u.id = $1
    )

    SELECT jsonb_build_object(
        'userProfile', (SELECT row_to_json(up) FROM user_profile up),

        'projects', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', pr.id,
                    'key', pr.key,
                    'name', pr.name,
                    'description', pr.description,
                    'start_date', pr.start_date,
                    'end_date', pr.end_date,
                    'is_public', pr.is_public,
                    'hide_on_website', pr.hide_on_website,
                    'sorting_order', pr.sorting_order,
                    'created_at', pr.created_at,
                    'updated_at', pr.updated_at,
                    'category', c.key,
                    'status', s.key,
                    -- Project Settings
                    'settings', (
                        SELECT row_to_json(ps)
                        FROM project_settings ps
                        WHERE ps.project_id = pr.id
                          AND ps.user_id = $1
                    ),
                    -- Project Links
                    'links', (
                        SELECT COALESCE(jsonb_agg(
                            jsonb_build_object(
                                'title', l.name,
                                'url', l.url,
                                'type', lt.key
                            )
                        ), '[]'::jsonb)
                        FROM links l
                        JOIN link_types lt ON l.link_type_id = lt.id
                        WHERE l.linkable_id = pr.id
                          AND l.linkable_type = 'App\\Models\\Project'
                          AND l.deleted_at IS NULL
                    ),
                    -- Project Assets
                    'assets', (
                        SELECT COALESCE(jsonb_agg(
                            jsonb_build_object(
                                'id', a.id,
                                'display_name', a.display_name,
                                'filename', a.filename,
                                'path', a.filename,
                                'url', a.filename,
                                'type', at.key,
                                'asset_type', jsonb_build_object(
                                    'key', at.key,
                                    'name', at.name
                                )
                            )
                        ), '[]'::jsonb)
                        FROM assets a
                        JOIN asset_types at ON a.asset_type_id = at.id
                        WHERE a.assetable_id = pr.id
                          AND a.assetable_type = 'App\\Models\\Project'
                          AND a.deleted_at IS NULL
                    ),
                    -- Project Tags (Technologies only)
                    'technologies', (
                        SELECT COALESCE(
                            to_jsonb(array_agg(DISTINCT value)), '[]'::jsonb
                        )
                        FROM tags t,
                             LATERAL jsonb_array_elements_text(t.name::jsonb) AS value
                        WHERE t.project_id = pr.id
                          AND t.type = 'technology'
                          AND t.user_id = $1
                    )
                )
                ORDER BY pr.sorting_order ASC, pr.created_at DESC
            ), '[]'::jsonb)
            FROM projects pr
            LEFT JOIN categories c ON pr.category_id = c.id
            LEFT JOIN status s ON pr.status_id = s.id
            WHERE pr.user_id = $1
              AND pr.is_public = TRUE
              AND pr.hide_on_website = FALSE
              AND pr.deleted_at IS NULL
        ),

        'certifications', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'description', c.description,
                    'start_date', c.start_date,
                    'end_date', c.end_date,
                    'institute_name', c.institute_name,
                    'certificate_pdf', c.certificate_pdf,
                    'hide_on_website', c.hide_on_website
                )
            ), '[]'::jsonb)
            FROM certifications c
            JOIN profiles p ON c.profile_id = p.id
            WHERE p.user_id = $1
              AND c.deleted_at IS NULL
              AND c.hide_on_website = FALSE
        ),

        'achievements', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', a.id,
                    'description', a.description,
                    'hide_on_website', a.hide_on_website
                )
            ), '[]'::jsonb)
            FROM achievements a
            JOIN profiles p ON a.profile_id = p.id
            WHERE p.user_id = $1
              AND a.deleted_at IS NULL
              AND a.hide_on_website = FALSE
        ),

        'experiences', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', e.id,
                    'company_name', e.company_name,
                    'role', e.role,
                    'start_date', e.start_date,
                    'end_date', e.end_date,
                    'description', e.description,
                    'skills', e.skills,
                    'company_logo', e.company_logo,
                    'location', e.location,
                    'hide_on_website', e.hide_on_website
                )
            ), '[]'::jsonb)
            FROM experiences e
            JOIN profiles p ON e.profile_id = p.id
            WHERE p.user_id = $1
              AND e.deleted_at IS NULL
              AND e.hide_on_website = FALSE
        ),

        'publications', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', pub.id,
                    'paper_name', pub.paper_name,
                    'conference_name', pub.conference_name,
                    'description', pub.description,
                    'published_date', pub.published_date,
                    'paper_pdf', pub.paper_pdf,
                    'paper_link', pub.paper_link,
                    'hide_on_website', pub.hide_on_website
                )
            ), '[]'::jsonb)
            FROM publications pub
            JOIN profiles p ON pub.profile_id = p.id
            WHERE p.user_id = $1
              AND pub.deleted_at IS NULL
              AND pub.hide_on_website = FALSE
        ),

        'skills', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', s.id,
                    'name', s.name,
                    'category_id', s.category_id,
                    'category', jsonb_build_object(
                        'id', c.id,
                        'name', c.name,
                        'user_id', c.user_id
                    ),
                    'proficiency_level', s.proficiency_level,
                    'description', s.description,
                    'hide_on_website', s.hide_on_website
                )
            ), '[]'::jsonb)
            FROM skills s
            JOIN profiles p ON s.profile_id = p.id
            LEFT JOIN skill_categories c ON s.category_id = c.id
            WHERE p.user_id = $1
              AND s.hide_on_website = FALSE
        ),

        'education', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', e.id,
                    'university_name', e.university_name,
                    'degree', e.degree,
                    'from_date', e.from_date,
                    'end_date', e.end_date,
                    'location', e.location,
                    'cgpa', e.cgpa,
                    'hide_on_website', e.hide_on_website
                )
            ), '[]'::jsonb)
            FROM education e
            JOIN profiles p ON e.profile_id = p.id
            WHERE p.user_id = $1
              AND e.deleted_at IS NULL
              AND e.hide_on_website = FALSE
        ),

        'categories', (
            SELECT COALESCE(jsonb_agg(row_to_json(cats)), '[]'::jsonb)
            FROM (
                SELECT id, name, key
                FROM categories
                WHERE user_id = $1 OR user_id IS NULL
            ) cats
        ),

        'technologies', (
            SELECT COALESCE(
                to_jsonb(array_agg(DISTINCT value)), '[]'::jsonb
            )
            FROM tags t,
                 LATERAL jsonb_array_elements_text(t.name::jsonb) AS value
            WHERE t.type = 'technology'
              AND t.user_id = $1
              AND t.project_id IS NOT NULL
        )
    ) AS result;
  `

  const result = await query<{ result: ProjectsBoardData }>(sql, [userId])
  
  if (result.length === 0) {
    throw new Error('No data found for user')
  }

  // The query returns a single row with a 'result' column containing the JSON data
  return result[0].result
}
