'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// ฟังก์ชันส่ง custom events
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      custom_parameter_1: parameters.category || '',
      custom_parameter_2: parameters.action || '',
      custom_parameter_3: parameters.label || '',
      value: parameters.value || 0,
      ...parameters
    })
  }
}

// ฟังก์ชันเฉพาะสำหรับ Franchise
export const trackFranchiseView = (franchiseId, franchiseName, category) => {
  trackEvent('franchise_view', {
    franchise_id: franchiseId,
    franchise_name: franchiseName,
    category: category,
    page_title: document.title
  })
}

export const trackFranchiseContact = (franchiseId, contactMethod) => {
  trackEvent('franchise_contact', {
    franchise_id: franchiseId,
    contact_method: contactMethod, // 'phone', 'line', 'message'
    value: 1
  })
}

export const trackSearch = (searchTerm, resultsCount) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount
  })
}

// Component หลัก
export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
      // Track page views
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname + searchParams.toString()
      })
    }
  }, [pathname, searchParams])

  // ถ้าไม่มี GA ID หรืออยู่ใน development mode
  if (!GA_MEASUREMENT_ID || process.env.NODE_ENV === 'development') {
    return null
  }

  return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
}