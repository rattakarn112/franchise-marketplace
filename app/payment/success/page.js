'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [planName, setPlanName] = useState('')

  useEffect(() => {
    if (sessionId) {
      simulatePaymentSuccess()
    } else {
      setError('ไม่พบรหัสการชำระเงิน')
      setLoading(false)
    }
  }, [sessionId])

  const simulatePaymentSuccess = async () => {
    try {
      setLoading(true)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }

      const planType = 'premium'
      const periodEnd = new Date()
      periodEnd.setDate(periodEnd.getDate() + 30)

      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (existingSubscription) {
        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan_type: planType,
            current_period_end: periodEnd.toISOString(),
            price_paid: 799,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubscription.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_type: planType,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: periodEnd.toISOString(),
            price_paid: 799,
            payment_method: 'stripe_demo'
          })

        if (error) throw error
      }
      
      setPlanName(planType.toUpperCase())
      setSuccess(true)
      
    } catch (error) {
      console.error('Error simulating payment:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบการชำระเงิน...</p>
          <p className="mt-2 text-sm text-gray-500">
            Session ID: {sessionId}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        {success ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              ชำระเงินสำเร็จ!
            </h1>
            <p className="text-gray-600 mb-6">
              ขอบคุณที่อัปเกรดเป็นสมาชิค <strong>{planName}</strong><br/>
              คุณสามารถใช้งานฟีเจอร์ใหม่ได้แล้ว
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">🎉 สิทธิประโยชน์ที่ได้รับ:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ ลงประกาศได้ 5 รายการ</li>
                <li>✅ Badge Premium Seller</li>
                <li>✅ Analytics Dashboard</li>
                <li>✅ Priority Support</li>
                <li>✅ Boost Discount 10%</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🏠 ไปยัง Dashboard
              </button>
              <button
                onClick={() => router.push('/add-franchise')}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ เพิ่มประกาศใหม่
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              เกิดข้อผิดพลาด
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'ไม่สามารถยืนยันการชำระเงินได้'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                🔄 กลับไปหน้าแพ็กเกจ
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🏠 ไปยัง Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}