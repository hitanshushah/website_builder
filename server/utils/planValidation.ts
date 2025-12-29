import { query } from '../db/db'

export interface PlanValidationResult {
  isValid: boolean
  userPlanKey: string
  userPlanId: number
  message?: string
}

/**
 * Validates if a user has the required premium plan
 * @param userId - The user ID to validate
 * @param requiredPlan - The required plan key ('plus' or 'pro')
 * @returns Promise<PlanValidationResult>
 */
export async function validateUserPlan(userId: number, requiredPlan: 'plus' | 'pro'): Promise<PlanValidationResult> {
  try {
    const sql = `
      SELECT 
        u.id as user_id,
        u.premium_plan_id,
        pp.key as plan_key,
        pp.name as plan_name
      FROM users u
      JOIN premium_plans pp ON u.premium_plan_id = pp.id
      WHERE u.id = $1
    `
    
    const result = await query(sql, [userId])
    
    if (result.length === 0) {
      return {
        isValid: false,
        userPlanKey: 'basic',
        userPlanId: 1,
        message: 'User not found'
      }
    }
    
    const user = result[0]
    const userPlanId = user.premium_plan_id
    const userPlanKey = user.plan_key
    
    // Define plan hierarchy: basic (1) < plus (2) < pro (3)
    const planHierarchy = { basic: 1, plus: 2, pro: 3 }
    const userPlanLevel = planHierarchy[userPlanKey as keyof typeof planHierarchy] || 1
    const requiredPlanLevel = planHierarchy[requiredPlan]
    
    if (userPlanLevel < requiredPlanLevel) {
      return {
        isValid: false,
        userPlanKey,
        userPlanId,
        message: `This feature requires a ${requiredPlan} plan or higher. Your current plan is ${userPlanKey}.`
      }
    }
    
    return {
      isValid: true,
      userPlanKey,
      userPlanId
    }
  } catch (error) {
    console.error('Error validating user plan:', error)
    return {
      isValid: false,
      userPlanKey: 'basic',
      userPlanId: 1,
      message: 'Error validating user plan'
    }
  }
}

/**
 * Validates if a user has Plus plan or higher
 * @param userId - The user ID to validate
 * @returns Promise<PlanValidationResult>
 */
export async function validatePlusPlan(userId: number): Promise<PlanValidationResult> {
  return validateUserPlan(userId, 'plus')
}

/**
 * Validates if a user has Pro plan
 * @param userId - The user ID to validate
 * @returns Promise<PlanValidationResult>
 */
export async function validateProPlan(userId: number): Promise<PlanValidationResult> {
  return validateUserPlan(userId, 'pro')
}

/**
 * Validates if a template is premium and user has appropriate plan
 * @param templateId - The template ID to check
 * @param userId - The user ID to validate
 * @returns Promise<PlanValidationResult>
 */
export async function validateTemplateAccess(templateId: number, userId: number): Promise<PlanValidationResult> {
  try {
    // First check if template is premium
    const templateSql = `
      SELECT is_premium FROM templates WHERE id = $1
    `
    const templateResult = await query(templateSql, [templateId])
    
    if (templateResult.length === 0) {
      return {
        isValid: false,
        userPlanKey: 'basic',
        userPlanId: 1,
        message: 'Template not found'
      }
    }
    
    const isPremiumTemplate = templateResult[0].is_premium
    
    // If template is not premium, any user can access it
    if (!isPremiumTemplate) {
      return {
        isValid: true,
        userPlanKey: 'basic',
        userPlanId: 1
      }
    }
    
    // If template is premium, validate Plus plan or higher
    return validatePlusPlan(userId)
  } catch (error) {
    console.error('Error validating template access:', error)
    return {
      isValid: false,
      userPlanKey: 'basic',
      userPlanId: 1,
      message: 'Error validating template access'
    }
  }
}
