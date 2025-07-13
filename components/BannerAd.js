'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const BannerAd = ({ position, className = '', autoRotate = true, rotateInterval = 8000 }) => {
  const [banners, setBanners] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState({})
  const intervalRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)

  const currentBanner = banners[currentIndex]

  useEffect(() => {
    fetchBanners()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [position])

  // Auto-rotate effect
  useEffect(() => {
    if (autoRotate && banners.length > 1 && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      }, rotateInterval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [banners.length, autoRotate, rotateInterval, isPaused])

  const fetchBanners = async () => {
    try {
      setIsLoading(true)
      
      // แก้ไข query ให้ตรวจสอบว่า table มีอยู่และมี end_date หรือไม่
      const { data, error } = await supabase
        .from('banner_ads')
        .select('*')
        .eq('position', position)
        .eq('status', 'active')
        .order('priority', { ascending: false })

      if (error) {
        console.log('Database query failed, using demo data:', error)
        setDemoBanners()
        return
      }
      
      if (data && data.length > 0) {
        // กรองข้อมูลที่ยังไม่หมดอายุ (ถ้ามี end_date)
        const activeBanners = data.filter(banner => {
          if (!banner.end_date) return true
          return new Date(banner.end_date) > new Date()
        })
        
        if (activeBanners.length > 0) {
          setBanners(activeBanners)
        } else {
          setDemoBanners()
        }
      } else {
        // ใช้ demo banners ถ้าไม่มีใน database
        setDemoBanners()
      }
    } catch (error) {
      console.log('Error fetching banners, using demo data:', error)
      setDemoBanners()
    } finally {
      setIsLoading(false)
    }
  }

  const setDemoBanners = () => {
    const demoBanners = {
      header: [
        {
          id: 'demo-header-1',
          title: 'เปิดร้านกาแฟใน 30 วัน',
          description: 'แฟรนไชส์กาแฟ ROI 150% ต่อปี ลงทุนเริ่มต้น 50,000 บาท',
          image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=400&fit=crop',
          link_url: '/add-franchise',
          brand_name: 'Coffee World',
          background_color: '#8B4513',
          text_color: '#FFFFFF',
          cta_text: 'ดูรายละเอียด'
        },
        {
          id: 'demo-header-2',
          title: 'ชาไข่มุกแบรนด์ดัง',
          description: 'ROI คืนทุนภายใน 8 เดือน พร้อมระบบ POS ฟรี',
          image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
          link_url: '/pricing',
          brand_name: 'BubbleTea Plus',
          background_color: '#FF6B9D',
          text_color: '#FFFFFF',
          cta_text: 'สนใจเลย'
        },
        {
          id: 'demo-header-3',
          title: 'ร้านอาหารญี่ปุ่น',
          description: 'แฟรนไชส์อาหารญี่ปุ่น ยอดขายเฉลี่ย 80,000 บาท/เดือน',
          image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=400&fit=crop',
          link_url: '/advertise',
          brand_name: 'Sakura Kitchen',
          background_color: '#FF4444',
          text_color: '#FFFFFF',
          cta_text: 'เรียนรู้เพิ่ม'
        }
      ],
      sidebar: [
        {
          id: 'demo-sidebar-1',
          title: 'ลงทุนน้อย กำไรดี',
          description: 'เริ่มต้นเพียง 30,000 บาท คืนทุนเร็ว',
          image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
          link_url: '/add-franchise',
          brand_name: 'Quick Profit',
          background_color: '#FF6B35',
          text_color: '#FFFFFF',
          cta_text: 'ดูโอกาส'
        },
        {
          id: 'demo-sidebar-2',
          title: 'ธุรกิจบริการ',
          description: 'บริการทำความสะอาด รายได้มั่นคง',
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
          link_url: '/pricing',
          brand_name: 'CleanPro',
          background_color: '#4ECDC4',
          text_color: '#FFFFFF',
          cta_text: 'เริ่มเลย'
        }
      ],
      footer: [
        {
          id: 'demo-footer-1',
          title: 'ระบบ POS ฟรี สำหรับเจ้าของแฟรนไชส์',
          description: 'ลงทะเบียนวันนี้ รับระบบ POS มูลค่า 15,000 บาท ฟรี!',
          image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=200&fit=crop',
          link_url: '/pricing',
          brand_name: 'FranTech',
          background_color: '#4F46E5',
          text_color: '#FFFFFF',
          cta_text: 'รับเลย'
        },
        {
          id: 'demo-footer-2',
          title: 'เครื่องมือจัดการแฟรนไชส์',
          description: 'ระบบครบครัน ใช้งานง่าย เพิ่มยอดขาย 40%',
          image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=200&fit=crop',
          link_url: '/advertise',
          brand_name: 'FranTools',
          background_color: '#059669',
          text_color: '#FFFFFF',
          cta_text: 'ทดลองใช้'
        }
      ],
      inline: [
        {
          id: 'demo-inline-1',
          title: 'โอกาสทองสำหรับนักลงทุน',
          description: 'แฟรนไชส์ขนมหวาน ยอดนิยม กำไร 60%',
          image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=300&fit=crop',
          link_url: '/add-franchise',
          brand_name: 'Sweet Dreams',
          background_color: '#F59E0B',
          text_color: '#FFFFFF',
          cta_text: 'สนใจ'
        }
      ]
    }
    setBanners(demoBanners[position] || [])
  }

  const handleClick = async (banner) => {
    // บันทึก click analytics - ปิดไว้ก่อนเพื่อไม่ให้ error
    /*
    try {
      await supabase.rpc('increment_banner_clicks', { 
        p_banner_id: banner.id 
      })
    } catch (error) {
      console.log('Analytics tracking failed (non-critical):', error)
    }
    */

    // เปิดลิงก์
    if (banner.link_url) {
      if (banner.link_url.startsWith('http')) {
        window.open(banner.link_url, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = banner.link_url
      }
    }
  }

  const handleImageError = (bannerId) => {
    setImageErrors(prev => ({ ...prev, [bannerId]: true }))
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  // Helper function สำหรับ container classes
  function getContainerClasses(position) {
    switch (position) {
      case 'header':
        return 'w-full h-20 sm:h-28'
      case 'sidebar':
        return 'w-full aspect-[4/3] max-w-sm'
      case 'footer':
        return 'w-full h-16 sm:h-24'
      case 'inline':
        return 'w-full h-40 sm:h-48'
      default:
        return 'w-full h-32'
    }
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 ${getContainerClasses(position)} ${className}`}>
        <div className="h-full bg-gray-300 rounded"></div>
      </div>
    )
  }

  if (!currentBanner) return null

  const hasImage = currentBanner.image_url && !imageErrors[currentBanner.id]

  // Render different layouts based on position
  const renderBanner = () => {
    switch (position) {
      case 'header':
        return (
          <div 
            className={`relative overflow-hidden cursor-pointer group ${getContainerClasses(position)} ${className}`}
            onClick={() => handleClick(currentBanner)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Background Image */}
            {hasImage && (
              <div className="absolute inset-0">
                <img
                  src={currentBanner.image_url}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={() => handleImageError(currentBanner.id)}
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"
                  style={{ backgroundColor: `${currentBanner.background_color}99` }}
                ></div>
              </div>
            )}
            
            {/* Content Overlay */}
            <div 
              className={`relative z-10 h-full flex items-center justify-between px-4 sm:px-8 ${
                !hasImage ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''
              }`}
              style={!hasImage ? { 
                backgroundColor: currentBanner.background_color || '#4F46E5',
                color: currentBanner.text_color || '#FFFFFF'
              } : { color: currentBanner.text_color || '#FFFFFF' }}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg sm:text-2xl mb-1 sm:mb-2 line-clamp-1">
                  {currentBanner.title}
                </h3>
                <p className="text-sm sm:text-base opacity-90 line-clamp-1 sm:line-clamp-2">
                  {currentBanner.description}
                </p>
              </div>
              
              <div className="flex-shrink-0 ml-4 text-right">
                <div className="text-xs opacity-75 mb-1">โฆษณาโดย</div>
                <div className="font-semibold text-sm sm:text-base mb-2">
                  {currentBanner.brand_name}
                </div>
                <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 group-hover:bg-white/40">
                  {currentBanner.cta_text || 'คลิกดูเพิ่มเติม'} →
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  ←
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  →
                </button>
              </>
            )}

            {/* Indicators */}
            {banners.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )

      case 'sidebar':
        return (
          <div 
            className={`relative overflow-hidden rounded-xl shadow-lg cursor-pointer group ${getContainerClasses(position)} ${className}`}
            onClick={() => handleClick(currentBanner)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {hasImage ? (
              <div className="relative h-full">
                <img
                  src={currentBanner.image_url}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={() => handleImageError(currentBanner.id)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="font-bold text-lg mb-2 line-clamp-2">
                    {currentBanner.title}
                  </h4>
                  <p className="text-sm opacity-90 mb-3 line-clamp-2">
                    {currentBanner.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-75">
                      โฆษณาโดย {currentBanner.brand_name}
                    </span>
                    <span className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium transition-all duration-300">
                      {currentBanner.cta_text || 'ดูเพิ่มเติม'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="h-full p-6 flex flex-col justify-between"
                style={{ 
                  backgroundColor: currentBanner.background_color || '#4F46E5',
                  color: currentBanner.text_color || '#FFFFFF'
                }}
              >
                <div>
                  <h4 className="font-bold text-lg mb-2">{currentBanner.title}</h4>
                  <p className="text-sm opacity-90 mb-4">{currentBanner.description}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs opacity-75">
                    โฆษณาโดย {currentBanner.brand_name}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                    {currentBanner.cta_text || 'ดูเพิ่มเติม'}
                  </span>
                </div>
              </div>
            )}

            {/* Indicators for sidebar */}
            {banners.length > 1 && (
              <div className="absolute top-2 right-2 flex space-x-1">
                {banners.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )

      case 'footer':
        return (
          <div 
            className={`relative overflow-hidden cursor-pointer group ${getContainerClasses(position)} ${className}`}
            onClick={() => handleClick(currentBanner)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {hasImage && (
              <div className="absolute inset-0">
                <img
                  src={currentBanner.image_url}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={() => handleImageError(currentBanner.id)}
                />
                <div className="absolute inset-0 bg-black/60"></div>
              </div>
            )}
            
            <div 
              className={`relative z-10 h-full flex items-center justify-center text-center px-4 ${
                !hasImage ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : ''
              }`}
              style={!hasImage ? { 
                backgroundColor: currentBanner.background_color || '#4F46E5',
                color: currentBanner.text_color || '#FFFFFF'
              } : { color: currentBanner.text_color || '#FFFFFF' }}
            >
              <div>
                <h4 className="font-bold text-lg sm:text-xl mb-1">
                  {currentBanner.title}
                </h4>
                <p className="text-sm opacity-90">
                  {currentBanner.description} - {currentBanner.brand_name}
                </p>
              </div>
            </div>

            {/* Indicators */}
            {banners.length > 1 && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {banners.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )

      case 'inline':
        return (
          <div 
            className={`relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300 cursor-pointer group hover:border-blue-400 transition-all duration-300 ${getContainerClasses(position)} ${className}`}
            onClick={() => handleClick(currentBanner)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {hasImage ? (
              <div className="relative h-full">
                <img
                  src={currentBanner.image_url}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={() => handleImageError(currentBanner.id)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                
                {/* Ad Label */}
                <div className="absolute top-2 left-2 bg-gray-800/80 text-white px-2 py-1 rounded text-xs">
                  📢 โฆษณา
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="font-semibold text-base mb-1">{currentBanner.title}</h4>
                  <p className="text-sm opacity-90 mb-2">{currentBanner.description}</p>
                  <div className="text-xs opacity-75">โดย {currentBanner.brand_name}</div>
                </div>
              </div>
            ) : (
              <div 
                className="h-full p-4 text-center flex flex-col justify-center"
                style={{ 
                  backgroundColor: currentBanner.background_color || '#F3F4F6',
                  color: currentBanner.text_color || '#374151'
                }}
              >
                <div className="text-xs text-gray-500 mb-2">📢 โฆษณา</div>
                <h4 className="font-semibold text-base mb-1">{currentBanner.title}</h4>
                <p className="text-sm mb-2">{currentBanner.description}</p>
                <div className="text-xs opacity-75">โดย {currentBanner.brand_name}</div>
              </div>
            )}

            {/* Indicators */}
            {banners.length > 1 && (
              <div className="absolute top-2 right-2 flex space-x-1">
                {banners.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-white shadow-md' 
                        : 'bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="relative">
      {renderBanner()}
    </div>
  )
}

export default BannerAd