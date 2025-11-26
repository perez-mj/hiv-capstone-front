// frontend/src/stores/patient.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { patientApi } from '@/api/patientApi'

export const usePatientStore = defineStore('patient', () => {
  // State
  const patients = ref([])
  const loading = ref(false)
  const error = ref(null)
  const stats = ref({})

  // Getters
  const totalPatients = computed(() => patients.value.length)
  const consentedPatients = computed(() =>
    patients.value.filter(p => p.consent_status === 'YES').length
  )
  const reactivePatients = computed(() =>
    patients.value.filter(p => p.hiv_status === 'Reactive').length
  )
  const verifiedPatients = computed(() =>
    patients.value.filter(p => p.dlt_status === 'verified').length
  )

  // Actions
  // In your fetchPatients action:
  const fetchPatients = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await patientApi.getPatients()
      patients.value = response.data.map(patient => ({
        patient_id: patient.patient_id,
        name: patient.name,
        date_of_birth: patient.date_of_birth,
        contact_info: patient.contact || patient.contact_info,
        consent_status: patient.consent ? 'YES' : 'NO',
        hiv_status: patient.hiv_status,
        created_at: patient.created_at,
        biometric_id: patient.biometric_id,
        dlt_status: patient.dlt_hash_count > 0 ? 'verified' : 'pending',
        dlt_verified: patient.dlt_hash_count > 0
      }))
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch patients:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPatientStats = async () => {
    try {
      const response = await patientApi.getPatientStats()
      stats.value = response.data
    } catch (err) {
      console.error('Failed to fetch patient stats:', err)
    }
  }

  const createPatient = async (patientData) => {
    loading.value = true
    try {
      const response = await patientApi.createPatient(patientData)
      const newPatient = {
        ...response.data,
        dlt_status: 'pending',
        biometric_id: patientData.biometric_id
      }
      patients.value.unshift(newPatient)
      return newPatient
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePatient = async (patientId, patientData) => {
    loading.value = true
    try {
      const response = await patientApi.updatePatient(patientId, patientData)
      const index = patients.value.findIndex(p => p.patient_id === patientId)
      if (index !== -1) {
        patients.value[index] = {
          ...patients.value[index],
          ...response.data,
          // Reset DLT status since data changed
          dlt_status: 'pending'
        }
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePatient = async (patientId) => {
    loading.value = true
    try {
      await patientApi.deletePatient(patientId)
      patients.value = patients.value.filter(p => p.patient_id !== patientId)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // In your patient store actions
  const verifyDltIntegrity = async (patientId) => {
    try {
      const response = await patientApi.verifyDlt(patientId)

      // Update patient DLT status in the list
      const index = patients.value.findIndex(p => p.patient_id === patientId)
      if (index !== -1) {
        patients.value[index].dlt_status = response.data.is_verified ? 'verified' : 'failed'
        patients.value[index].last_verified = new Date().toISOString()
        patients.value[index].verification_result = response.data
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || err.message
      throw err
    }
  }

  const getDltHistory = async (patientId) => {
    try {
      const response = await patientApi.getDltHistory(patientId)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Search and filter utilities
  const searchPatients = (query) => {
    if (!query) return patients.value

    const q = query.toLowerCase()
    return patients.value.filter(patient =>
      patient.name.toLowerCase().includes(q) ||
      patient.patient_id.toLowerCase().includes(q) ||
      (patient.contact_info && patient.contact_info.toLowerCase().includes(q)) ||
      patient.hiv_status.toLowerCase().includes(q)
    )
  }

  // Clear errors
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    patients,
    loading,
    error,
    stats,

    // Getters
    totalPatients,
    consentedPatients,
    reactivePatients,
    verifiedPatients,

    // Actions
    fetchPatients,
    fetchPatientStats,
    createPatient,
    updatePatient,
    deletePatient,
    verifyDltIntegrity,
    getDltHistory,
    searchPatients,
    clearError
  }
})