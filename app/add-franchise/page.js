'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AddFranchise() {
  const router = useRouter()
  
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
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // State สำหรับแสดงข้อความ
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Features ที่ให้เลือก
  const availableFeatures = [
    'รับประกันรายได้',
    'อบรมฟรี',
    'ช่วยหาทำเล',
    'มีทีมซัพพอร์ต',
    'ส่งวัตถุดิบให้',
    'ROI ไม่เกิน 1 ปี'
  ]

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

  // ฟังก์ชันจัดการการเลือกรูปภาพ
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
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
      
      // สร้าง preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // ฟังก์ชันอัพโหลดรูปภาพ
  const uploadImage = async () => {
    if (!imageFile) return null

    setUploadingImage(true)
    
    try {
      // สร้างชื่อไฟล์ unique
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `franchises/${fileName}`

      // อัพโหลดไปยัง Supabase Storage
      const { data, error } = await supabase.storage
        .from('franchise-images')
        .upload(filePath, imageFile)

      if (error) throw error

      // สร้าง public URL
      const { data: { publicUrl } } = supabase.storage
        .from('franchise-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ')
      return null
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
    if (!formData.contact.trim() && !formData.lineId.trim()) {
      newErrors.contact = 'กรุณากรอกเบอร์โทร หรือ LINE ID อย่างน้อย 1 อย่าง'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'กรุณากรอกรายละเอียด'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ฟังก์ชันบันทึกข้อมูลลง Supabase
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // เช็ค user ก่อน
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    alert('กรุณาเข้าสู่ระบบก่อนลงประกาศ')
    router.push('/auth')
    return
  }
      // อัพโหลดรูปภาพก่อน (ถ้ามี)
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage()
      }

      // เตรียมข้อมูลสำหรับบันทึก
      const dataToSave = {
        name: formData.name,
        category: formData.category,
        investment_min: parseInt(formData.investmentMin),
        investment_max: parseInt(formData.investmentMax),
        description: formData.description,
        contact: formData.contact || null,
        line_id: formData.lineId || null,
        location: formData.location || null,
        features: formData.features,
        image_url: imageUrl,
        user_id: user.id
      }

      // บันทึกลง Supabase
      const { data, error } = await supabase
        .from('franchises')
        .insert([dataToSave])
        .select()

      if (error) throw error

      // แสดงข้อความสำเร็จ
      setShowSuccess(true)
      console.log('บันทึกสำเร็จ:', data)
      
      // รอ 2 วินาที แล้วกลับไปหน้าแรก
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)

    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">🏪 FranHub</h1>
            <button 
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← กลับหน้าแรก
            </button>
          </div>
        </div>
      </header>

      {/* Form Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">ลงประกาศแฟรนไชส์ฟรี</h2>

          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              ✅ บันทึกข้อมูลสำเร็จ! กำลังกลับไปหน้าแรก...
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* อัพโหลดรูปภาพ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รูปภาพแฟรนไชส์
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
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
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>{imagePreview ? 'เปลี่ยนรูป' : 'เลือกรูปภาพ'}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">หรือลากไฟล์มาวาง</p>
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
                className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="text-blue-600 rounded"
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ช่องทางติดต่อ */}
            <div className="space-y-4">
              <h3 className="font-medium">ช่องทางติดต่อ *</h3>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
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
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className={`flex-1 py-3 rounded-lg font-medium ${
                  loading || uploadingImage
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {uploadingImage ? 'กำลังอัพโหลดรูป...' : loading ? 'กำลังบันทึก...' : 'บันทึกประกาศ'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-medium"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}