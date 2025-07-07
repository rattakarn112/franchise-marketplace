'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  // State สำหรับเก็บข้อมูลแฟรนไชส์
  const [franchises, setFranchises] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
// เพิ่มใน component
const [currentUser, setCurrentUser] = useState(null)

useEffect(() => {
  checkUser()
}, [])

const checkUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  setCurrentUser(user)
}
  // หมวดหมู่ทั้งหมด
  const categories = ['ทั้งหมด', 'อาหาร', 'เครื่องดื่ม', 'บริการ', 'ค้าปลีก', 'การศึกษา', 'สุขภาพและความงาม']

  // ดึงข้อมูลจาก Supabase เมื่อโหลดหน้า
  useEffect(() => {
    fetchFranchises()
  }, [])

  // เพิ่ม focus refresh
  useEffect(() => {
    const handleFocus = () => {
      fetchFranchises()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // ฟังก์ชันดึงข้อมูล
  const fetchFranchises = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('ดึงข้อมูลได้:', data?.length, 'รายการ')

      // แปลงข้อมูลให้ตรงกับ format ที่ต้องการ
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
        createdAt: item.created_at
      }))

      setFranchises(formattedData)
    } catch (error) {
      console.error('Error fetching franchises:', error)
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชันเลือก icon ตาม category
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

  // กรองข้อมูลตามการค้นหาและหมวดหมู่
  const filteredFranchises = franchises.filter(franchise => {
    const matchSearch = franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       franchise.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = selectedCategory === 'ทั้งหมด' || franchise.category === selectedCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
  <div className="container mx-auto px-4 py-4 flex justify-between items-center">
    <h1 className="text-2xl font-bold text-blue-600">FranchiseHub</h1>
    
    <div className="flex gap-2">
      {currentUser ? (
        <>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 text-blue-600 hover:text-blue-700"
          >
            Dashboard
          </button>
          <button 
            onClick={() => window.location.href = '/add-franchise'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + ลงประกาศฟรี
          </button>
        </>
      ) : (
        <>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="px-4 py-2 text-blue-600 hover:text-blue-700"
          >
            เข้าสู่ระบบ
          </button>
          <button 
            onClick={() => window.location.href = '/add-franchise'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + ลงประกาศฟรี
          </button>
        </>
      )}
    </div>
  </div>
</header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            ค้นหาแฟรนไชส์ในฝัน เริ่มธุรกิจของคุณวันนี้
          </h2>
          <p className="text-xl mb-8">
            แพลตฟอร์มซื้อขายแฟรนไชส์อันดับ 1 ของประเทศไทย
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="ค้นหาแฟรนไชส์... (เช่น ชาไข่มุก, กาแฟ)"
              className="w-full px-6 py-4 rounded-lg text-gray-800 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">หมวดหมู่:</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <p className="text-gray-600 mb-4">
            พบ {filteredFranchises.length} รายการ
          </p>
        )}

     {/* Franchise Grid */}
{!loading && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredFranchises.map(franchise => (
      <div key={franchise.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
        {/* Franchise Image - เพิ่ม onClick */}
        <div 
          className="h-48 bg-gray-100 rounded-t-lg overflow-hidden cursor-pointer"
          onClick={() => window.location.href = `/franchise/${franchise.id}`}
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
            <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-100 hover:bg-gray-200 transition-colors">
              {franchise.icon}
            </div>
          )}
        </div>
        
        {/* Franchise Details */}
        <div className="p-6">
          {/* Title - เพิ่ม onClick */}
          <h3 
            className="text-xl font-semibold mb-2 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => window.location.href = `/franchise/${franchise.id}`}
          >
            {franchise.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2">{franchise.category}</p>
          <p className="text-gray-700 mb-4 line-clamp-2">{franchise.description}</p>
          
          {/* Location */}
          {franchise.location && (
            <p className="text-sm text-gray-500 mb-3">
              📍 {franchise.location}
            </p>
          )}
          
          {/* Features */}
          {franchise.features.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {franchise.features.slice(0, 2).map((feature, index) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
              {franchise.features.length > 2 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  +{franchise.features.length - 2}
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center text-green-600 font-semibold mb-4">
            <span className="mr-2">💰</span>
            <span>{franchise.investment} บาท</span>
          </div>
          
          <div className="flex gap-2">
            {/* ปุ่มดูรายละเอียด - อัปเดต onClick */}
            <button 
              onClick={() => window.location.href = `/franchise/${franchise.id}`}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm transition-colors"
            >
              ดูรายละเอียด
            </button>
            {franchise.contact && (
              <a 
                href={`tel:${franchise.contact}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm text-center transition-colors"
              >
                📞 ติดต่อ
              </a>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
)}

        {/* No Results */}
        {!loading && filteredFranchises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">ไม่พบแฟรนไชส์ที่ค้นหา</p>
            <p className="text-gray-400 mt-2">ลองค้นหาคำอื่น หรือเปลี่ยนหมวดหมู่</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 FranHub - ตลาดซื้อขายแฟรนไชส์อันดับ 1</p>
        </div>
      </footer>
    </div>
  )
}