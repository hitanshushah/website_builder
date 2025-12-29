import { query } from './db'
import type { Profile } from '../../app/types'

export async function updateContactDetails(
  userId: number, 
  contactData: { phone_number?: string | null; secondary_email?: string | null; introduction?: string | null }
): Promise<Profile> {
  // First, get the profile_id for the user
  const profileQuery = `
    SELECT p.id as profile_id 
    FROM profiles p 
    WHERE p.user_id = $1
  `
  const profileResult = await query<{ profile_id: number }>(profileQuery, [userId])
  
  if (profileResult.length === 0) {
    throw new Error('Profile not found for user')
  }

  const profileId = profileResult[0].profile_id

  // Update contact details in profile
  const updateQuery = `
    UPDATE profiles 
    SET phone_number = $2, secondary_email = $3, introduction = $4, updated_at = NOW() 
    WHERE id = $1 
    RETURNING *
  `

  const result = await query<Profile>(updateQuery, [
    profileId,
    contactData.phone_number,
    contactData.secondary_email,
    contactData.introduction
  ])

  if (result.length === 0) {
    throw new Error('Failed to update contact details')
  }

  return result[0]
}

export async function deleteContactDetails(userId: number): Promise<void> {
  // First, get the profile_id for the user
  const profileQuery = `
    SELECT p.id as profile_id 
    FROM profiles p 
    WHERE p.user_id = $1
  `
  const profileResult = await query<{ profile_id: number }>(profileQuery, [userId])
  
  if (profileResult.length === 0) {
    throw new Error('Profile not found for user')
  }

  const profileId = profileResult[0].profile_id

  // Clear contact details (set to NULL)
  const updateQuery = `
    UPDATE profiles 
    SET phone_number = NULL, secondary_email = NULL, introduction = NULL, updated_at = NOW() 
    WHERE id = $1
    RETURNING *
  `

  const result = await query(updateQuery, [profileId])

  if (result.length === 0) {
    throw new Error('Failed to delete contact details')
  }
}

export async function toggleHidePhoneOnWebsite(userId: number): Promise<Profile> {
  // First, get the profile_id for the user
  const profileQuery = `
    SELECT p.id as profile_id 
    FROM profiles p 
    WHERE p.user_id = $1
  `
  const profileResult = await query<{ profile_id: number }>(profileQuery, [userId])
  
  if (profileResult.length === 0) {
    throw new Error('Profile not found for user')
  }

  const profileId = profileResult[0].profile_id

  // Toggle hide_phone_on_website
  const updateQuery = `
    UPDATE profiles 
    SET hide_phone_on_website = NOT COALESCE(hide_phone_on_website, false), updated_at = NOW() 
    WHERE id = $1 
    RETURNING *
  `

  const result = await query<Profile>(updateQuery, [profileId])

  if (result.length === 0) {
    throw new Error('Failed to toggle phone visibility')
  }

  return result[0]
}

export async function toggleHideSecondaryEmailOnWebsite(userId: number): Promise<Profile> {
  // First, get the profile_id for the user
  const profileQuery = `
    SELECT p.id as profile_id 
    FROM profiles p 
    WHERE p.user_id = $1
  `
  const profileResult = await query<{ profile_id: number }>(profileQuery, [userId])
  
  if (profileResult.length === 0) {
    throw new Error('Profile not found for user')
  }

  const profileId = profileResult[0].profile_id

  // Toggle hide_secondary_email_on_website
  const updateQuery = `
    UPDATE profiles 
    SET hide_secondary_email_on_website = NOT COALESCE(hide_secondary_email_on_website, false), updated_at = NOW() 
    WHERE id = $1 
    RETURNING *
  `

  const result = await query<Profile>(updateQuery, [profileId])

  if (result.length === 0) {
    throw new Error('Failed to toggle secondary email visibility')
  }

  return result[0]
}

export async function toggleHideIntroductionOnWebsite(userId: number): Promise<Profile> {
  // First, get the profile_id for the user
  const profileQuery = `
    SELECT p.id as profile_id 
    FROM profiles p 
    WHERE p.user_id = $1
  `
  const profileResult = await query<{ profile_id: number }>(profileQuery, [userId])
  
  if (profileResult.length === 0) {
    throw new Error('Profile not found for user')
  }

  const profileId = profileResult[0].profile_id

  // Toggle hide_introduction_on_website
  const updateQuery = `
    UPDATE profiles 
    SET hide_introduction_on_website = NOT COALESCE(hide_introduction_on_website, false), updated_at = NOW() 
    WHERE id = $1 
    RETURNING *
  `

  const result = await query<Profile>(updateQuery, [profileId])

  if (result.length === 0) {
    throw new Error('Failed to toggle introduction visibility')
  }

  return result[0]
}

export async function toggleOverrideEmail(userId: number): Promise<Profile> {
  // First, get the profile_id for the user
  const profileQuery = `
    SELECT p.id as profile_id 
    FROM profiles p 
    WHERE p.user_id = $1
  `
  const profileResult = await query<{ profile_id: number }>(profileQuery, [userId])
  
  if (profileResult.length === 0) {
    throw new Error('Profile not found for user')
  }

  const profileId = profileResult[0].profile_id

  // Toggle override_email
  const updateQuery = `
    UPDATE profiles 
    SET override_email = NOT COALESCE(override_email, false), updated_at = NOW() 
    WHERE id = $1 
    RETURNING *
  `

  const result = await query<Profile>(updateQuery, [profileId])

  if (result.length === 0) {
    throw new Error('Failed to toggle email override')
  }

  return result[0]
}
