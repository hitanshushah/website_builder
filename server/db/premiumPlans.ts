import { query } from './db'

export interface PremiumPlan {
  id: number
  key: string
  name: string
  price: number
  created_at: Date
  updated_at: Date
}

export async function getAllPremiumPlans(): Promise<PremiumPlan[]> {
  const sql = `
    SELECT 
      id,
      key,
      name,
      price,
      created_at,
      updated_at
    FROM premium_plans
    ORDER BY price ASC
  `
  
  const plans = await query<PremiumPlan>(sql)
  return plans
}

export async function getPremiumPlanByKey(key: string): Promise<PremiumPlan | null> {
  const sql = `
    SELECT 
      id,
      key,
      name,
      price,
      created_at,
      updated_at
    FROM premium_plans
    WHERE key = $1
  `
  
  const plans = await query<PremiumPlan>(sql, [key])
  return plans.length > 0 ? plans[0] : null
}

