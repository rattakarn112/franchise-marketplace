'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserSubscription, checkUserLimits } from '@/lib/payment'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [franchises, setFranchises] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLimits, setUserLimits] = useState(null)
  const [userSubscription, setUserSubscription] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    views: 0,
    boosted: 0
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth')
        return
      }
      
      setUser(user)
      
      // Get subscription and limits
      const [subscription, limits] = await Promise.all([
        getUserSubscription(user.id),
        checkUserLimits(user.id)
      ])
      
      setUserSubscription(subscription)
      setUserLimits(limits)
      
      // Fetch franchises
      fetchUserFranchises(user.id)
    } catch (error) {
      console.error('Error:', error)
      router.push('/auth')
    }
  }

  const fetchUserFranchises = async (userId) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setFranchises(data || [])
      setStats({
        total: data?.length || 0,
        active: data?.filter(f => f.status !== 'inactive').length || 0,
        views: data?.reduce((sum, f) => sum + (f.views || 0), 0) || 0,
        boosted: data?.filter(f => f.is_boosted).length || 0
      })
    } catch (error) {
      console.error('Error fetching franchises:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบประกาศนี้?')) return

    try {
      const { error } = await supabase
        .from('franchises')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      fetchUserFranchises(user.id)
      alert('ลบประกาศสำเร็จ')
    } catch (error) {
      console.error('Error deleting:', error)
      alert('เกิดข้อผิดพลาดในการลบ')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleAddFranchise = () => {
    if (!userLimits?.canAddMore) {
      alert('คุณได้ใช้ครบจำนวนประกาศสำหรับแพ็กเกจนี้แล้ว กรุณาอัปเกรดแพ็กเกจ')
      router.push('/pricing')
      return
    }
    router.push('/add-franchise')
  }

  const handleBoost = (franchiseId) => {
    alert(`Demo: Boost ประกาศ ID ${franchiseId}`)
    // In production, this would redirect to boost page
  }

  const formatCurrency = (min, max) => {
    return `${min.toLocaleString()} - ${max.toLocaleString()}`
  }

  const getPlanBadge = (planType) => {
    const badges = {
      basic: { color: 'bg-gray-100 text-gray-800', text: 'Basic' },
      premium: { color: 'bg-blue-100 text-blue-800', text: 'Premium' },
      featured: { color: 'bg-yellow-100 text-yellow-800', text: 'Featured' }
    }
    return badges[planType] || badges.basic
  }

  const getStatusBadge = (franchise) => {
    if (franchise.is_boosted) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">🚀 Boosted</span>
    }
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">📅 Active</span>
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
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user?.email}
              </span>
              <button 
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          
          {/* Plan Badge */}
          {userLimits && (
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadge(userLimits.planType).color}`}>
                {getPlanBadge(userLimits.planType).text}
              </span>
              <button
                onClick={() => router.push('/pricing')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                อัปเกรด
              </button>
            </div>
          )}
        </div>

        {/* Premium Status Alert */}
        {userSubscription && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  🎉 Premium Member
                </h3>
                <p className="text-blue-600">
                  แพ็กเกจ: <strong>{userSubscription.plan_type.toUpperCase()}</strong>
                </p>
                <p className="text-sm text-blue-500">
                  หมดอายุ: {new Date(userSubscription.current_period_end).toLocaleDateString('th-TH')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl mb-2">👑</div>
                <button
                  onClick={() => router.push('/pricing')}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  จัดการแพ็กเกจ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Limit Status */}
        {userLimits && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">📊 สถานะการใช้งาน</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">ประกาศที่ลงแล้ว</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {userLimits.currentFranchises}/{userLimits.maxFranchises}
                  </p>
                </div>
                <div className="text-2xl">
                  {userLimits.canAddMore ? '✅' : '❌'}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">สถานะ</p>
                  <p className="text-lg font-semibold text-green-600">
                    {userLimits.canAddMore ? 'เพิ่มได้' : 'เต็มแล้ว'}
                  </p>
                </div>
                <div className="text-2xl">
                  {userLimits.planType === 'basic' ? '🆓' : 
                   userLimits.planType === 'premium' ? '⭐' : '👑'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">ประกาศทั้งหมด</div>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              </div>
              <div className="text-2xl">📋</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">กำลังแสดง</div>
                <div className="text-3xl font-bold text-green-600">{stats.active}</div>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">ยอดเข้าชม</div>
                <div className="text-3xl font-bold text-purple-600">{stats.views}</div>
              </div>
              <div className="text-2xl">👀</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Boosted</div>
                <div className="text-3xl font-bold text-orange-600">{stats.boosted}</div>
              </div>
              <div className="text-2xl">🚀</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-xl font-semibold">ประกาศของฉัน</h3>
          <div className="flex gap-2">
            <button
              onClick={handleAddFranchise}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                userLimits?.canAddMore
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
              disabled={!userLimits?.canAddMore}
            >
              + เพิ่มประกาศใหม่
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              🚀 Boost
            </button>
          </div>
        </div>

        {/* Franchises List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        ) : franchises.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-gray-500 mb-4">คุณยังไม่มีประกาศ</p>
            <button
              onClick={handleAddFranchise}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              สร้างประกาศแรก
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      แฟรนไชส์
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      หมวดหมู่
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เงินลงทุน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ยอดเข้าชม
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {franchises.map((franchise) => (
                    <tr key={franchise.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {franchise.image_url ? (
                            <img 
                              src={franchise.image_url} 
                              alt={franchise.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-xl">🏪</span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {franchise.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {franchise.location || 'ทั่วประเทศ'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {franchise.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ฿{formatCurrency(franchise.investment_min, franchise.investment_max)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(franchise)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="mr-1">👀</span>
                          {franchise.views || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/franchise/${franchise.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => router.push(`/edit-franchise/${franchise.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleBoost(franchise.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            🚀
                          </button>
                          <button
                            onClick={() => handleDelete(franchise.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Premium Analytics */}
        {userSubscription && userSubscription.plan_type !== 'basic' && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Analytics (Premium)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">การเข้าชมเฉลี่ย</p>
                <p className="text-2xl font-bold text-blue-800">
                  {stats.total > 0 ? Math.round(stats.views / stats.total) : 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">อัตราการติดต่อ</p>
                <p className="text-2xl font-bold text-green-800">12%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-800">8%</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}