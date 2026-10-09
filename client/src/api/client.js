/**
 * API Fetch Client for FinPilot
 * Uses HttpOnly session cookies and sends JSON payloads.
 */

const BASE_URL = '/api/v1';

let csrfTokenCache = null;

export async function fetchCsrfToken() {
  try {
    const res = await fetch(`${BASE_URL}/auth/csrf-token`, { credentials: 'include' });
    const data = await res.json();
    if (data.success && data.data?.csrfToken) {
      csrfTokenCache = data.data.csrfToken;
      return csrfTokenCache;
    }
  } catch (err) {
    console.warn('Failed to fetch CSRF token:', err);
  }
  return null;
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add CSRF token for mutating requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes((options.method || 'GET').toUpperCase())) {
    if (!csrfTokenCache) {
      await fetchCsrfToken();
    }
    if (csrfTokenCache) {
      headers['X-CSRF-Token'] = csrfTokenCache;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: { message: 'Failed to parse JSON response from server' }
  }));

  if (!response.ok || !data.success) {
    const error = new Error(data.error?.message || `HTTP ${response.status}: Request failed`);
    error.code = data.error?.code;
    error.status = response.status;
    error.details = data.error?.details;
    throw error;
  }

  return data;
}

// Format paise to INR
export function formatCurrency(paise) {
  if (paise === null || paise === undefined || isNaN(paise)) return '₹0.00';
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const remainderPaise = absPaise % 100;
  
  const formattedPaise = remainderPaise.toString().padStart(2, '0');
  
  let rupeeStr = rupees.toString();
  let lastThree = rupeeStr.substring(rupeeStr.length - 3);
  let otherNumbers = rupeeStr.substring(0, rupeeStr.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedRupees = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  
  return `${isNegative ? '-' : ''}₹${formattedRupees}.${formattedPaise}`;
}
