<!-- frontend/src/pages/admin/BiometricManagement.vue -->
<template>
  <v-container fluid class="pa-6">
    <!-- Page Header -->
    <div class="page-header d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary">Biometric Management</h1>
        <p class="text-body-1 text-medium-emphasis mt-2">
          Manage patient biometric associations and identity verification
        </p>
      </div>
      <v-btn 
        color="primary" 
        prepend-icon="mdi-fingerprint-plus"
        @click="showAddDialog = true"
      >
        Add Biometric
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="primary" size="48" class="mb-2">mdi-fingerprint</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.total }}</div>
            <div class="text-body-2 text-medium-emphasis">Total Links</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="success" size="48" class="mb-2">mdi-check-circle</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.active }}</div>
            <div class="text-body-2 text-medium-emphasis">Active</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="warning" size="48" class="mb-2">mdi-account-clock</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.pending }}</div>
            <div class="text-body-2 text-medium-emphasis">Pending</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="info" size="48" class="mb-2">mdi-trending-up</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.today }}</div>
            <div class="text-body-2 text-medium-emphasis">Today</div>
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
              placeholder="Search by Patient ID, Name, or Biometric ID..."
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
              v-model="typeFilter"
              density="comfortable"
              variant="outlined"
              :items="typeOptions"
              placeholder="Filter by Type"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="2" class="text-right">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-filter-remove"
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
        <span class="text-h6">Biometric Links</span>
        <div class="d-flex align-center gap-2">
          <v-btn
            variant="outlined"
            prepend-icon="mdi-refresh"
            @click="refreshData"
            :loading="loading"
            size="small"
          >
            Refresh
          </v-btn>
          <span class="text-body-2 text-medium-emphasis">
            Showing {{ filteredLinks.length }} of {{ biometricLinks.length }} links
          </span>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="filteredLinks"
          :loading="loading"
          :search="search"
          :sort-by="[{ key: sortBy, order: 'desc' }]"
          class="elevation-0"
        >
          <!-- Loading State -->
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <!-- Biometric ID Column -->
          <template v-slot:item.biometricId="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="deep-purple" class="mr-3">
                <v-icon size="18" color="white">mdi-fingerprint</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium text-primary">{{ item.biometricId }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.biometricType }}
                </div>
              </div>
            </div>
          </template>

          <!-- Patient Info Column -->
          <template v-slot:item.patientInfo="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="primary" class="mr-3">
                <span class="text-caption text-white">
                  {{ getInitials(item.patientName) }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.patientName }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.patientId }}
                </div>
              </div>
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

          <!-- Linked Date Column -->
          <template v-slot:item.linkedDate="{ item }">
            <div class="text-no-wrap">
              {{ formatDate(item.linkedDate) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ formatTimeAgo(item.linkedDate) }}
            </div>
          </template>

          <!-- Last Verified Column -->
          <template v-slot:item.lastVerified="{ item }">
            <div v-if="item.lastVerified" class="text-no-wrap">
              {{ formatDate(item.lastVerified) }}
            </div>
            <div v-else class="text-caption text-medium-emphasis">
              Never
            </div>
          </template>

          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex gap-2">
              <v-btn
                size="small"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-shield-check"
                @click="verifyBiometric(item)"
                :loading="item.verifying"
              >
                Verify
              </v-btn>
              <v-btn
                size="small"
                variant="outlined"
                color="error"
                prepend-icon="mdi-link-off"
                @click="unlinkBiometric(item)"
                :loading="item.unlinking"
              >
                Unlink
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
              <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-fingerprint-off</v-icon>
              <div class="text-h6 text-grey">No biometric links found</div>
              <div class="text-body-2 text-grey mt-2">
                {{ hasActiveFilters ? 'Try adjusting your filters' : 'No biometric associations available' }}
              </div>
              <v-btn 
                color="primary" 
                class="mt-4"
                @click="showAddDialog = true"
              >
                <v-icon start>mdi-fingerprint-plus</v-icon>
                Add First Biometric Link
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Add Biometric Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Add Biometric Link</span>
          <v-btn icon @click="closeAddDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="addForm" v-model="valid" @submit.prevent="addBiometricLink">
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  v-model="newLink.patientId"
                  :items="patients"
                  item-title="name"
                  item-value="patient_id"
                  label="Select Patient *"
                  variant="outlined"
                  density="comfortable"
                  :rules="[requiredRule]"
                  placeholder="Search for patient..."
                  prepend-inner-icon="mdi-account-search"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:title>
                        <div class="font-weight-medium">{{ item.raw.name }}</div>
                      </template>
                      <template v-slot:subtitle>
                        <div class="text-caption">{{ item.raw.patient_id }} \u2022 {{ item.raw.hiv_status }}</div>
                      </template>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="newLink.biometricType"
                  :items="biometricTypes"
                  label="Biometric Type *"
                  variant="outlined"
                  density="comfortable"
                  :rules="[requiredRule]"
                  prepend-inner-icon="mdi-fingerprint"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newLink.biometricData"
                  label="Biometric Data *"
                  variant="outlined"
                  density="comfortable"
                  :rules="[requiredRule]"
                  placeholder="Enter biometric data or scan..."
                  :append-inner-icon="newLink.biometricType === 'fingerprint' ? 'mdi-fingerprint' : 'mdi-face-recognition'"
                />
              </v-col>

              <v-col cols="12">
                <v-alert type="info" variant="tonal" density="compact">
                  <div class="d-flex align-center">
                    <v-icon class="me-2">mdi-information</v-icon>
                    <span>
                      <strong>Security Note:</strong> Biometric data will be hashed and stored securely. 
                      The original biometric data is never stored in plain text.
                    </span>
                  </div>
                </v-alert>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="closeAddDialog" :disabled="adding">
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            @click="addBiometricLink" 
            :loading="adding"
            :disabled="!valid || adding"
            prepend-icon="mdi-link-plus"
          >
            Create Link
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Verification Dialog -->
    <v-dialog v-model="showVerificationDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Biometric Verification</span>
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
            <div class="text-body-2 text-medium-emphasis mb-4">
              {{ verificationResult.message }}
            </div>
            <v-divider class="my-4" />
            <div class="text-left">
              <div class="text-caption text-medium-emphasis">Patient</div>
              <div class="text-body-2 mb-2">{{ verificationResult.patientName }} ({{ verificationResult.patientId }})</div>
              <div class="text-caption text-medium-emphasis">Biometric ID</div>
              <div class="text-body-2">{{ verificationResult.biometricId }}</div>
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { biometricApi, patientsApi } from '@/api'

