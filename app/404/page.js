'use client'

import { useRouter } from 'next/navigation'
import FranchiseHubLogo from '@/components/Logo'


export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <FranchiseHubLogo onClick={() => router.push('/')} />
            <button 
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              กลับหน้าแรก
            </button>
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="text-9xl font-bold text-blue-100 mb-4">404</div>
            <div className="text-6xl mb-4">🏪</div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ไม่พบหน้าที่คุณต้องการ
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            ขอโทษครับ ไม่พบแฟรนไชส์หรือหน้าที่คุณกำลังมองหา<br/>
            อาจจะถูกลบ หรือ URL ไม่ถูกต้อง
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🏠 กลับหน้าแรก
            </button>
            
            <button 
              onClick={() => router.push('/add-franchise')}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              ➕ ลงประกาศแฟรนไชส์
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}