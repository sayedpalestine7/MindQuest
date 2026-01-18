/**
 * Analytics utility for tracking user interactions
 * Supports Google Analytics (gtag) and can be extended for other analytics platforms
 */

export const analytics = {
  /**
   * Track a custom event
   * @param {string} eventName - Name of the event
   * @param {object} params - Event parameters
   */
  trackEvent: (eventName, params = {}) => {
    try {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', eventName, params)
      }
      
      // Console log in development
      if (import.meta.env.DEV) {
        console.log('📊 Analytics Event:', eventName, params)
      }
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  },

  /**
   * Track page view
   * @param {string} path - Page path
   * @param {string} title - Page title
   */
  trackPageView: (path, title) => {
    try {
      if (window.gtag) {
        window.gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: path,
          page_title: title
        })
      }
      
      if (import.meta.env.DEV) {
        console.log('📊 Page View:', path, title)
      }
    } catch (error) {
      console.error('Page view tracking error:', error)
    }
  },

  /**
   * Track CTA clicks
   * @param {string} ctaName - Name/label of the CTA
   * @param {string} source - Where the CTA is located (hero, navbar, cta, etc.)
   */
  trackCTA: (ctaName, source) => {
    analytics.trackEvent('cta_click', {
      cta_name: ctaName,
      source: source,
      timestamp: new Date().toISOString()
    })
  },

  /**
   * Track course interactions
   * @param {string} action - Action type (view, enroll, complete, etc.)
   * @param {string} courseId - Course ID
   * @param {object} metadata - Additional metadata
   */
  trackCourse: (action, courseId, metadata = {}) => {
    analytics.trackEvent(`course_${action}`, {
      course_id: courseId,
      ...metadata
    })
  },

  /**
   * Track user sign up
   * @param {string} method - Sign up method (email, google, etc.)
   * @param {string} role - User role (student, teacher)
   */
  trackSignUp: (method, role) => {
    analytics.trackEvent('sign_up', {
      method: method,
      role: role
    })
  },

  /**
   * Track user login
   * @param {string} method - Login method (email, google, etc.)
   */
  trackLogin: (method) => {
    analytics.trackEvent('login', {
      method: method
    })
  },

  /**
   * Track search queries
   * @param {string} query - Search query
   * @param {number} resultCount - Number of results
   */
  trackSearch: (query, resultCount) => {
    analytics.trackEvent('search', {
      search_term: query,
      result_count: resultCount
    })
  }
}

export default analytics
