'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Logo Component ใส่ในไฟล์เดียวกัน
const FranchiseHubLogo = ({ 
  size = 'normal', 
  variant = 'default', 
  className = '',
  onClick = null 
}) => {
  const sizeClasses = {
    small: 'text-lg',
    normal: 'text-2xl', 
    large: 'text-4xl'
  };

  const colorClasses = {
    default: 'text-blue-600',
    white: 'text-white'
  };

  return (
    <div 
      className={`flex items-center gap-2 ${className} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <div className={`${sizeClasses[size]} ${colorClasses[variant]}`}>🏪</div>
      <div className={`${sizeClasses[size]} ${colorClasses[variant]} font-bold`}>
        FranchiseHub
      </div>
    </div>
  );
};

export default function FranchiseDetail() {
  const params = useParams()
  const router = useRouter()
  const franchiseId = params?.id
  
  const [franchise, setFranchise] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [relatedFranchises, setRelatedFranchises] = useState([])

  useEffect(() => {
    if (franchiseId) {
      fetchFranchiseDetail()
      checkUser()
    }
  }, [franchiseId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchFranchiseDetail = async () => {
    try {
      setLoading(true)
      
      const { data: franchiseData, error: franchiseError } = await supabase
        .from('franchises')
        .select('*')
        .eq('id', franchiseId)
        .single()

      if (franchiseError) throw franchiseError
      
      if (!franchiseData) {
        router.push('/')
        return
      }

      setFranchise(franchiseData)

      // เพิ่ม view count
      await supabase
        .from('franchises')
        .update({ 
          views: (franchiseData.views || 0) + 1 
        })
        .eq('id', franchiseId)

      // ดึงแฟรนไชส์ที่เกี่ยวข้อง
      const { data: relatedData } = await supabase
        .from('franchises')
        .select('*')
        .eq('category', franchiseData.category)
        .neq('id', franchiseId)
        .limit(3)

      setRelatedFranchises(relatedData || [])

    } catch (error) {
      console.error('Error fetching franchise:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleContactClick = () => {
    if (!currentUser) {
      router.push('/auth')
      return
    }
    setShowContactModal(true)
  }

  const formatCurrency = (min, max) => {
    return `${min?.toLocaleString()} - ${max?.toLocaleString()}`
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'อาหาร': '🍜',
      'เครื่องดื่ม': '🧋',
      'บริการ': '💼',
      'ค้าปลีก': '🛍️',
      'การศึกษา': '📚',
      'สุขภาพและความงาม': '💊'
    }
    return icons[category] || '🏪'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!franchise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบข้อมูลแฟรนไชส์</h1>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    )
  }

  const images = franchise.image_url ? [franchise.image_url] : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <FranchiseHubLogo onClick={() => router.push('/')} />
            <nav className="flex gap-4">
              <button 
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                หน้าแรก
              </button>
              <button 
                onClick={() => router.push('/add-franchise')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + ลงประกาศฟรี
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm">
            <span 
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              หน้าแรก
            </span>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-blue-600">{franchise.category}</span>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">{franchise.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {images.length > 0 ? (
                <div className="h-80">
                  <img 
                    src={images[0]}
                    alt={franchise.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text fill="%236b7280" font-family="sans-serif" font-size="40" text-anchor="middle" x="200" y="160">${getCategoryIcon(franchise.category)}</text></svg>`
                    }}
                  />
                </div>
              ) : (
                <div className="h-80 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{getCategoryIcon(franchise.category)}</div>
                    <p className="text-gray-500">ไม่มีรูปภาพ</p>
                  </div>
                </div>
              )}
            </div>

            {/* Title and Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{franchise.name}</h1>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getCategoryIcon(franchise.category)}</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {franchise.category}
                    </span>
                  </div>
                  {franchise.location && (
                    <p className="text-gray-600 flex items-center gap-1">
                      📍 {franchise.location}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">เงินลงทุน</div>
                  <div className="text-2xl font-bold text-green-600">
                    ฿{formatCurrency(franchise.investment_min, franchise.investment_max)}
                  </div>
                </div>
              </div>

              {/* Features */}
              {franchise.features && franchise.features.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">จุดเด่น:</h3>
                  <div className="flex flex-wrap gap-2">
                    {franchise.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                      >
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{franchise.views || 0}</div>
                  <div className="text-sm text-gray-500">การเข้าชม</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Date(franchise.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="text-sm text-gray-500">วันที่ลงประกาศ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">⭐</div>
                  <div className="text-sm text-gray-500">ยังไม่มีรีวิว</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">รายละเอียด</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {franchise.description}
              </p>
            </div>

            {/* Investment Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">💰 ข้อมูลการลงทุน</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">เงินลงทุนขั้นต่ำ</div>
                  <div className="text-xl font-bold text-green-600">
                    ฿{franchise.investment_min?.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">เงินลงทุนสูงสุด</div>
                  <div className="text-xl font-bold text-blue-600">
                    ฿{franchise.investment_max?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">📞 ติดต่อสอบถาม</h3>
              
              <div className="space-y-3">
                {franchise.contact && (
                  <a 
                    href={`tel:${franchise.contact}`}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    📞 โทร {franchise.contact}
                  </a>
                )}
                
                {franchise.line_id && (
                  <a 
                    href={`https://line.me/ti/p/${franchise.line_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 transition-colors"
                  >
                    💬 LINE: {franchise.line_id}
                  </a>
                )}
                
                <button 
                  onClick={handleContactClick}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  💌 ส่งข้อความสอบถาม
                </button>
                
                <button className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  ❤️ บันทึกรายการ
                </button>
              </div>
            </div>

            {/* Related Franchises */}
            {relatedFranchises.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">🔗 แฟรนไชส์ที่เกี่ยวข้อง</h3>
                <div className="space-y-4">
                  {relatedFranchises.map((related) => (
                    <div 
                      key={related.id}
                      onClick={() => router.push(`/franchise/${related.id}`)}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <h4 className="font-medium text-sm">{related.name}</h4>
                      <p className="text-xs text-gray-600">
                        ฿{related.investment_min?.toLocaleString()} - {related.investment_max?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">ส่งข้อความสอบถาม</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ข้อความ
                </label>
                <textarea 
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="สวัสดีครับ สนใจแฟรนไชส์นี้ ขอข้อมูลเพิ่มเติมหน่อยครับ..."
                  defaultValue={`สวัสดีครับ สนใจแฟรนไชส์ "${franchise.name}" อยากทราบรายละเอียดเพิ่มเติมครับ`}
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  ส่งข้อความ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}