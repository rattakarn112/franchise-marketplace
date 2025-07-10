'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserSubscription, checkUserLimits } from '@/lib/payment'

export default function PricingPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)
  const [userSubscription, setUserSubscription] = useState(null)
  const [userLimits, setUserLimits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      if (user) {
        const [subscription, limits] = await Promise.all([
          getUserSubscription(user.id),
          checkUserLimits(user.id)
        ])
        setUserSubscription(subscription)
        setUserLimits(limits)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planType) => {
    if (!currentUser) {
      router.push('/auth')
      return
    }

    if (planType === 'basic') {
      router.push('/dashboard')
      return
    }

    try {
      setProcessingPayment(true)
      
      // For demo purposes, simulate payment process
      // In production, this would create a real Stripe checkout session
      const sessionId = `demo_${Date.now()}_${planType}`
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to success page
      router.push(`/payment/success?session_id=${sessionId}`)

    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('เกิดข้อผิดพลาดในการชำระเงิน')
    } finally {
      setProcessingPayment(false)
    }
  }

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      period: 'ฟรี',
      color: 'gray',
      features: [
        'ลงประกาศได้ 1 รายการ',
        'แสดงผล 30 วัน',
        'รูปภาพ 3 รูป',
        'การเข้าชมพื้นฐาน'
      ],
      limitations: ['จำกัดการเข้าถึง', 'ไม่มี analytics', 'ไม่มี priority support']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 799,
      period: 'ต่อเดือน',
      color: 'blue',
      popular: true,
      features: [
        'ลงประกาศได้ 5 รายการ',
        'Badge "Premium Seller"',
        'แสดงใน Featured Section',
        'Analytics dashboard',
        'รูปภาพไม่จำกัด',
        'Priority support',
        'Boost discount 10%'
      ]
    },
    {
      id: 'featured',
      name: 'Featured',
      price: 1999,
      period: 'ต่อเดือน',
      color: 'yellow',
      features: [
        'ลงประกาศไม่จำกัด',
        'แสดงบนสุดทุกหน้า',
        'Highlight สีทอง',
        'Advanced analytics',
        'Lead management',
        'Custom contact form',
        'Dedicated support',
        'Boost discount 20%'
      ]
    }
  ]

  const boostOptions = [
    { days: 7, price: 199, popular: false },
    { days: 14, price: 349, popular: true },
    { days: 30, price: 599, popular: false }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 
              onClick={() => router.push('/')}
              className="text-2xl font-bold text-blue-600 cursor-pointer"
            >
              🏪 FranchiseHub
            </h1>
            <nav className="flex gap-4">
              <button 
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                หน้าแรก
              </button>
              {currentUser && (
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Dashboard
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ⚡ เลือกแพ็กเกจที่เหมาะกับคุณ
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            เพิ่มยอดขายและเข้าถึงลูกค้าได้มากขึ้นด้วยแพ็กเกจพรีเมียม
          </p>
        </div>

        {/* Current Plan Status */}
        {currentUser && userLimits && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 สถานะปัจจุบัน</h3>
                  <p className="text-gray-600">
                    แพ็กเกจ: <strong className="text-blue-600">{userLimits.planType.toUpperCase()}</strong>
                  </p>
                  <p className="text-gray-600">
                    ประกาศ: <strong>{userLimits.currentFranchises}/{userLimits.maxFranchises}</strong>
                    {userLimits.canAddMore ? (
                      <span className="text-green-600 ml-2">✅ เพิ่มได้</span>
                    ) : (
                      <span className="text-red-600 ml-2">❌ เต็มแล้ว</span>
                    )}
                  </p>
                </div>
                {userSubscription && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">หมดอายุ</p>
                    <p className="font-semibold">
                      {new Date(userSubscription.current_period_end).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
                } ${
                  userSubscription?.plan_type === plan.id ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      ⭐ แนะนำ
                    </span>
                  </div>
                )}

                {userSubscription?.plan_type === plan.id && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                    ✅ ใช้งานอยู่
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">
                        ฿{plan.price.toLocaleString()}
                      </span>
                      <span className="text-gray-600 ml-2">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-3 mt-0.5 text-lg">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations && plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start opacity-60">
                        <span className="text-red-500 mr-3 mt-0.5 text-lg">✗</span>
                        <span className="text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={userSubscription?.plan_type === plan.id || processingPayment}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                      userSubscription?.plan_type === plan.id
                        ? 'bg-green-100 text-green-700 cursor-not-allowed border-2 border-green-300'
                        : processingPayment
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : plan.id === 'basic'
                        ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg'
                        : plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {processingPayment ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        กำลังดำเนินการ...
                      </div>
                    ) : userSubscription?.plan_type === plan.id ? (
                      '✅ แพ็กเกจปัจจุบัน'
                    ) : plan.id === 'basic' ? (
                      '🏠 กลับ Basic'
                    ) : (
                      `🚀 อัปเกรดเป็น ${plan.name}`
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boost Post Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🚀 Boost Post - เพิ่มการเข้าชมทันที
            </h2>
            <p className="text-gray-600">
              ไม่ต้องผูกมัดรายเดือน แค่เพิ่มการมองเห็นประกาศที่ต้องการ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boostOptions.map((option) => {
              const discountPercent = userSubscription?.plan_type === 'premium' ? 10 : 
                                    userSubscription?.plan_type === 'featured' ? 20 : 0
              const discountedPrice = option.price * (1 - discountPercent / 100)

              return (
                <div 
                  key={option.days}
                  className={`bg-white rounded-lg shadow-md p-6 text-center transition-all duration-200 hover:shadow-lg ${
                    option.popular ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {option.popular && (
                    <div className="text-green-600 text-sm font-medium mb-2">
                      🔥 ยอดนิยม
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    📅 {option.days} วัน
                  </h3>
                  
                  <div className="mb-4">
                    {discountPercent > 0 ? (
                      <div>
                        <div className="text-lg text-gray-500 line-through">
                          ฿{option.price.toLocaleString()}
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                          ฿{Math.round(discountedPrice).toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          💰 ประหยัด {discountPercent}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-gray-900">
                        ฿{option.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    แสดงบนสุดของรายการเป็นเวลา {option.days} วัน
                  </p>
                  
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        router.push('/auth')
                        return
                      }
                      // For demo, redirect to dashboard
                      alert(`Demo: Boost ${option.days} วัน - ฿${Math.round(discountedPrice).toLocaleString()}`)
                    }}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    🚀 เลือกแพ็กเกจนี้
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">❓ คำถามที่พบบ่อย</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                💳 ชำระเงินอย่างไร?
              </h3>
              <p className="text-gray-600">
                รับชำระผ่านบัตรเครดิต/เดบิต ผ่านระบบ Stripe ที่ปลอดภัย 100% 
                (ตอนนี้เป็น Demo Mode)
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                🔄 ยกเลิกได้ไหม?
              </h3>
              <p className="text-gray-600">
                ยกเลิกได้ทุกเวลา ไม่มีค่าธรรมเนียมปรับ และจะใช้งานได้จนครบรอบการชำระเงิน
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                📊 Premium Features คืออะไร?
              </h3>
              <p className="text-gray-600">
                ลงประกาศได้มากขึ้น, Badge สำคัญ, Analytics, Priority Support และส่วนลด Boost
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 FranchiseHub - ตลาดซื้อขายแฟรนไชส์อันดับ 1</p>
        </div>
      </footer>
    </div>
  )
}