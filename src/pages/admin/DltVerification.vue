<!-- frontend/src/pages/admin/DltVerification.vue -->
<template>
  <v-container fluid class="pa-6">
    <!-- Page Header -->
    <div class="page-header d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary">DLT Verification</h1>
        <p class="text-body-1 text-medium-emphasis mt-2">
          Verify patient data integrity on the distributed ledger
        </p>
      </div>
      <v-btn 
        color="primary" 
        prepend-icon="mdi-refresh"
        @click="refreshData"
        :loading="loading"
      >
        Refresh
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="primary" size="48" class="mb-2">mdi-shield-check</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.verified }}</div>
            <div class="text-body-2 text-medium-emphasis">Verified</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="warning" size="48" class="mb-2">mdi-clock</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.pending }}</div>
            <div class="text-body-2 text-medium-emphasis">Pending</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="error" size="48" class="mb-2">mdi-alert-circle</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.failed }}</div>
            <div class="text-body-2 text-medium-emphasis">Failed</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="info" size="48" class="mb-2">mdi-database</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.total }}</div>
            <div class="text-body-2 text-medium-emphasis">Total Records</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search and Filters -->
    <v-card elevation="2" class="mb-4" border>
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              density="comfortable"
              variant="outlined"
              placeholder="Search by Patient ID or Name..."
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              density="comfortable"
              variant="outlined"
              :items="statusOptions"
              placeholder="Filter by Status"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="sortBy"
              density="comfortable"
              variant="outlined"
              :items="sortOptions"
              placeholder="Sort by"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2" class="text-right">
            <v-btn
              variant="outlined"
              @click="clearFilters"
              :disabled="!hasActiveFilters"
            >
              Clear
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Main Table -->
    <v-card elevation="2" border>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">DLT Verification Records</span>
        <span class="text-body-2 text-medium-emphasis">
          Showing {{ filteredVerifications.length }} of {{ verifications.length }} records
        </span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="filteredVerifications"
          :loading="loading"
          :search="search"
          :sort-by="[{ key: sortBy, order: 'desc' }]"
          class="elevation-0"
        >
          <!-- Loading State -->
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <!-- Patient ID Column -->
          <template v-slot:item.patientId="{ item }">
            <div class="font-weight-medium text-primary">
              {{ item.patientId }}
            </div>
          </template>

          <!-- Name Column -->
          <template v-slot:item.name="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="primary" class="mr-3">
                <span class="text-caption text-white">
                  {{ getInitials(item.name) }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ calculateAge(item.dateOfBirth) }} years
                </div>
              </div>
            </div>
          </template>

          <!-- Hash Column -->
          <template v-slot:item.hash="{ item }">
            <div class="hash-cell" :title="item.hash">
              {{ truncateHash(item.hash) }}
            </div>
          </template>

          <!-- Timestamp Column -->
          <template v-slot:item.timestamp="{ item }">
            <div class="text-no-wrap">
              {{ formatDate(item.timestamp) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ formatTimeAgo(item.timestamp) }}
            </div>
          </template>

          <!-- Status Column -->
          <template v-slot:item.status="{ item }">
            <v-chip 
              :color="getStatusColor(item.status)" 
              size="small"
              variant="flat"
              :prepend-icon="getStatusIcon(item.status)"
            >
              {{ item.status }}
            </v-chip>
          </template>

          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex gap-2">
              <v-btn
                size="small"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-shield-check"
                @click="verifyHash(item)"
                :loading="item.verifying"
              >
                Verify
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                color="grey"
                icon="mdi-information"
                @click="viewDetails(item)"
              />
            </div>
          </template>

          <!-- Empty State -->
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-database-off</v-icon>
              <div class="text-h6 text-grey">No DLT records found</div>
              <div class="text-body-2 text-grey mt-2">
                {{ hasActiveFilters ? 'Try adjusting your filters' : 'No verification records available' }}
              </div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Verification Dialog -->
    <v-dialog v-model="showVerificationDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Verification Result</span>
          <v-btn icon @click="showVerificationDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="verificationResult" class="text-center">
            <v-icon 
              size="64" 
              :color="verificationResult.success ? 'success' : 'error'"
              class="mb-4"
            >
              {{ verificationResult.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
            </v-icon>
            <div class="text-h6 mb-2">
              {{ verificationResult.success ? 'Verification Successful' : 'Verification Failed' }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ verificationResult.message }}
            </div>
            <v-divider class="my-4" />
            <div class="text-left">
              <div class="text-caption text-medium-emphasis">Patient ID</div>
              <div class="text-body-2 mb-2">{{ verificationResult.patientId }}</div>
              <div class="text-caption text-medium-emphasis">Hash</div>
              <code class="text-body-2 d-block text-truncate">{{ verificationResult.hash }}</code>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn 
            color="primary" 
            @click="showVerificationDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<!-- frontend/src/pages/admin/DltVerification.vue - Updated methods -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { dltApi } from '@/api'

// Reactive state
const loading = ref(false)
const search = ref('')
const statusFilter = ref('')
const sortBy = ref('timestamp')
const verifications = ref([])
const showVerificationDialog = ref(false)
const verificationResult = ref(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Stats
const stats = computed(() => {
  const total = verifications.value.length
  const verified = verifications.value.filter(v => v.verified).length
  const pending = verifications.value.filter(v => !v.verified && v.data_hash).length
  const failed = verifications.value.filter(v => !v.verified && v.data_hash).length

  return { total, verified, pending, failed }
})

// Table headers
const headers = ref([
  { title: 'Patient ID', key: 'patient_id', sortable: true },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Hash', key: 'data_hash', sortable: false },
  { title: 'Timestamp', key: 'timestamp', sortable: true },
  { title: 'Status', key: 'verified', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
])

// Filter and sort options
const statusOptions = [
  { title: 'Verified', value: 'verified' },
  { title: 'Pending', value: 'pending' },
  { title: 'Failed', value: 'failed' }
]

const sortOptions = [
  { title: 'Newest First', value: 'timestamp' },
  { title: 'Oldest First', value: 'timestamp_asc' },
  { title: 'Patient ID', value: 'patient_id' },
  { title: 'Name', value: 'name' },
  { title: 'Status', value: 'verified' }
]

// Computed properties
const filteredVerifications = computed(() => {
  let filtered = verifications.value

  // Status filter
  if (statusFilter.value) {
    if (statusFilter.value === 'verified') {
      filtered = filtered.filter(v => v.verified)
    } else if (statusFilter.value === 'pending' || statusFilter.value === 'failed') {
      filtered = filtered.filter(v => !v.verified && v.data_hash)
    }
  }

  // Search filter
  if (search.value) {
    const query = search.value.toLowerCase()
    filtered = filtered.filter(v => 
      v.patient_id.toLowerCase().includes(query) ||
      (v.name && v.name.toLowerCase().includes(query)) ||
      (v.data_hash && v.data_hash.toLowerCase().includes(query))
    )
  }

  return sortVerifications(filtered, sortBy.value)
})

const hasActiveFilters = computed(() => {
  return search.value || statusFilter.value
})

// Methods
function getStatusColor(verified) {
  return verified ? 'success' : 'error'
}

function getStatusIcon(verified) {
  return verified ? 'mdi-check-circle' : 'mdi-alert-circle'
}

function getStatusText(verified) {
  return verified ? 'Verified' : 'Failed'
}

function truncateHash(hash, length = 16) {
  if (!hash || hash.length <= length) return hash
  return `${hash.substring(0, length)}...`
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatTimeAgo(dateString) {
  if (!dateString) return 'Never'
  const now = new Date()
  const time = new Date(dateString)
  const diffMs = now - time
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

function getInitials(name) {
  if (!name) return 'NA'
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 'N/A'
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function sortVerifications(verifications, sortKey) {
  const sorted = [...verifications]
  switch (sortKey) {
    case 'timestamp':
      return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    case 'timestamp_asc':
      return sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    case 'patient_id':
      return sorted.sort((a, b) => a.patient_id.localeCompare(b.patient_id))
    case 'name':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    case 'verified':
      return sorted.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0))
    default:
      return sorted
  }
}

function clearFilters() {
  search.value = ''
  statusFilter.value = ''
}

function showSnackbar(message, color = 'success') {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

async function verifyHash(verification) {
  verification.verifying = true
  
  try {
    console.log('Verifying DLT hash for:', verification.patient_id)
    
    const response = await dltApi.verify(verification.patient_id)
    
    verificationResult.value = {
      success: response.data.is_verified,
      message: response.data.is_verified 
        ? 'Data integrity verified on distributed ledger' 
        : 'Data integrity verification failed',
      patientId: verification.patient_id,
      hash: response.data.current_hash
    }
    
    showVerificationDialog.value = true
    
    // Update the verification status locally
    verification.verified = response.data.is_verified
    
    showSnackbar(
      response.data.is_verified ? 'Verification successful' : 'Verification failed',
      response.data.is_verified ? 'success' : 'error'
    )
    
  } catch (error) {
    console.error('Verification error:', error)
    showSnackbar('Verification failed: ' + (error.response?.data?.message || error.message), 'error')
  } finally {
    verification.verifying = false
  }
}

function viewDetails(verification) {
  console.log('View details for:', verification)
  // You can implement a detailed view modal here
}

async function refreshData() {
  loading.value = true
  try {
    // Fetch actual data from API
    const response = await dltApi.getHashes()
    verifications.value = response.data.hashes || []
    
    showSnackbar('Data refreshed successfully')
  } catch (error) {
    console.error('Error refreshing data:', error)
    showSnackbar('Failed to refresh data', 'error')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.page-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 16px;
}

.hash-cell {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px 8px;
  border-radius: 4px;
  word-break: break-all;
}

.gap-2 {
  gap: 8px;
}

:deep(.v-data-table-header) {
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.v-data-table .v-table__wrapper > table > thead > tr > th) {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}
</style>