'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdvertisePage() {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [stats, setStats] = useState({
    monthlyVisitors: 45000,
    dailyViews: 1500,
    avgSessionTime: '2:45',
    topCategories: ['อาหาร', 'เครื่องดื่ม', 'บริการ']
  })

  const packages = [
    {
      id: 'header-banner',
      name: 'Header Banner',
      position: 'header',
      description: 'แบรนเนอร์ด้านบนทุกหน้า - เห็นได้ชัดเจนที่สุด',
      price: 15000,
      duration: '30 วัน',
      features: [
        'แสดงบนทุกหน้าเว็บไซต์',
        'ขนาด 1200x120 พิกเซล',
        'Auto-rotate ถ้ามีหลายแบรนด์',
        'Click tracking และ analytics',
        'Mobile responsive'
      ],
      metrics: {
        impressions: '45,000-50,000 ต่อเดือน',
        ctr: '2.1%',
        reach: 'ทุกผู้เข้าชม'
      },
      popular: true
    },
    {
      id: 'sidebar-banner',
      name: 'Sidebar Banner',
      position: 'sidebar',
      description: 'แบรนเนอร์ด้านข้าง - เหมาะสำหรับแบรนด์ที่ต้องการ engagement',
      price: 8000,
      duration: '30 วัน',
      features: [
        'แสดงในหน้ารายละเอียดแฟรนไชส์',
        'ขนาด 300x250 พิกเซล',
        'Rich media support',
        'Targeted audience',
        'Call-to-action button'
      ],
      metrics: {
        impressions: '25,000-30,000 ต่อเดือน',
        ctr: '3.5%',
        reach: 'ผู้ที่สนใจรายละเอียด'
      }
    },
    {
      id: 'inline-banner',
      name: 'Inline Banner',
      position: 'inline',
      description: 'แบรนเนอร์แทรกในรายการแฟรนไชส์ - Natural integration',
      price: 5000,
      duration: '30 วัน',
      features: [
        'แทรกในรายการแฟรนไชส์',
        'ออกแบบให้ดูเป็นธรรมชาติ',
        'Native advertising style',
        'เหมาะสำหรับแฟรนไชส์',
        'Cost effective'
      ],
      metrics: {
        impressions: '20,000-25,000 ต่อเดือน',
        ctr: '4.2%',
        reach: 'กลุ่มเป้าหมายหลัก'
      }
    },
    {
      id: 'sponsored-post',
      name: 'Sponsored Post',
      position: 'featured',
      description: 'โพสต์สปอนเซอร์ - แสดงเป็นแฟรนไชส์แนะนำ',
      price: 12000,
      duration: '30 วัน',
      features: [
        'แสดงในส่วน Featured',
        'เหมือนแฟรนไชส์จริง',
        'Premium placement',
        'Full content control',
        'Lead generation'
      ],
      metrics: {
        impressions: '35,000-40,000 ต่อเดือน',
        ctr: '5.8%',
        reach: 'กลุ่มที่กำลังหาแฟรนไชส์'
      },
      featured: true
    }
  ]

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    // ส่งข้อมูลติดต่อ (ใน production จะส่งไปยัง CRM หรือ email)
    console.log('Contact form submitted:', {
      package: selectedPackage,
      companyName: formData.get('companyName'),
      contactName: formData.get('contactName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message')
    })
    
    alert('ขอบคุณสำหรับความสนใจ! เราจะติดต่อกลับภายใน 24 ชั่วโมง')
    setShowContactForm(false)
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
            <button 
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← กลับหน้าแรก
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            📢 ลงโฆษณากับ FranchiseHub
          </h2>
          <p className="text-xl mb-8">
            เข้าถึงผู้ประกอบการและนักลงทุนแฟรนไชส์มากกว่า 45,000 คนต่อเดือน
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">45K+</div>
              <div className="text-sm">ผู้เข้าชมต่อเดือน</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">1,500+</div>
              <div className="text-sm">ครั้งต่อวัน</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">2:45</div>
              <div className="text-sm">เวลาเฉลี่ยต่อครั้ง</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">85%</div>
              <div className="text-sm">Mobile Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        
        {/* Target Audience */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8">🎯 กลุ่มเป้าหมายของเรา</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-4xl mb-4">👔</div>
              <h4 className="text-xl font-semibold mb-2">ผู้ประกอบการ</h4>
              <p className="text-gray-600">ที่ต้องการขยายธุรกิจผ่านระบบแฟรนไชส์</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="text-xl font-semibold mb-2">นักลงทุน</h4>
              <p className="text-gray-600">ที่กำลังมองหาโอกาสลงทุนในแฟรนไชส์</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-4xl mb-4">🚀</div>
              <h4 className="text-xl font-semibold mb-2">Startup</h4>
              <p className="text-gray-600">ที่ต้องการเครื่องมือและบริการธุรกิจ</p>
            </div>
          </div>
        </section>

        {/* Ad Packages */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8">📦 แพ็กเกจโฆษณา</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <div 
                key={pkg.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl relative ${
                  pkg.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
                } ${
                  pkg.featured ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ⭐ ยอดนิยม
                    </span>
                  </div>
                )}

                {pkg.featured && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                    👑 Premium
                  </div>
                )}

                <div className="p-6">
                  <h4 className="text-xl font-bold mb-2">{pkg.name}</h4>
                  <p className="text-gray-600 text-sm mb-4 h-12">{pkg.description}</p>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-blue-600">
                      ฿{pkg.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">/{pkg.duration}</div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="text-green-500 mr-2 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Metrics */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-xs font-medium text-gray-500 mb-2">📊 ประสิทธิภาพโฆษณา</div>
                    <div className="text-sm">
                      <div>👀 {pkg.metrics.impressions}</div>
                      <div>🎯 CTR: {pkg.metrics.ctr}</div>
                      <div>📍 {pkg.metrics.reach}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPackage(pkg)
                      setShowContactForm(true)
                    }}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                      pkg.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : pkg.featured
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                  >
                    📞 ติดต่อสอบถาม
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8">⭐ ทำไมต้องเลือกเรา?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-semibold mb-2">Targeted Audience</h4>
              <p className="text-sm text-gray-600">กลุ่มเป้าหมายที่แม่นยำ</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl mb-3">📱</div>
              <h4 className="font-semibold mb-2">Mobile First</h4>
              <p className="text-sm text-gray-600">85% ผู้ใช้เป็น Mobile</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl mb-3">📈</div>
              <h4 className="font-semibold mb-2">Real Analytics</h4>
              <p className="text-sm text-gray-600">รายงานผลแบบ Real-time</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl mb-3">🤝</div>
              <h4 className="font-semibold mb-2">Full Support</h4>
              <p className="text-sm text-gray-600">ทีมงานคุณภาพดูแล</p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">🚀 พร้อมเริ่มต้นแล้วใช่ไหม?</h3>
          <p className="mb-6">ติดต่อเราวันนี้เพื่อรับส่วนลดพิเศษสำหรับลูกค้าใหม่</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+66-2-xxx-xxxx"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              📞 โทร: 02-XXX-XXXX
            </a>
            <a 
              href="mailto:ads@franchisehub.com"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              📧 อีเมล: ads@franchisehub.com
            </a>
            <a 
              href="https://line.me/ti/p/@franchisehub"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              💬 LINE: @franchisehub
            </a>
          </div>
        </section>
      </main>

      {/* Contact Form Modal */}
      {showContactForm && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">📞 ติดต่อสอบถาม</h3>
              <button 
                onClick={() => setShowContactForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800">{selectedPackage.name}</div>
              <div className="text-sm text-blue-600">฿{selectedPackage.price.toLocaleString()} / {selectedPackage.duration}</div>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อบริษัท *</label>
                <input 
                  type="text" 
                  name="companyName"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="บริษัท ABC จำกัด"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อผู้ติดต่อ *</label>
                <input 
                  type="text" 
                  name="contactName"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="คุณสมชาย ใจดี"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">อีเมล *</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">เบอร์โทรศัพท์ *</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="08X-XXX-XXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">ข้อความเพิ่มเติม</label>
                <textarea 
                  name="message"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="รายละเอียดเพิ่มเติม วัตถุประสงค์ หรือคำถาม..."
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  ส่งข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 FranchiseHub - ตลาดซื้อขายแฟรนไชส์อันดับ 1</p>
          <p className="text-sm text-gray-400 mt-2">สำหรับการลงโฆษณา โทร 02-XXX-XXXX หรืออีเมล ads@franchisehub.com</p>
        </div>
      </footer>
    </div>
  )
}