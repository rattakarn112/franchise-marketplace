'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EditFranchise() {
  const router = useRouter()
  const params = useParams()
  const franchiseId = params?.id
  
  // State สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    investmentMin: '',
    investmentMax: '',
    description: '',
    contact: '',
    lineId: '',
    location: '',
    features: []
  })

  // State สำหรับรูปภาพ
  const [currentImageUrl, setCurrentImageUrl] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // State สำหรับแสดงข้อความ
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Features ที่ให้เลือก
  const availableFeatures = [
    'รับประกันรายได้',
    'อบรมฟรี',
    'ช่วยหาทำเล',
    'มีทีมซัพพอร์ต',
    'ส่งวัตถุดิบให้',
    'ROI ไม่เกิน 1 ปี'
  ]

  // ดึงข้อมูลแฟรนไชส์เมื่อโหลดหน้า
  useEffect(() => {
    if (franchiseId) {
      fetchFranchiseData()
    }
  }, [franchiseId])

  // ฟังก์ชันดึงข้อมูล
  const fetchFranchiseData = async () => {
    try {
      setLoadingData(true)
      
      // เช็ค user ก่อน
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // ดึงข้อมูลแฟรนไชส์
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .eq('id', franchiseId)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        console.error('Error fetching data:', error)
        alert('ไม่พบข้อมูลหรือคุณไม่มีสิทธิ์แก้ไข')
        router.push('/dashboard')
        return
      }

      // Set ข้อมูลลงฟอร์ม
      setFormData({
        name: data.name || '',
        category: data.category || '',
        investmentMin: data.investment_min?.toString() || '',
        investmentMax: data.investment_max?.toString() || '',
        description: data.description || '',
        contact: data.contact || '',
        lineId: data.line_id || '',
        location: data.location || '',
        features: data.features || []
      })

      // Set รูปภาพปัจจุบัน
      if (data.image_url) {
        setCurrentImageUrl(data.image_url)
        setImagePreview(data.image_url)
      }

    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาด')
      router.push('/dashboard')
    } finally {
      setLoadingData(false)
    }
  }

  // ฟังก์ชันอัพเดทข้อมูลฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // ลบ error ของ field นั้นเมื่อมีการแก้ไข
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // ฟังก์ชันจัดการการเลือกรูปภาพ - แก้ไขใหม่
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    console.log('File selected:', file) // Debug log
    
    if (file) {
      console.log('File size:', file.size)
      console.log('File type:', file.type)
      
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์รูปภาพต้องไม่เกิน 5MB')
        return
      }

      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        return
      }

      setImageFile(file)
      console.log('Image file set:', file.name)
      
      // สร้าง preview
      const reader = new FileReader()
      reader.onloadend = () => {
        console.log('Setting preview')
        setImagePreview(reader.result)
      }
      reader.onerror = () => {
        console.error('Error reading file')
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์')
      }
      reader.readAsDataURL(file)
    }
  }

  // ฟังก์ชันรีเซ็ตรูปภาพ
  const resetImage = () => {
    console.log('Resetting image')
    setImageFile(null)
    setImagePreview(currentImageUrl) // กลับไปเป็นรูปเดิม
    
    // รีเซ็ต file input
    const fileInput = document.getElementById('file-upload')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // ฟังก์ชันลบรูปภาพ
  const removeImage = () => {
    console.log('Removing image')
    setImageFile(null)
    setImagePreview(null)
    setCurrentImageUrl(null)
    
    // รีเซ็ต file input
    const fileInput = document.getElementById('file-upload')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // ฟังก์ชันอัพโหลดรูปภาพ
  const uploadImage = async () => {
    if (!imageFile) {
      console.log('No new image file, using current URL:', currentImageUrl)
      return currentImageUrl
    }

    console.log('Starting image upload...')
    setUploadingImage(true)
    
    try {
      // สร้างชื่อไฟล์ unique
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `franchises/${fileName}`

      console.log('Uploading to:', filePath)

      // อัพโหลดไปยัง Supabase Storage
      const { data, error } = await supabase.storage
        .from('franchise-images')
        .upload(filePath, imageFile)

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      console.log('Upload successful:', data)

      // สร้าง public URL
      const { data: { publicUrl } } = supabase.storage
        .from('franchise-images')
        .getPublicUrl(filePath)

      console.log('Public URL:', publicUrl)
      return publicUrl

    } catch (error) {
      console.error('Error uploading image:', error)
      alert('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ: ' + error.message)
      return currentImageUrl
    } finally {
      setUploadingImage(false)
    }
  }

  // ฟังก์ชันจัดการ features
  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  // ตรวจสอบข้อมูล
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อแฟรนไชส์'
    }
    if (!formData.category) {
      newErrors.category = 'กรุณาเลือกหมวดหมู่'
    }
    if (!formData.investmentMin || !formData.investmentMax) {
      newErrors.investment = 'กรุณากรอกเงินลงทุน'
    }
    if (parseInt(formData.investmentMin) >= parseInt(formData.investmentMax)) {
      newErrors.investment = 'เงินลงทุนขั้นต่ำต้องน้อยกว่าขั้นสูง'
    }
    if (!formData.contact.trim() && !formData.lineId.trim()) {
      newErrors.contact = 'กรุณากรอกเบอร์โทร หรือ LINE ID อย่างน้อย 1 อย่าง'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'กรุณากรอกรายละเอียด'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ฟังก์ชันบันทึกข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submitted')
    
    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }

    setLoading(true)

    try {
      // เช็ค user อีกครั้ง
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('กรุณาเข้าสู่ระบบใหม่')
        router.push('/auth')
        return
      }

      console.log('User confirmed:', user.id)
      console.log('Current image URL:', currentImageUrl)
      console.log('New image file:', imageFile)

      // อัพโหลดรูปภาพใหม่ (ถ้ามี)
      let imageUrl = null
      if (imageFile) {
        console.log('Uploading new image...')
        imageUrl = await uploadImage()
      } else if (imagePreview) {
        console.log('Using existing image URL')
        imageUrl = currentImageUrl
      }

      console.log('Final image URL:', imageUrl)

      // เตรียมข้อมูลสำหรับอัพเดท
      const dataToUpdate = {
        name: formData.name.trim(),
        category: formData.category,
        investment_min: parseInt(formData.investmentMin),
        investment_max: parseInt(formData.investmentMax),
        description: formData.description.trim(),
        contact: formData.contact.trim() || null,
        line_id: formData.lineId.trim() || null,
        location: formData.location.trim() || null,
        features: formData.features,
        image_url: imageUrl
      }

      console.log('Data to update:', dataToUpdate)

      // อัพเดทข้อมูล
      const { data: updateResult, error } = await supabase
        .from('franchises')
        .update(dataToUpdate)
        .eq('id', franchiseId)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Update error:', error)
        throw error
      }

      console.log('Update successful, result:', updateResult)
      
      if (!updateResult || updateResult.length === 0) {
        throw new Error('ไม่สามารถอัพเดทข้อมูลได้ - อาจไม่มีสิทธิ์หรือไม่พบข้อมูล')
      }

      // แสดงข้อความสำเร็จ
      setShowSuccess(true)
      
      // กลับไป Dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('Error in handleSubmit:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
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
            <h1 className="text-2xl font-bold text-blue-600">🏪 FranHub</h1>
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← กลับ Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Form Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">แก้ไขประกาศแฟรนไชส์</h2>

          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              ✅ บันทึกการแก้ไขสำเร็จ! กำลังกลับไป Dashboard...
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* อัพโหลดรูปภาพ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รูปภาพแฟรนไชส์
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="mx-auto h-40 w-40 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          console.error('Image load error:', e)
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect fill="%23f3f4f6" width="160" height="160"/><text fill="%236b7280" font-family="sans-serif" font-size="20" text-anchor="middle" x="80" y="85">รูปภาพ</text></svg>'
                        }}
                      />
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors text-xs"
                          title="ลบรูป"
                        >
                          🗑️
                        </button>
                        <button
                          type="button"
                          onClick={resetImage}
                          className="bg-gray-500 text-white rounded-full p-1 hover:bg-gray-600 transition-colors text-xs"
                          title="รีเซ็ต"
                        >
                          ↺
                        </button>
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        {imageFile ? '✅ เลือกรูปใหม่แล้ว' : '📷 รูปปัจจุบัน'}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-sm text-gray-500 mt-2">ไม่มีรูปภาพ</p>
                    </div>
                  )}
                  
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1 border border-blue-200 hover:border-blue-400 transition-all"
                    >
                      <span>📁 {imagePreview ? 'เปลี่ยนรูป' : 'เลือกรูปภาพ'}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleImageChange}
                        accept="image/*"
                        key={imageFile ? imageFile.name : 'empty'} // Force re-render
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG ไม่เกิน 5MB</p>
                </div>
              </div>
            </div>

            {/* ชื่อแฟรนไชส์ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อแฟรนไชส์ *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="เช่น ชาไข่มุก MoonTea"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* หมวดหมู่ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่ *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- เลือกหมวดหมู่ --</option>
                <option value="อาหาร">อาหาร</option>
                <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                <option value="บริการ">บริการ</option>
                <option value="ค้าปลีก">ค้าปลีก</option>
                <option value="การศึกษา">การศึกษา</option>
                <option value="สุขภาพและความงาม">สุขภาพและความงาม</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* เงินลงทุน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เงินลงทุน (บาท) *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    name="investmentMin"
                    value={formData.investmentMin}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.investment ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ต่ำสุด"
                    min="0"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="investmentMax"
                    value={formData.investmentMax}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.investment ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="สูงสุด"
                    min="0"
                  />
                </div>
              </div>
              {errors.investment && <p className="text-red-500 text-sm mt-1">{errors.investment}</p>}
            </div>

            {/* รายละเอียด */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียดแฟรนไชส์ *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="อธิบายจุดเด่น ผลตอบแทน และข้อมูลสำคัญอื่นๆ"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* พื้นที่ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                พื้นที่ให้สิทธิ์
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น ทั่วประเทศ, กรุงเทพและปริมณฑล"
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จุดเด่นของแฟรนไชส์
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableFeatures.map(feature => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ช่องทางติดต่อ */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">ช่องทางติดต่อ *</h3>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="08X-XXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  LINE ID
                </label>
                <input
                  type="text"
                  name="lineId"
                  value={formData.lineId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="@yourlineid"
                />
              </div>
              {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
            </div>

            {/* ปุ่ม Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  loading || uploadingImage
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {uploadingImage ? '📤 กำลังอัพโหลดรูป...' : loading ? '💾 กำลังบันทึก...' : '✅ บันทึกการแก้ไข'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                disabled={loading || uploadingImage}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-medium transition-all disabled:opacity-50"
              >
                ❌ ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
