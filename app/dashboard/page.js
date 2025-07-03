'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [franchises, setFranchises] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    views: 0
  })

  // เช็ค user และดึงข้อมูล
  useEffect(() => {
    checkUser()
  }, [])

  // เช็คว่า login แล้วหรือยัง
  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // ถ้ายังไม่ login ให้ไปหน้า login
        router.push('/auth')
        return
      }
      
      setUser(user)
      fetchUserFranchises(user.id)
    } catch (error) {
      console.error('Error:', error)
      router.push('/auth')
    }
  }

  // ดึงข้อมูลแฟรนไชส์ของ user
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
        views: data?.reduce((sum, f) => sum + (f.views || 0), 0) || 0
      })
    } catch (error) {
      console.error('Error fetching franchises:', error)
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชันลบประกาศ
  const handleDelete = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบประกาศนี้?')) return

    try {
      const { error } = await supabase
        .from('franchises')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Refresh data
      fetchUserFranchises(user.id)
      alert('ลบประกาศสำเร็จ')
    } catch (error) {
      console.error('Error deleting:', error)
      alert('เกิดข้อผิดพลาดในการลบ')
    }
  }

  // ฟังก์ชัน Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Format ตัวเลข
  const formatCurrency = (min, max) => {
    return `${min.toLocaleString()} - ${max.toLocaleString()}`
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
              🏪 FranHub
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
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
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">ประกาศทั้งหมด</div>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">กำลังแสดง</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">ยอดเข้าชม</div>
            <div className="text-3xl font-bold text-purple-600">{stats.views}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">ประกาศของฉัน</h3>
          <button
            onClick={() => router.push('/add-franchise')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + เพิ่มประกาศใหม่
          </button>
        </div>

        {/* Franchises List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        ) : franchises.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">คุณยังไม่มีประกาศ</p>
            <button
              onClick={() => router.push('/add-franchise')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              สร้างประกาศแรก
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    วันที่สร้าง
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {franchises.map((franchise) => (
                  <tr key={franchise.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {franchise.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(franchise.investment_min, franchise.investment_max)} บาท
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(franchise.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/edit-franchise/${franchise.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(franchise.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}