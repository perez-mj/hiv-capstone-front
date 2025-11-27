<!-- frontend/src/pages/admin/Patients.vue -->
<template>
  <v-container fluid class="patients-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Patient Management</h1>
          <p class="text-body-1 text-medium-emphasis">
            Manage patient records, enrollment, and data integrity verification
          </p>
        </div>
        
        <div class="header-actions">
          <v-btn 
            color="primary" 
            size="large"
            class="px-6"
            prepend-icon="mdi-account-plus"
            @click="openEnrollmentDialog"
            :loading="loading"
          >
            New Enrollment
          </v-btn>
          <v-btn
            variant="outlined"
            size="large"
            class="px-4"
            prepend-icon="mdi-download"
            @click="exportPatientData"
            :disabled="patients.length === 0"
          >
            Export
          </v-btn>
        </div>
      </div>
      
      <!-- Quick Stats -->
      <v-row class="stats-row mt-6">
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="2">
            <v-card-text class="text-center">
              <div class="stat-value text-primary">{{ stats.total }}</div>
              <div class="stat-label">Total Patients</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="2">
            <v-card-text class="text-center">
              <div class="stat-value text-success">{{ stats.consented }}</div>
              <div class="stat-label">Consented</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="2">
            <v-card-text class="text-center">
              <div class="stat-value text-warning">{{ stats.reactive }}</div>
              <div class="stat-label">Reactive Status</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="2">
            <v-card-text class="text-center">
              <div class="stat-value text-info">{{ stats.dlt_verified }}</div>
              <div class="stat-label">DLT Verified</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      <template v-slot:title>
        Error Loading Patients
      </template>
      {{ error }}
    </v-alert>

    <!-- Main Content -->
    <v-card elevation="2" class="main-card">
      <v-card-text>
        <!-- Filters and Search -->
        <div class="filter-section">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Search patients..."
                placeholder="Search by name, ID, or contact"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                @update:model-value="handleSearch"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="filters.consentStatus"
                :items="consentOptions"
                label="Consent Status"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="filters.hivStatus"
                :items="hivStatusOptions"
                label="HIV Status"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="filters.dltStatus"
                :items="dltStatusOptions"
                label="DLT Status"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                @update:model-value="handleFilterChange"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                label="Sort By"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="handleSortChange"
              />
            </v-col>
          </v-row>
        </div>

        <!-- Loading State -->
        <v-overlay :model-value="loading" contained class="align-center justify-center">
          <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        </v-overlay>

        <!-- Patients Table -->
        <v-table class="patients-table" v-if="!loading && patients.length > 0">
          <thead>
            <tr>
              <th class="text-left">Patient ID</th>
              <th class="text-left">Name</th>
              <th class="text-left">Age</th>
              <th class="text-left">Contact</th>
              <th class="text-left">Consent</th>
              <th class="text-left">HIV Status</th>
              <th class="text-left">DLT Status</th>
              <th class="text-left">Enrollment Date</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="patient in paginatedPatients" :key="patient.patient_id" class="patient-row">
              <td>
                <div class="patient-id">{{ patient.patient_id }}</div>
              </td>
              <td>
                <div class="patient-name">{{ patient.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ formatDateOfBirth(patient.date_of_birth) }}</div>
              </td>
              <td>{{ calculateAge(patient.date_of_birth) }}</td>
              <td>
                <div class="contact-info">{{ patient.contact_info || patient.contact || 'N/A' }}</div>
              </td>
              <td>
                <v-chip
                  size="small"
                  :color="patient.consent_status === 'YES' ? 'green' : 'red'"
                  variant="flat"
                >
                  {{ patient.consent_status || (patient.consent ? 'YES' : 'NO') }}
                </v-chip>
              </td>
              <td>
                <v-chip
                  size="small"
                  :color="getHivStatusColor(patient.hiv_status)"
                  variant="flat"
                >
                  {{ patient.hiv_status }}
                </v-chip>
              </td>
              <td>
                <v-chip
                  size="small"
                  :color="getDltStatusColor(patient.dlt_status)"
                  variant="flat"
                  style="cursor: pointer;"
                >
                  <v-icon small left>{{ getDltStatusIcon(patient.dlt_status) }}</v-icon>
                  {{ patient.dlt_status || 'pending' }}
                </v-chip>
              </td>
              <td>{{ formatDate(patient.created_at) }}</td>
              <td>
                <div class="action-buttons">
                  <v-tooltip text="View Details" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        size="small"
                        color="info"
                        class="me-2"
                        @click="viewPatient(patient)"
                      >
                        mdi-eye
                      </v-icon>
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Edit Patient" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        size="small"
                        color="warning"
                        class="me-2"
                        @click="editPatient(patient)"
                      >
                        mdi-pencil
                      </v-icon>
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Delete Patient" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        size="small"
                        color="error"
                        @click="deletePatient(patient)"
                      >
                        mdi-delete
                      </v-icon>
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Empty State -->
        <div v-if="!loading && patients.length === 0" class="text-center py-12">
          <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-account-off</v-icon>
          <div class="text-h6 text-medium-emphasis mb-2">No Patients Found</div>
          <div class="text-body-1 text-medium-emphasis mb-4">
            Get started by enrolling your first patient.
          </div>
          <v-btn color="primary" @click="openEnrollmentDialog">
            <v-icon start>mdi-account-plus</v-icon>
            Enroll First Patient
          </v-btn>
        </div>

        <!-- No Results State -->
        <div v-if="!loading && patients.length > 0 && filteredPatients.length === 0" class="text-center py-8 text-medium-emphasis">
          <v-icon size="64" color="grey-lighten-2" class="mb-2">mdi-account-off</v-icon>
          <div>No patients found matching your criteria.</div>
          <v-btn variant="text" @click="clearFilters" class="mt-2">
            Clear Filters
          </v-btn>
        </div>

        <!-- Pagination -->
        <div class="pagination-section" v-if="pageCount > 1">
          <div class="d-flex justify-space-between align-center">
            <div class="text-caption text-medium-emphasis">
              Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredPatients.length }} patients
            </div>
            <v-pagination
              v-model="page"
              :length="pageCount"
              total-visible="7"
              rounded="circle"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Patient Dialog -->
    <patient-dialog
      v-model="showPatientDialog"
      :patient="selectedPatient"
      :mode="dialogMode"
      @saved="handlePatientSaved"
    />

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { patientsApi, dltApi } from '@/api'
import PatientDialog from '@/components/PatientDialog.vue'

