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
          >
            New Enrollment
          </v-btn>
          <v-btn
            variant="outlined"
            size="large"
            class="px-4"
            prepend-icon="mdi-download"
            @click="exportPatientData"
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
              <div class="stat-value text-primary">{{ stats.totalPatients }}</div>
              <div class="stat-label">Total Patients</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="2">
            <v-card-text class="text-center">
              <div class="stat-value text-success">{{ stats.consentedPatients }}</div>
              <div class="stat-label">Consented</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="2">
            <v-card-text class="text-center">
              <div class="stat-value text-warning">{{ stats.reactivePatients }}</div>
              <div class="stat-label">Reactive Status</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="2">
            <v-card-text class="text-center">
              <div class="stat-value text-info">{{ stats.verifiedPatients }}</div>
              <div class="stat-label">DLT Verified</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

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
              />
            </v-col>
          </v-row>
        </div>

        <!-- Loading State -->
        <v-overlay :model-value="loading" contained class="align-center justify-center">
          <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        </v-overlay>

        <!-- Patients Table -->
        <v-table class="patients-table" v-if="!loading">
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
                <div class="contact-info">{{ patient.contact_info || 'N/A' }}</div>
              </td>
              <td>
                <v-chip
                  size="small"
                  :color="patient.consent_status === 'YES' ? 'green' : 'red'"
                  variant="flat"
                >
                  {{ patient.consent_status }}
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
                  @click="verifyDltIntegrity(patient)"
                  style="cursor: pointer;"
                >
                  <v-icon small left>{{ getDltStatusIcon(patient.dlt_status) }}</v-icon>
                  {{ patient.dlt_status || 'Not Verified' }}
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

                  <v-tooltip text="Verify DLT Integrity" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        size="small"
                        color="primary"
                        class="me-2"
                        @click="verifyDltIntegrity(patient)"
                      >
                        mdi-shield-check
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

            <tr v-if="!filteredPatients.length">
              <td colspan="9" class="text-center py-8 text-medium-emphasis">
                <v-icon size="64" color="grey-lighten-2" class="mb-2">mdi-account-off</v-icon>
                <div>No patients found matching your criteria.</div>
              </td>
            </tr>
          </tbody>
        </v-table>

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

    <!-- DLT Verification Dialog -->
    <dlt-verification-dialog
      v-model="showDltDialog"
      :patient="selectedPatient"
      @verified="handleDltVerified"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePatientStore } from '@/stores/patient'
import PatientDialog from '@/components/PatientDialog.vue'
import DltVerificationDialog from '@/components/DltVerificationDialog.vue'

const patientStore = usePatientStore()

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

const showPatientDialog = ref(false)
const showDltDialog = ref(false)
const selectedPatient = ref(null)
const dialogMode = ref('create') // 'create' or 'edit'

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
const loading = computed(() => patientStore.loading)
const patients = computed(() => patientStore.patients)

const stats = computed(() => ({
  totalPatients: patients.value.length,
  consentedPatients: patients.value.filter(p => p.consent_status === 'YES').length,
  reactivePatients: patients.value.filter(p => p.hiv_status === 'Reactive').length,
  verifiedPatients: patients.value.filter(p => p.dlt_status === 'verified').length
}))

const filteredPatients = computed(() => {
  let filtered = patients.value

  // Search filter
  if (search.value) {
    const query = search.value.toLowerCase()
    filtered = filtered.filter(patient =>
      patient.name.toLowerCase().includes(query) ||
      patient.patient_id.toLowerCase().includes(query) ||
      (patient.contact_info && patient.contact_info.toLowerCase().includes(query))
    )
  }

  // Consent status filter
  if (filters.value.consentStatus) {
    filtered = filtered.filter(patient => patient.consent_status === filters.value.consentStatus)
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
  await patientStore.fetchPatients()
})

// Methods
function sortPatients(patients, sortKey) {
  const sorted = [...patients]
  switch (sortKey) {
    case 'created_at':
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    case 'created_at_asc':
      return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'name_desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    default:
      return sorted
  }
}

function calculateAge(dateString) {
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
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatDateOfBirth(dateString) {
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

// Action handlers
function openEnrollmentDialog() {
  selectedPatient.value = null
  dialogMode.value = 'create'
  showPatientDialog.value = true
}

function viewPatient(patient) {
  // Navigate to patient details page or open view dialog
  console.log('View patient:', patient)
  // router.push(`/admin/patients/${patient.patient_id}`)
}

function editPatient(patient) {
  selectedPatient.value = { ...patient }
  dialogMode.value = 'edit'
  showPatientDialog.value = true
}

async function verifyDltIntegrity(patient) {
  selectedPatient.value = patient
  showDltDialog.value = true
}

async function deletePatient(patient) {
  if (confirm(`Are you sure you want to delete patient ${patient.patient_id} (${patient.name})?`)) {
    await patientStore.deletePatient(patient.patient_id)
  }
}

function exportPatientData() {
  // Implement export functionality
  console.log('Export patient data')
}

function handlePatientSaved() {
  showPatientDialog.value = false
  patientStore.fetchPatients() // Refresh the list
}

function handleDltVerified() {
  showDltDialog.value = false
  patientStore.fetchPatients() // Refresh to update DLT status
}
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