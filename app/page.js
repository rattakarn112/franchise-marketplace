'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BannerAd from '../components/BannerAd'

export default function Home() {
  const router = useRouter()
  const [franchises, setFranchises] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const [currentUser, setCurrentUser] = useState(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const categories = ['ทั้งหมด', 'อาหาร', 'เครื่องดื่ม', 'บริการ', 'ค้าปลีก', 'การศึกษา', 'สุขภาพและความงาม']

  useEffect(() => {
    fetchFranchises()
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchFranchises = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .order('is_boosted', { ascending: false })
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData = data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        investment: `${item.investment_min.toLocaleString()} - ${item.investment_max.toLocaleString()}`,
        investmentMin: item.investment_min,
        investmentMax: item.investment_max,
        description: item.description,
        contact: item.contact || item.line_id,
        features: item.features || [],
        imageUrl: item.image_url,
        icon: getCategoryIcon(item.category),
        location: item.location,
        createdAt: item.created_at,
        views: item.views || 0,
        isBoosted: item.is_boosted || false,
        isFeatured: item.is_featured || false,
        boostEndDate: item.boost_end_date,
        isPremiumSeller: Math.random() > 0.7,
        userPlanType: Math.random() > 0.7 ? 'premium' : 'basic'
      }))

      setFranchises(formattedData)
    } catch (error) {
      console.error('Error fetching franchises:', error)
    } finally {
      setLoading(false)
    }
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

  const filteredFranchises = franchises.filter(franchise => {
    const matchSearch = franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       franchise.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = selectedCategory === 'ทั้งหมด' || franchise.category === selectedCategory
    return matchSearch && matchCategory
  })

  // แทรก Banner Ads เข้าไปในรายการแฟรนไชส์
  const insertInlineBanners = (franchises) => {
    const result = []
    const bannerPositions = [4, 8, 12] // แทรกที่ตำแหน่งที่ 4, 8, 12
    
    franchises.forEach((franchise, index) => {
      result.push(franchise)
      
      if (bannerPositions.includes(index + 1)) {
        result.push({
          id: `banner-${index}`,
          type: 'banner',
          position: index + 1
        })
      }
    })
    
    return result
  }

  const franchisesWithBanners = insertInlineBanners(filteredFranchises)

  const getPremiumBadge = (franchise) => {
    if (franchise.isBoosted) {
      return (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
          🚀 BOOSTED
        </div>
      )
    }
    if (franchise.isPremiumSeller) {
      return (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
          ⭐ PREMIUM
        </div>
      )
    }
    return null
  }

  const getCardStyle = (franchise) => {
    if (franchise.isBoosted) {
      return "bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
    }
    if (franchise.isPremiumSeller) {
      return "bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
    }
    return "bg-white shadow-md hover:shadow-lg"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 
              className="text-xl sm:text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
              onClick={() => router.push('/')}
            >
              🏪 FranchiseHub
            </h1>
            
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                <>
                  <span className="text-sm text-gray-600 hidden lg:inline">
                    {currentUser.email}
                  </span>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => router.push('/add-franchise')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + ลงประกาศ
                  </button>
                  <button 
                    onClick={() => router.push('/advertise')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    📢 ลงโฆษณา
                  </button>
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut()
                      setCurrentUser(null)
                    }}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => router.push('/auth')}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    เข้าสู่ระบบ
                  </button>
                  <button 
                    onClick={() => router.push('/add-franchise')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + ลงประกาศฟรี
                  </button>
                  <button 
                    onClick={() => router.push('/advertise')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    📢 ลงโฆษณา
                  </button>
                </>
              )}
            </div>
          </div>

          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-3">
              {currentUser ? (
                <>
                  <div className="text-sm text-gray-600 px-2">
                    {currentUser.email}
                  </div>
                  <button 
                    onClick={() => {
                      router.push('/dashboard')
                      setShowMobileMenu(false)
                    }}
                    className="block w-full text-left px-2 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    📊 Dashboard
                  </button>
                  <button 
                    onClick={() => {
                      router.push('/add-franchise')
                      setShowMobileMenu(false)
                    }}
                    className="block w-full text-left px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + ลงประกาศใหม่
                  </button>
                  <button 
                    onClick={() => {
                      router.push('/advertise')
                      setShowMobileMenu(false)
                    }}
                    className="block w-full text-left px-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    📢 ลงโฆษณา
                  </button>
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut()
                      setCurrentUser(null)
                      setShowMobileMenu(false)
                    }}
                    className="block w-full text-left px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      router.push('/auth')
                      setShowMobileMenu(false)
                    }}
                    className="block w-full text-left px-2 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    🔐 เข้าสู่ระบบ
                  </button>
                  <button 
                    onClick={() => {
                      router.push('/add-franchise')
                      setShowMobileMenu(false)
                    }}
                    className="block w-full text-left px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + ลงประกาศฟรี
                  </button>
                  <button 
                    onClick={() => {
                      router.push('/advertise')
                      setShowMobileMenu(false)
                    }}
                    className="block w-full text-left px-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    📢 ลงโฆษณา
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Header Banner Ad */}
      <BannerAd position="header" className="border-b border-gray-200" />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 sm:py-16">
        <div className="px-4">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              ค้นหาแฟรนไชส์ในฝัน
            </h2>
            <h3 className="text-lg sm:text-xl font-medium mb-6 sm:mb-8">
              เริ่มธุรกิจของคุณวันนี้
            </h3>
            
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาแฟรนไชส์..."
                  className="w-full px-4 py-4 pl-12 rounded-xl text-gray-800 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 border-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                  🔍
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-4 text-sm">
                <span>🚀 Boosted</span>
                <span>⭐ Premium</span>
                <button
                  onClick={() => router.push('/pricing')}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors font-medium text-xs"
                >
                  อัปเกรด
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">หมวดหมู่:</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600 hover:shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        )}

        {!loading && (
          <div className="flex justify-between items-center mb-4 text-sm">
            <p className="text-gray-600">
              พบ {filteredFranchises.length} รายการ
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                Boosted
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Premium
              </span>
            </div>
          </div>
        )}

        {/* Franchise Grid with Inline Banners */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {franchisesWithBanners.map((item) => {
              if (item.type === 'banner') {
                return (
                  <div key={item.id} className="sm:col-span-2 lg:col-span-3">
                    <BannerAd position="inline" className="my-4" />
                  </div>
                )
              }

              const franchise = item
              return (
                <div 
                  key={franchise.id} 
                  className={`rounded-xl transition-all duration-300 relative ${getCardStyle(franchise)} overflow-hidden`}
                >
                  {getPremiumBadge(franchise)}

                  <div 
                    className="h-48 sm:h-52 bg-gray-100 overflow-hidden cursor-pointer relative"
                    onClick={() => router.push(`/franchise/${franchise.id}`)}
                  >
                    {franchise.imageUrl ? (
                      <img 
                        src={franchise.imageUrl} 
                        alt={franchise.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="60" text-anchor="middle" x="100" y="115">${franchise.icon}</text></svg>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl bg-gray-100 hover:bg-gray-200 transition-colors">
                        {franchise.icon}
                      </div>
                    )}

                    {franchise.isBoosted && (
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        🔥 Boosted
                      </div>
                    )}
                  </div>
                
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 
                        className="text-lg sm:text-xl font-semibold cursor-pointer hover:text-blue-600 transition-colors flex-1 line-clamp-2"
                        onClick={() => router.push(`/franchise/${franchise.id}`)}
                      >
                        {franchise.name}
                      </h3>
                      {franchise.isPremiumSeller && (
                        <div className="ml-2 text-blue-600 text-sm">⭐</div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                      {franchise.icon} {franchise.category}
                    </p>
                    
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{franchise.description}</p>
                    
                    {franchise.location && (
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        📍 {franchise.location}
                      </p>
                    )}
                    
                    {franchise.features.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {franchise.features.slice(0, 2).map((feature, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                        {franchise.features.length > 2 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            +{franchise.features.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-green-600 font-semibold text-sm">
                        <span className="mr-1">💰</span>
                        <span>{franchise.investment} บาท</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-xs">
                        <span className="mr-1">👀</span>
                        <span>{franchise.views}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`/franchise/${franchise.id}`)}
                        className={`flex-1 py-2.5 rounded-lg text-sm transition-colors font-medium ${
                          franchise.isBoosted 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                            : franchise.isPremiumSeller
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {franchise.isBoosted ? '🚀 ดูรายละเอียด' : 'ดูรายละเอียด'}
                      </button>
                      
                      {franchise.contact && (
                        <a 
                          href={`tel:${franchise.contact}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0 bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 text-sm text-center transition-colors font-medium"
                        >
                          📞
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && filteredFranchises.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">ไม่พบแฟรนไชส์ที่ค้นหา</p>
            <p className="text-gray-400 mt-2 text-sm">ลองค้นหาคำอื่น หรือเปลี่ยนหมวดหมู่</p>
          </div>
        )}
      </main>

      {/* Footer Banner Ad */}
      <BannerAd position="footer" className="mt-12" />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="px-4 text-center">
          <p className="text-sm">&copy; 2024 FranchiseHub - ตลาดซื้อขายแฟรนไชส์อันดับ 1</p>
        </div>
      </footer>
    </div>
  )
}