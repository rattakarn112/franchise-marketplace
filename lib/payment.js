import { supabase } from './supabase'
// Remove stripe import for client-side usage
// import stripe, { STRIPE_PLANS, BOOST_PLANS } from './stripe'

export const BOOST_PLANS = {
  7: { price: 199, name: '7 วัน' },
  14: { price: 349, name: '14 วัน' },
  30: { price: 599, name: '30 วัน' }
}

export const createCheckoutSession = async (userId, planType, priceId) => {
  try {
    // For demo purposes, simulate checkout session
    // In production, this would call an API route
    const sessionId = `demo_${Date.now()}_${planType}_${userId}`
    return { 
      sessionId, 
      url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id=${sessionId}` 
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export const createBoostPayment = async (userId, franchiseId, days) => {
  try {
    const boostPlan = BOOST_PLANS[days]
    if (!boostPlan) throw new Error('Invalid boost plan')

    // Get user's discount
    const subscription = await getUserSubscription(userId)
    const discountPercent = subscription?.plan_type === 'premium' ? 10 : 
                           subscription?.plan_type === 'featured' ? 20 : 0
    
    const originalPrice = boostPlan.price
    const discountedPrice = originalPrice * (1 - discountPercent / 100)

    // For demo purposes, simulate boost payment
    const sessionId = `boost_${Date.now()}_${franchiseId}_${days}`
    return { 
      sessionId, 
      url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/boost-success?session_id=${sessionId}` 
    }
  } catch (error) {
    console.error('Error creating boost payment:', error)
    throw error
  }
}

export const getUserSubscription = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (error) {
    console.error('Error getting subscription:', error)
    return null
  }
}

export const getPlanLimits = async (planType = 'basic') => {
  try {
    const { data, error } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('plan_type', planType)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting plan limits:', error)
    return {
      max_franchises: 1,
      max_images: 3,
      has_analytics: false,
      has_featured_badge: false,
      has_priority_support: false,
      boost_discount_percent: 0
    }
  }
}

export const checkUserLimits = async (userId) => {
  try {
    const subscription = await getUserSubscription(userId)
    const planType = subscription?.plan_type || 'basic'
    const limits = await getPlanLimits(planType)
    
    // Get user's current franchise count
    const { data: franchises, error } = await supabase
      .from('franchises')
      .select('id')
      .eq('user_id', userId)

    if (error) throw error

    return {
      currentFranchises: franchises?.length || 0,
      maxFranchises: limits.max_franchises,
      canAddMore: (franchises?.length || 0) < limits.max_franchises,
      planType,
      limits,
      subscription
    }
  } catch (error) {
    console.error('Error checking user limits:', error)
    return {
      currentFranchises: 0,
      maxFranchises: 1,
      canAddMore: true,
      planType: 'basic',
      limits: {},
      subscription: null
    }
  }
}

export const updateFranchiseBoost = async (franchiseId, days) => {
  try {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    const { error } = await supabase
      .from('franchises')
      .update({
        is_boosted: true,
        boost_end_date: endDate.toISOString()
      })
      .eq('id', franchiseId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating franchise boost:', error)
    return false
  }
}

export const createBoostRecord = async (franchiseId, userId, days, amountPaid, paymentId) => {
  try {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    const { error } = await supabase
      .from('boost_posts')
      .insert({
        franchise_id: franchiseId,
        user_id: userId,
        days_boosted: days,
        amount_paid: amountPaid,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        payment_id: paymentId
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error creating boost record:', error)
    return false
  }
}