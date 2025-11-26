// frontend/src/api/index.js
import http from './http'

// Auth API
export const authApi = {
  login: (credentials) => http.post('/auth/login', credentials),
  check: () => http.get('/auth/check'),
  logout: () => http.post('/auth/logout')
}

// Patients API
export const patientsApi = {
  getAll: (params) => http.get('/patients', { params }),
  getById: (id) => http.get(`/patients/${id}`),
  create: (data) => http.post('/patients', data),
  update: (id, data) => http.put(`/patients/${id}`, data),
  delete: (id) => http.delete(`/patients/${id}`),
  getStats: () => http.get('/patients/stats')
}

// Audit API
export const auditApi = {
  getLogs: (params) => http.get('/audit/logs', { params }),
  getStats: () => http.get('/audit/stats')
}

// DLT API
export const dltApi = {
  verify: (patientId) => http.get(`/dlt/verify/${patientId}`),
  createHash: (patientId) => http.post(`/dlt/hash/${patientId}`),
  getHashes: (patientId) => http.get(`/dlt/hashes/${patientId}`)
}

// Biometric API
export const biometricApi = {
  verify: (biometricId) => http.get(`/biometric/verify/${biometricId}`),
  link: (data) => http.post('/biometric/link', data),
  unlink: (biometricId) => http.delete(`/biometric/unlink/${biometricId}`),
  getLinks: (patientId) => http.get(`/biometric/links/${patientId}`),
  getStats: () => http.get('/biometric/stats')
}

// Dashboard API - Combine data from multiple endpoints with better error handling
// frontend/src/api/index.js - Improved dashboard API
export const dashboardApi = {
  getStats: async () => {
    try {
      console.log('Fetching dashboard statistics...');
      
      // Fetch data from all endpoints in parallel with error handling
      const [patientsStats, auditStats, biometricStats] = await Promise.allSettled([
        patientsApi.getStats().catch(err => {
          console.warn('Failed to fetch patient stats:', err);
          throw err;
        }),
        auditApi.getStats().catch(err => {
          console.warn('Failed to fetch audit stats:', err);
          throw err;
        }),
        biometricApi.getStats().catch(err => {
          console.warn('Failed to fetch biometric stats:', err);
          throw err;
        })
      ]);

      // Process results with fallbacks
      const patientsData = patientsStats.status === 'fulfilled' ? patientsStats.value.data : {
        total: 0,
        consented: 0,
        reactive: 0,
        non_reactive: 0,
        dlt_verified: 0,
        daily_enrollments: 0
      };

      const auditData = auditStats.status === 'fulfilled' ? auditStats.value.data : {
        last_30_days: [],
        last_24_hours: [],
        total_actions_24h: 0,
        total_actions_30d: 0
      };

      const biometricData = biometricStats.status === 'fulfilled' ? biometricStats.value.data : {
        active_biometric_links: 0
      };

      // Calculate DLT stats
      const dltStats = {
        total_hashes: patientsData.total || 0,
        verified_hashes: patientsData.dlt_verified || 0
      };

      console.log('Dashboard data processed:', {
        patients: patientsData.total,
        audit: auditData.total_actions_24h,
        biometric: biometricData.active_biometric_links
      });

      return {
        data: {
          patients: patientsData,
          audit: auditData,
          dlt: dltStats,
          biometric: biometricData,
          system_uptime: Math.floor(Math.random() * 86400) + 3600 // Mock uptime for now
        }
      };
    } catch (error) {
      console.error('Error in dashboard API:', error);
      // Return comprehensive fallback data
      return {
        data: {
          patients: { 
            total: 0, 
            consented: 0, 
            reactive: 0, 
            non_reactive: 0, 
            daily_enrollments: 0,
            consent_rate: 0,
            reactive_rate: 0,
            dlt_verification_rate: 0
          },
          audit: { 
            last_30_days: [], 
            last_24_hours: [],
            total_actions_24h: 0,
            total_actions_30d: 0
          },
          dlt: { total_hashes: 0, verified_hashes: 0 },
          biometric: { active_biometric_links: 0 },
          system_uptime: 0
        }
      };
    }
  }
};

export default {
  auth: authApi,
  patients: patientsApi,
  audit: auditApi,
  dlt: dltApi,
  biometric: biometricApi,
  dashboard: dashboardApi
}