const router = useRouter()

// Reactive state
const search = ref('')
const filters = ref({
  consentStatus: null,
  hivStatus: null,
  dltStatus: null
})
const sortBy = ref('created_at')
const page = ref(1)
const perPage = 10
const loading = ref(false)
const error = ref('')
const patients = ref([])
const stats = ref({
  total: 0,
  consented: 0,
  reactive: 0,
  dlt_verified: 0
})

const showPatientDialog = ref(false)
const selectedPatient = ref(null)
const dialogMode = ref('create') // 'create' or 'edit'

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Options for filters
const consentOptions = [
  { title: 'Consented', value: 'YES' },
  { title: 'Not Consented', value: 'NO' }
]

const hivStatusOptions = [
  { title: 'Reactive', value: 'Reactive' },
  { title: 'Non-Reactive', value: 'Non-Reactive' }
]

const dltStatusOptions = [
  { title: 'Verified', value: 'verified' },
  { title: 'Pending', value: 'pending' },
  { title: 'Failed', value: 'failed' }
]

const sortOptions = [
  { title: 'Newest First', value: 'created_at' },
  { title: 'Oldest First', value: 'created_at_asc' },
  { title: 'Name A-Z', value: 'name' },
  { title: 'Name Z-A', value: 'name_desc' }
]

// Computed properties
const filteredPatients = computed(() => {
  let filtered = patients.value

  // Search filter
  if (search.value) {
    const query = search.value.toLowerCase()
    filtered = filtered.filter(patient =>
      patient.name?.toLowerCase().includes(query) ||
      patient.patient_id?.toLowerCase().includes(query) ||
      (patient.contact_info && patient.contact_info.toLowerCase().includes(query)) ||
      (patient.contact && patient.contact.toLowerCase().includes(query))
    )
  }

  // Consent status filter
  if (filters.value.consentStatus) {
    filtered = filtered.filter(patient => {
      const consentValue = patient.consent_status || (patient.consent ? 'YES' : 'NO')
      return consentValue === filters.value.consentStatus
    })
  }

  // HIV status filter
  if (filters.value.hivStatus) {
    filtered = filtered.filter(patient => patient.hiv_status === filters.value.hivStatus)
  }

  // DLT status filter
  if (filters.value.dltStatus) {
    filtered = filtered.filter(patient => patient.dlt_status === filters.value.dltStatus)
  }

  // Sorting
  filtered = sortPatients(filtered, sortBy.value)

  return filtered
})

const pageCount = computed(() => Math.ceil(filteredPatients.value.length / perPage))
const paginatedPatients = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredPatients.value.slice(start, start + perPage)
})

const paginationStart = computed(() => (page.value - 1) * perPage + 1)
const paginationEnd = computed(() => Math.min(page.value * perPage, filteredPatients.value.length))

// Lifecycle
onMounted(async () => {
  await fetchPatients()
  await fetchStats()
})