// Reactive state
const loading = ref(false)
const adding = ref(false)
const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const sortBy = ref('linkedDate')
const biometricLinks = ref([])
const patients = ref([])
const showAddDialog = ref(false)
const showVerificationDialog = ref(false)
const verificationResult = ref(null)
const valid = ref(false)
const addForm = ref(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const newLink = ref({
  patientId: '',
  biometricType: 'fingerprint',
  biometricData: ''
})

// Stats
const stats = computed(() => {
  const total = biometricLinks.value.length
  const active = biometricLinks.value.filter(l => l.status === 'active').length
  const pending = biometricLinks.value.filter(l => l.status === 'pending').length
  const today = biometricLinks.value.filter(l => {
    const linkDate = new Date(l.linkedDate)
    const today = new Date()
    return linkDate.toDateString() === today.toDateString()
  }).length

  return { total, active, pending, today }
})

// Table headers
const headers = ref([
  { title: 'Biometric ID', key: 'biometricId', sortable: true },
  { title: 'Patient Information', key: 'patientInfo', sortable: true },
  { title: 'Type', key: 'biometricType', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Linked Date', key: 'linkedDate', sortable: true },
  { title: 'Last Verified', key: 'lastVerified', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
])

// Filter and sort options
const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
  { title: 'Pending', value: 'pending' },
  { title: 'Expired', value: 'expired' }
]

const typeOptions = [
  { title: 'Fingerprint', value: 'fingerprint' },
  { title: 'Facial Recognition', value: 'facial' },
  { title: 'Iris Scan', value: 'iris' },
  { title: 'Voice Print', value: 'voice' }
]

const biometricTypes = [
  { title: 'Fingerprint', value: 'fingerprint' },
  { title: 'Facial Recognition', value: 'facial' },
  { title: 'Iris Scan', value: 'iris' },
  { title: 'Voice Print', value: 'voice' }
]

const sortOptions = [
  { title: 'Newest First', value: 'linkedDate' },
  { title: 'Oldest First', value: 'linkedDate_asc' },
  { title: 'Patient Name', value: 'patientName' },
  { title: 'Biometric ID', value: 'biometricId' },
  { title: 'Status', value: 'status' }
]

// Computed properties
const filteredLinks = computed(() => {
  let filtered = biometricLinks.value

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(l => l.status === statusFilter.value)
  }

  // Type filter
  if (typeFilter.value) {
    filtered = filtered.filter(l => l.biometricType === typeFilter.value)
  }

  // Search filter
  if (search.value) {
    const query = search.value.toLowerCase()
    filtered = filtered.filter(l => 
      l.patientId.toLowerCase().includes(query) ||
      l.patientName.toLowerCase().includes(query) ||
      l.biometricId.toLowerCase().includes(query)
    )
  }

  // Sorting
  return sortLinks(filtered, sortBy.value)
})

const hasActiveFilters = computed(() => {
  return search.value || statusFilter.value || typeFilter.value
})

// Methods
function getStatusColor(status) {
  const colors = {
    'active': 'success',
    'inactive': 'error',
    'pending': 'warning',
    'expired': 'grey'
  }
  return colors[status] || 'grey'
}

function getStatusIcon(status) {
  const icons = {
    'active': 'mdi-check-circle',
    'inactive': 'mdi-close-circle',
    'pending': 'mdi-clock',
    'expired': 'mdi-alert-circle'
  }
  return icons[status] || 'mdi-help-circle'
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
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

function sortLinks(links, sortKey) {
  const sorted = [...links]
  switch (sortKey) {
    case 'linkedDate':
      return sorted.sort((a, b) => new Date(b.linkedDate) - new Date(a.linkedDate))
    case 'linkedDate_asc':
      return sorted.sort((a, b) => new Date(a.linkedDate) - new Date(b.linkedDate))
    case 'patientName':
      return sorted.sort((a, b) => a.patientName.localeCompare(b.patientName))
    case 'biometricId':
      return sorted.sort((a, b) => a.biometricId.localeCompare(b.biometricId))
    case 'status':
      return sorted.sort((a, b) => a.status.localeCompare(b.status))
    default:
      return sorted
  }
}

function clearFilters() {
  search.value = ''
  statusFilter.value = ''
  typeFilter.value = ''
}

function closeAddDialog() {
  showAddDialog.value = false
  newLink.value = {
    patientId: '',
    biometricType: 'fingerprint',
    biometricData: ''
  }
  if (addForm.value) {
    addForm.value.reset()
  }
}

// Validation rules
const requiredRule = value => !!value || 'This field is required'

function showSnackbar(message, color = 'success') {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

async function addBiometricLink() {
  if (!addForm.value?.validate()) return

  adding.value = true
  try {
    // Replace with actual API call
    // const response = await biometricApi.link(newLink.value)
    
    // Mock success response
    const newBiometricLink = {
      id: Date.now(),
      biometricId: `BIO-${Date.now()}`,
      patientId: newLink.value.patientId,
      patientName: patients.value.find(p => p.patient_id === newLink.value.patientId)?.name || 'Unknown',
      biometricType: newLink.value.biometricType,
      status: 'active',
      linkedDate: new Date().toISOString(),
      lastVerified: null
    }

    biometricLinks.value.unshift(newBiometricLink)
    
    showAddDialog.value = false
    showSnackbar('Biometric link created successfully')
    
  } catch (error) {
    console.error('Error creating biometric link:', error)
    showSnackbar('Failed to create biometric link: ' + (error.response?.data?.message || error.message), 'error')
  } finally {
    adding.value = false
  }
}

async function verifyBiometric(link) {
  link.verifying = true
  
  try {
    console.log('Verifying biometric for:', link.biometricId)
    
    // Replace with actual API call
    // const response = await biometricApi.verify(link.biometricId)
    
    // Mock verification
    const success = Math.random() > 0.2 // 80% success rate for demo
    
    verificationResult.value = {
      success,
      message: success 
        ? 'Biometric identity verified successfully' 
        : 'Biometric verification failed',
      patientName: link.patientName,
      patientId: link.patientId,
      biometricId: link.biometricId
    }
    
    showVerificationDialog.value = true
    
    // Update last verified timestamp
    link.lastVerified = new Date().toISOString()
    
    showSnackbar(
      success ? 'Biometric verified successfully' : 'Biometric verification failed',
      success ? 'success' : 'error'
    )
    
  } catch (error) {
    console.error('Verification error:', error)
    showSnackbar('Verification failed: ' + (error.response?.data?.message || error.message), 'error')
  } finally {
    link.verifying = false
  }
}

async function unlinkBiometric(link) {
  if (!confirm(`Are you sure you want to unlink biometric ${link.biometricId} from patient ${link.patientName}?`)) {
    return
  }

  link.unlinking = true
  
  try {
    console.log('Unlinking biometric:', link.biometricId)
    
    // Replace with actual API call
    // await biometricApi.unlink(link.biometricId)
    
    // Update status to inactive
    link.status = 'inactive'
    
    showSnackbar('Biometric link removed successfully')
    
  } catch (error) {
    console.error('Error unlinking biometric:', error)
    showSnackbar('Failed to unlink biometric: ' + (error.response?.data?.message || error.message), 'error')
  } finally {
    link.unlinking = false
  }
}

function viewDetails(link) {
  console.log('View details for:', link)
  // You can implement a detailed view modal here
}

async function refreshData() {
  loading.value = true
  try {
    // Fetch patients for the dropdown
    const patientsResponse = await patientsApi.getAll({ limit: 1000 })
    patients.value = patientsResponse.data.patients || []

    // Fetch actual biometric links from your API
    // const response = await biometricApi.getLinks()
    // biometricLinks.value = response.data.biometric_links
    
    // Mock data for demonstration
    biometricLinks.value = [
      {
        id: 1,
        biometricId: 'BIO-1764145038945',
        patientId: 'HIV-1764145038945-9769',
        patientName: 'John Doe',
        biometricType: 'fingerprint',
        status: 'active',
        linkedDate: '2024-01-15T10:30:00Z',
        lastVerified: '2024-01-20T14:25:00Z'
      },
      {
        id: 2,
        biometricId: 'BIO-1764145038946',
        patientId: 'HIV-1764145038946-1234',
        patientName: 'Jane Smith',
        biometricType: 'facial',
        status: 'active',
        linkedDate: '2024-01-14T14:20:00Z',
        lastVerified: null
      },
      {
        id: 3,
        biometricId: 'BIO-1764145038947',
        patientId: 'HIV-1764145038947-5678',
        patientName: 'Bob Johnson',
        biometricType: 'fingerprint',
        status: 'pending',
        linkedDate: '2024-01-13T09:15:00Z',
        lastVerified: '2024-01-13T09:20:00Z'
      }
    ]
    
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

:deep(.v-autocomplete .v-field__input) {
  min-height: 56px;
}
</style>