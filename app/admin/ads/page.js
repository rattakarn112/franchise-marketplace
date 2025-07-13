'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminAdsPage() {
  const router = useRouter()
  const [banners, setBanners] = useState([])
  const [contacts, setContacts] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('banners')
  const [selectedBanner, setSelectedBanner] = useState(null)
  const [showBannerForm, setShowBannerForm] = useState(false)

  useEffect(() => {
    checkAdminAccess()
    fetchData()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }
    // In production, check if user has admin role
    // For demo, allow any logged-in user
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch banners
      const { data: bannersData, error: bannersError } = await supabase
        .from('banner_ads')
        .select('*')
        .order('created_at', { ascending: false })

      if (bannersError) throw bannersError
      setBanners(bannersData || [])

      // Fetch contact requests
      const { data: contactsData, error: contactsError } = await supabase
        .from('advertiser_contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (contactsError) throw contactsError
      setContacts(contactsData || [])

      // Calculate analytics
      const totalImpressions = bannersData?.reduce((sum, banner) => sum + (banner.total_impressions || 0), 0) || 0
      const totalClicks = bannersData?.reduce((sum, banner) => sum + (banner.total_clicks || 0), 0) || 0
      const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0
      
      setAnalytics({
        totalBanners: bannersData?.length || 0,
        activeBanners: bannersData?.filter(b => b.status === 'active').length || 0,
        totalImpressions,
        totalClicks,
        avgCTR,
        totalRevenue: bannersData?.reduce((sum, banner) => sum + (banner.price_paid || 0), 0) || 0,
        newContacts: contactsData?.filter(c => c.status === 'new').length || 0
      })

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bannerId, newStatus) => {
    try {
      const { error } = await supabase
        .from('banner_ads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bannerId)

      if (error) throw error
      
      fetchData()
      alert('สถานะถูกอัปเดตแล้ว')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดต')
    }
  }

  const handleContactStatusChange = async (contactId, newStatus) => {
    try {
      const { error } = await supabase
        .from('advertiser_contacts')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)

      if (error) throw error
      
      fetchData()
    } catch (error) {
      console.error('Error updating contact status:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดต')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      paused: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getContactStatusBadge = (status) => {
    const badges = {
      new: 'bg-red-100 text-red-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-blue-100 text-blue-800',
      closed: 'bg-green-100 text-green-800',
      rejected: 'bg-gray-100 text-gray-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

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
            <h1 className="text-2xl font-bold text-blue-600">
              🛠️ Admin: จัดการโฆษณา
            </h1>
            <div className="flex gap-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                📊 Dashboard
              </button>
              <button 
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← กลับหน้าแรก
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Analytics Cards */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">📊 สรุปภาพรวม</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">แบรนเนอร์ทั้งหมด</div>
                <div className="text-3xl font-bold text-blue-600">{analytics.totalBanners}</div>
              </div>
              <div className="text-3xl">📢</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">กำลังแสดง</div>
                <div className="text-3xl font-bold text-green-600">{analytics.activeBanners}</div>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">การเข้าชมรวม</div>
                <div className="text-3xl font-bold text-purple-600">{analytics.totalImpressions.toLocaleString()}</div>
              </div>
              <div className="text-3xl">👀</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">อัตราคลิก</div>
                <div className="text-3xl font-bold text-orange-600">{analytics.avgCTR}%</div>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Revenue & Contacts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">รายได้รวม</div>
                <div className="text-2xl font-bold text-green-600">฿{analytics.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">ลูกค้าใหม่</div>
                <div className="text-2xl font-bold text-red-600">{analytics.newContacts}</div>
              </div>
              <div className="text-3xl">📬</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('banners')}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'banners'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📢 จัดการแบรนเนอร์
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`px-6 py-3 font-medium border-b-2 transition-colors relative ${
                  activeTab === 'contacts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📬 ลูกค้าติดต่อ
                {analytics.newContacts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {analytics.newContacts}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 รายงานผล
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Banners Tab */}
            {activeTab === 'banners' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">จัดการแบรนเนอร์โฆษณา</h3>
                  <button
                    onClick={() => setShowBannerForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + เพิ่มแบรนเนอร์ใหม่
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">แบรนด์</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผลงาน</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ราคา</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันหมดอายุ</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {banners.map((banner) => {
                        const ctr = banner.total_impressions > 0 
                          ? ((banner.total_clicks / banner.total_impressions) * 100).toFixed(2)
                          : 0
                        
                        return (
                          <tr key={banner.id}>
                            <td className="px-4 py-4">
                              <div>
                                <div className="font-medium">{banner.brand_name}</div>
                                <div className="text-sm text-gray-500">{banner.title}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                {banner.position}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(banner.status)}`}>
                                {banner.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm">
                                <div>👀 {banner.total_impressions.toLocaleString()}</div>
                                <div>🎯 {banner.total_clicks} ({ctr}%)</div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium">
                                ฿{banner.price_paid?.toLocaleString() || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm">
                                {banner.end_date 
                                  ? new Date(banner.end_date).toLocaleDateString('th-TH')
                                  : 'ไม่จำกัด'
                                }
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <select
                                  value={banner.status}
                                  onChange={(e) => handleStatusChange(banner.id, e.target.value)}
                                  className="text-xs border rounded px-2 py-1"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="active">Active</option>
                                  <option value="paused">Paused</option>
                                  <option value="completed">Completed</option>
                                </select>
                                <button
                                  onClick={() => setSelectedBanner(banner)}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  📊 ดูรายละเอียด
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">ลูกค้าที่ติดต่อมา</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">บริษัท</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้ติดต่อ</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">แพ็กเกจ</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contacts.map((contact) => (
                        <tr key={contact.id}>
                          <td className="px-4 py-4">
                            <div className="font-medium">{contact.company_name}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-medium">{contact.contact_name}</div>
                              <div className="text-sm text-gray-500">{contact.email}</div>
                              {contact.phone && (
                                <div className="text-sm text-gray-500">{contact.phone}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm">{contact.package_interested || 'ไม่ระบุ'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getContactStatusBadge(contact.status)}`}>
                              {contact.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm">
                              {new Date(contact.created_at).toLocaleDateString('th-TH')}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <select
                                value={contact.status}
                                onChange={(e) => handleContactStatusChange(contact.id, e.target.value)}
                                className="text-xs border rounded px-2 py-1"
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="quoted">Quoted</option>
                                <option value="closed">Closed</option>
                                <option value="rejected">Rejected</option>
                              </select>
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                📧 อีเมล
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">รายงานผลโฆษณา</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance by Position */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">ประสิทธิภาพตามตำแหน่ง</h4>
                    {['header', 'sidebar', 'footer', 'inline'].map(position => {
                      const positionBanners = banners.filter(b => b.position === position)
                      const totalImpressions = positionBanners.reduce((sum, b) => sum + (b.total_impressions || 0), 0)
                      const totalClicks = positionBanners.reduce((sum, b) => sum + (b.total_clicks || 0), 0)
                      const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0
                      
                      return (
                        <div key={position} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                          <span className="font-medium capitalize">{position}</span>
                          <div className="text-sm text-gray-600">
                            {totalImpressions.toLocaleString()} views, {totalClicks} clicks ({ctr}%)
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Top Performing Banners */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">แบรนเนอร์ที่ดีที่สุด</h4>
                    {banners
                      .sort((a, b) => (b.total_clicks || 0) - (a.total_clicks || 0))
                      .slice(0, 5)
                      .map(banner => {
                        const ctr = banner.total_impressions > 0 
                          ? ((banner.total_clicks / banner.total_impressions) * 100).toFixed(2)
                          : 0
                        
                        return (
                          <div key={banner.id} className="py-2 border-b border-gray-200 last:border-b-0">
                            <div className="font-medium">{banner.brand_name}</div>
                            <div className="text-sm text-gray-600">
                              {banner.total_clicks} clicks, CTR: {ctr}%
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}