// Methods
async function fetchPatients() {
  loading.value = true
  error.value = ''
  try {
    const response = await patientsApi.getAll({
      limit: 1000 // Get all patients for client-side filtering
    })
    
    // Remove duplicate patients (keep the latest one)
    const uniquePatients = response.data.patients.reduce((acc, current) => {
      const existing = acc.find(patient => patient.patient_id === current.patient_id);
      if (!existing) {
        acc.push(current);
      } else {
        // If duplicate found, keep the one with the latest created_at timestamp
        const existingDate = new Date(existing.created_at);
        const currentDate = new Date(current.created_at);
        if (currentDate > existingDate) {
          const index = acc.indexOf(existing);
          acc[index] = current;
        }
      }
      return acc;
    }, []);
    
    patients.value = uniquePatients || [];
    console.log('Patients loaded:', patients.value.length, 'Unique:', uniquePatients.length);
  } catch (err) {
    console.error('Error fetching patients:', err)
    error.value = err.response?.data?.message || 'Failed to load patients'
    patients.value = []
    showSnackbar('Error loading patients', 'error')
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const response = await patientsApi.getStats()
    stats.value = response.data
  } catch (err) {
    console.error('Error fetching stats:', err)
    // Set fallback stats based on loaded patients
    stats.value = {
      total: patients.value.length,
      consented: patients.value.filter(p => p.consent_status === 'YES' || p.consent).length,
      reactive: patients.value.filter(p => p.hiv_status === 'Reactive').length,
      dlt_verified: patients.value.filter(p => p.dlt_status === 'verified').length
    }
  }
}

function sortPatients(patients, sortKey) {
  const sorted = [...patients]
  switch (sortKey) {
    case 'created_at':
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    case 'created_at_asc':
      return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    case 'name':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    case 'name_desc':
      return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
    default:
      return sorted
  }
}

function calculateAge(dateString) {
  if (!dateString) return 'N/A'
  
  const today = new Date()
  const birthDate = new Date(dateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatDateOfBirth(dateString) {
  if (!dateString) return 'N/A'
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getHivStatusColor(status) {
  const colors = {
    'Reactive': 'red',
    'Non-Reactive': 'green'
  }
  return colors[status] || 'grey'
}

function getDltStatusColor(status) {
  const colors = {
    'verified': 'green',
    'pending': 'orange',
    'failed': 'red'
  }
  return colors[status] || 'grey'
}

function getDltStatusIcon(status) {
  const icons = {
    'verified': 'mdi-check-circle',
    'pending': 'mdi-clock',
    'failed': 'mdi-alert-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

function showSnackbar(message, color = 'success') {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

// Event handlers
function handleSearch() {
  page.value = 1 // Reset to first page when searching
}

function handleFilterChange() {
  page.value = 1 // Reset to first page when filtering
}

function handleSortChange() {
  page.value = 1 // Reset to first page when sorting
}

function clearFilters() {
  search.value = ''
  filters.value = {
    consentStatus: null,
    hivStatus: null,
    dltStatus: null
  }
  sortBy.value = 'created_at'
  page.value = 1
}

function openEnrollmentDialog() {
  selectedPatient.value = null
  dialogMode.value = 'create'
  showPatientDialog.value = true
}

function viewPatient(patient) {
  selectedPatient.value = { ...patient }
  dialogMode.value = 'view'
  showPatientDialog.value = true
}

function editPatient(patient) {
  selectedPatient.value = { ...patient }
  dialogMode.value = 'edit'
  showPatientDialog.value = true
}

async function deletePatient(patient) {
  if (confirm(`Are you sure you want to delete patient ${patient.patient_id} (${patient.name})? This action cannot be undone.`)) {
    try {
      loading.value = true
      await patientsApi.delete(patient.patient_id)
      await fetchPatients() // Refresh the list
      await fetchStats() // Refresh stats
      showSnackbar('Patient deleted successfully')
    } catch (err) {
      console.error('Error deleting patient:', err)
      showSnackbar('Failed to delete patient: ' + (err.response?.data?.message || err.message), 'error')
    } finally {
      loading.value = false
    }
  }
}

function exportPatientData() {
  try {
    const dataStr = JSON.stringify(patients.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `patients-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showSnackbar('Patient data exported successfully')
  } catch (err) {
    console.error('Error exporting data:', err)
    showSnackbar('Failed to export patient data', 'error')
  }
}

async function handlePatientSaved() {
  showPatientDialog.value = false
  await fetchPatients() // Refresh the list
  await fetchStats() // Refresh stats
  showSnackbar('Patient saved successfully')
}

// Watch for page changes to reset to first page when data changes
watch([search, filters, sortBy], () => {
  page.value = 1
})
</script>

<style scoped lang="scss">
.patients-page {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stats-row {
  margin-top: 1.5rem;
}

.stat-card {
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
}

.main-card {
  border-radius: 12px;
  overflow: hidden;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.patients-table {
  th {
    background-color: #f5f5f5;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.87);
    border-bottom: 2px solid #e0e0e0;
  }

  td {
    border-bottom: 1px solid #e0e0e0;
    vertical-align: middle;
  }
}

.patient-row {
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
}

.patient-id {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  color: #1976d2;
}

.patient-name {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.contact-info {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  
  .v-icon {
    cursor: pointer;
    transition: color 0.2s ease;
    
    &:hover {
      opacity: 0.8;
    }
  }
}

.pagination-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 960px) {
  .patients-page {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 600px) {
  .filter-section .v-row {
    gap: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>