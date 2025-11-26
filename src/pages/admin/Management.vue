<!-- frontend/src/pages/admin/AdminManagement.vue -->
<template>
  <v-container fluid class="pa-6">
    <!-- Page Header -->
    <div class="page-header d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary">Admin Management</h1>
        <p class="text-body-1 text-medium-emphasis mt-2">
          Manage system administrators and user permissions
        </p>
      </div>
      <v-btn 
        color="primary" 
        prepend-icon="mdi-account-plus"
        @click="showAddDialog = true"
      >
        Add Admin
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="primary" size="48" class="mb-2">mdi-account-group</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.total }}</div>
            <div class="text-body-2 text-medium-emphasis">Total Admins</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="success" size="48" class="mb-2">mdi-shield-check</v-icon>
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
            <v-icon color="info" size="48" class="mb-2">mdi-security</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.superAdmins }}</div>
            <div class="text-body-2 text-medium-emphasis">Super Admins</div>
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
              placeholder="Search by name, email, or username..."
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="roleFilter"
              density="comfortable"
              variant="outlined"
              :items="roleOptions"
              placeholder="Filter by Role"
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
        <span class="text-h6">Administrators</span>
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
            Showing {{ filteredAdmins.length }} of {{ admins.length }} administrators
          </span>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="filteredAdmins"
          :loading="loading"
          :search="search"
          :sort-by="[{ key: sortBy, order: 'desc' }]"
          class="elevation-0"
        >
          <!-- Loading State -->
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <!-- Admin Info Column -->
          <template v-slot:item.adminInfo="{ item }">
            <div class="d-flex align-center">
              <v-avatar 
                :color="getRoleColor(item.role)" 
                size="40" 
                class="mr-3"
              >
                <v-icon v-if="item.role === 'super_admin'" color="white">mdi-security</v-icon>
                <span v-else class="text-caption text-white">
                  {{ getInitials(item.name) }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.email }}
                </div>
              </div>
            </div>
          </template>

          <!-- Role Column -->
          <template v-slot:item.role="{ item }">
            <v-chip 
              :color="getRoleColor(item.role)" 
              size="small"
              variant="flat"
              :prepend-icon="getRoleIcon(item.role)"
            >
              {{ formatRole(item.role) }}
            </v-chip>
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

          <!-- Last Login Column -->
          <template v-slot:item.lastLogin="{ item }">
            <div v-if="item.lastLogin" class="text-no-wrap">
              {{ formatDate(item.lastLogin) }}
            </div>
            <div v-else class="text-caption text-medium-emphasis">
              Never
            </div>
            <div v-if="item.lastLogin" class="text-caption text-medium-emphasis">
              {{ formatTimeAgo(item.lastLogin) }}
            </div>
          </template>

          <!-- Created Date Column -->
          <template v-slot:item.createdAt="{ item }">
            <div class="text-no-wrap">
              {{ formatDate(item.createdAt) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ formatTimeAgo(item.createdAt) }}
            </div>
          </template>

          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex gap-2">
              <v-btn
                size="small"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-pencil"
                @click="editAdmin(item)"
                :disabled="item.role === 'super_admin' && currentUser.role !== 'super_admin'"
              >
                Edit
              </v-btn>
              <v-btn
                size="small"
                variant="outlined"
                :color="item.status === 'active' ? 'warning' : 'success'"
                :prepend-icon="item.status === 'active' ? 'mdi-account-cancel' : 'mdi-account-check'"
                @click="toggleAdminStatus(item)"
                :disabled="item.id === currentUser.id || (item.role === 'super_admin' && currentUser.role !== 'super_admin')"
                :loading="item.togglingStatus"
              >
                {{ item.status === 'active' ? 'Deactivate' : 'Activate' }}
              </v-btn>
              <v-btn
                size="small"
                variant="outlined"
                color="error"
                prepend-icon="mdi-delete"
                @click="deleteAdmin(item)"
                :disabled="item.id === currentUser.id || (item.role === 'super_admin' && currentUser.role !== 'super_admin')"
                :loading="item.deleting"
              >
                Delete
              </v-btn>
            </div>
          </template>

          <!-- Empty State -->
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-account-group-off</v-icon>
              <div class="text-h6 text-grey">No administrators found</div>
              <div class="text-body-2 text-grey mt-2">
                {{ hasActiveFilters ? 'Try adjusting your filters' : 'No administrators configured' }}
              </div>
              <v-btn 
                color="primary" 
                class="mt-4"
                @click="showAddDialog = true"
              >
                <v-icon start>mdi-account-plus</v-icon>
                Add First Administrator
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Admin Dialog -->
    <v-dialog v-model="showAdminDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ isEditMode ? 'Edit Administrator' : 'Add Administrator' }}</span>
          <v-btn icon @click="closeAdminDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="adminForm" v-model="valid" @submit.prevent="saveAdmin">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="adminForm.name"
                  label="Full Name *"
                  variant="outlined"
                  density="comfortable"
                  :rules="[requiredRule]"
                  prepend-inner-icon="mdi-account"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="adminForm.username"
                  label="Username *"
                  variant="outlined"
                  density="comfortable"
                  :rules="[requiredRule, usernameRule]"
                  prepend-inner-icon="mdi-at"
                  :disabled="isEditMode"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="adminForm.email"
                  label="Email Address *"
                  variant="outlined"
                  density="comfortable"
                  :rules="[requiredRule, emailRule]"
                  prepend-inner-icon="mdi-email"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="adminForm.phone"
                  label="Phone Number"
                  variant="outlined"
                  density="comfortable"
                  :rules="[phoneRule]"
                  prepend-inner-icon="mdi-phone"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="adminForm.role"
                  :items="roleOptions"
                  label="Role *"
                  variant="outlined"
                  density="comfortable"
                  :rules="[requiredRule]"
                  prepend-inner-icon="mdi-security"
                  :disabled="currentUser.role !== 'super_admin'"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="adminForm.department"
                  :items="departmentOptions"
                  label="Department"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-office-building"
                />
              </v-col>

              <v-col cols="12" v-if="!isEditMode">
                <v-text-field
                  v-model="adminForm.password"
                  label="Password *"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[requiredRule, passwordRule]"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                />
              </v-col>

              <v-col cols="12" v-if="!isEditMode">
                <v-text-field
                  v-model="adminForm.confirmPassword"
                  label="Confirm Password *"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  variant="outlined"
                  density="comfortable"
                  :rules="[requiredRule, confirmPasswordRule]"
                  prepend-inner-icon="mdi-lock-check"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                />
              </v-col>

              <v-col cols="12">
                <v-alert 
                  :type="isEditMode ? 'info' : 'success'" 
                  variant="tonal" 
                  density="compact"
                >
                  <div class="d-flex align-center">
                    <v-icon class="me-2">{{ isEditMode ? 'mdi-information' : 'mdi-shield-check' }}</v-icon>
                    <span>
                      <strong>{{ isEditMode ? 'Security Update:' : 'Complete Admin Setup:' }}</strong> 
                      {{ isEditMode 
                        ? 'Changes will update admin permissions and access rights.'
                        : 'New administrator will receive system access with specified role permissions.'
                      }}
                    </span>
                  </div>
                </v-alert>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="closeAdminDialog" :disabled="saving">
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            @click="saveAdmin" 
            :loading="saving"
            :disabled="!valid || saving"
            prepend-icon="mdi-content-save"
          >
            {{ isEditMode ? 'Update' : 'Create' }} Admin
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Permissions Dialog -->
    <v-dialog v-model="showPermissionsDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Admin Permissions</span>
          <v-btn icon @click="showPermissionsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="selectedAdmin" class="text-center">
            <v-avatar color="primary" size="64" class="mb-4">
              <v-icon v-if="selectedAdmin.role === 'super_admin'" color="white" size="32">mdi-security</v-icon>
              <span v-else class="text-h6 text-white">{{ getInitials(selectedAdmin.name) }}</span>
            </v-avatar>
            <div class="text-h6 mb-2">{{ selectedAdmin.name }}</div>
            <div class="text-body-2 text-medium-emphasis mb-4">{{ selectedAdmin.email }}</div>
            
            <v-divider class="my-4" />
            
            <div class="text-left">
              <div class="text-subtitle-2 mb-2">Role Permissions:</div>
              <v-list density="compact">
                <v-list-item
                  v-for="permission in getRolePermissions(selectedAdmin.role)"
                  :key="permission"
                >
                  <template v-slot:prepend>
                    <v-icon color="success" size="20">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ permission }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="showPermissionsDialog = false">
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
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Reactive state
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const sortBy = ref('createdAt')
const admins = ref([])
const showAdminDialog = ref(false)
const showPermissionsDialog = ref(false)
const isEditMode = ref(false)
const valid = ref(false)
const selectedAdmin = ref(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const adminForm = ref({
  id: null,
  name: '',
  username: '',
  email: '',
  phone: '',
  role: 'admin',
  department: '',
  password: '',
  confirmPassword: ''
})

// Current user (from auth store)
const currentUser = computed(() => authStore.user || { id: 1, role: 'super_admin' })

// Stats
const stats = computed(() => {
  const total = admins.value.length
  const active = admins.value.filter(a => a.status === 'active').length
  const pending = admins.value.filter(a => a.status === 'pending').length
  const superAdmins = admins.value.filter(a => a.role === 'super_admin').length

  return { total, active, pending, superAdmins }
})

// Table headers
const headers = ref([
  { title: 'Administrator', key: 'adminInfo', sortable: true },
  { title: 'Username', key: 'username', sortable: true },
  { title: 'Role', key: 'role', sortable: true },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Last Login', key: 'lastLogin', sortable: true },
  { title: 'Created', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
])

// Filter and sort options
const roleOptions = [
  { title: 'Super Admin', value: 'super_admin' },
  { title: 'Admin', value: 'admin' },
  { title: 'Operator', value: 'operator' },
  { title: 'Viewer', value: 'viewer' }
]

const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
  { title: 'Pending', value: 'pending' },
  { title: 'Suspended', value: 'suspended' }
]

const departmentOptions = [
  'Clinical Services',
  'Laboratory',
  'Pharmacy',
  'Administration',
  'IT Support',
  'Quality Assurance',
  'Research'
]

const sortOptions = [
  { title: 'Newest First', value: 'createdAt' },
  { title: 'Oldest First', value: 'createdAt_asc' },
  { title: 'Name A-Z', value: 'name' },
  { title: 'Name Z-A', value: 'name_desc' },
  { title: 'Role', value: 'role' },
  { title: 'Last Login', value: 'lastLogin' }
]

// Computed properties
const filteredAdmins = computed(() => {
  let filtered = admins.value

  // Role filter
  if (roleFilter.value) {
    filtered = filtered.filter(a => a.role === roleFilter.value)
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(a => a.status === statusFilter.value)
  }

  // Search filter
  if (search.value) {
    const query = search.value.toLowerCase()
    filtered = filtered.filter(a => 
      a.name.toLowerCase().includes(query) ||
      a.email.toLowerCase().includes(query) ||
      a.username.toLowerCase().includes(query) ||
      a.department.toLowerCase().includes(query)
    )
  }

  // Sorting
  return sortAdmins(filtered, sortBy.value)
})

const hasActiveFilters = computed(() => {
  return search.value || roleFilter.value || statusFilter.value
})

// Methods
function getRoleColor(role) {
  const colors = {
    'super_admin': 'deep-purple',
    'admin': 'primary',
    'operator': 'teal',
    'viewer': 'grey'
  }
  return colors[role] || 'grey'
}

function getRoleIcon(role) {
  const icons = {
    'super_admin': 'mdi-security',
    'admin': 'mdi-account-cog',
    'operator': 'mdi-account-hard-hat',
    'viewer': 'mdi-account-eye'
  }
  return icons[role] || 'mdi-account'
}

function getStatusColor(status) {
  const colors = {
    'active': 'success',
    'inactive': 'error',
    'pending': 'warning',
    'suspended': 'grey'
  }
  return colors[status] || 'grey'
}

function getStatusIcon(status) {
  const icons = {
    'active': 'mdi-check-circle',
    'inactive': 'mdi-close-circle',
    'pending': 'mdi-clock',
    'suspended': 'mdi-pause-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

function formatRole(role) {
  const roles = {
    'super_admin': 'Super Admin',
    'admin': 'Admin',
    'operator': 'Operator',
    'viewer': 'Viewer'
  }
  return roles[role] || role
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

function getRolePermissions(role) {
  const permissions = {
    'super_admin': [
      'Full system access',
      'User management',
      'System configuration',
      'Audit logs access',
      'Data export permissions'
    ],
    'admin': [
      'Patient management',
      'DLT verification',
      'Biometric management',
      'Limited user management',
      'Reports access'
    ],
    'operator': [
      'Patient enrollment',
      'Basic data entry',
      'Limited patient viewing',
      'No user management'
    ],
    'viewer': [
      'Read-only access',
      'Patient data viewing',
      'Report viewing',
      'No modifications'
    ]
  }
  return permissions[role] || []
}

function sortAdmins(admins, sortKey) {
  const sorted = [...admins]
  switch (sortKey) {
    case 'createdAt':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'createdAt_asc':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'name_desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    case 'role':
      return sorted.sort((a, b) => a.role.localeCompare(b.role))
    case 'lastLogin':
      return sorted.sort((a, b) => new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0))
    default:
      return sorted
  }
}

function clearFilters() {
  search.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
}

function closeAdminDialog() {
  showAdminDialog.value = false
  isEditMode.value = false
  adminForm.value = {
    id: null,
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'admin',
    department: '',
    password: '',
    confirmPassword: ''
  }
  showPassword.value = false
  showConfirmPassword.value = false
  if (adminForm.value) {
    adminForm.value.reset()
  }
}

// Validation rules
const requiredRule = value => !!value || 'This field is required'
const emailRule = value => /.+@.+\..+/.test(value) || 'Valid email is required'
const usernameRule = value => /^[a-zA-Z0-9_]+$/.test(value) || 'Username can only contain letters, numbers, and underscores'
const phoneRule = value => !value || /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')) || 'Valid phone number is required'
const passwordRule = value => value.length >= 8 || 'Password must be at least 8 characters'
const confirmPasswordRule = value => value === adminForm.value.password || 'Passwords must match'

function showSnackbar(message, color = 'success') {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

function editAdmin(admin) {
  selectedAdmin.value = admin
  adminForm.value = { ...admin }
  isEditMode.value = true
  showAdminDialog.value = true
}

function addAdmin() {
  selectedAdmin.value = null
  isEditMode.value = false
  showAdminDialog.value = true
}

async function saveAdmin() {
  if (!adminForm.value?.validate()) return

  saving.value = true
  try {
    if (isEditMode.value) {
      // Update existing admin
      const index = admins.value.findIndex(a => a.id === adminForm.value.id)
      if (index !== -1) {
        admins.value[index] = { ...admins.value[index], ...adminForm.value }
      }
      showSnackbar('Administrator updated successfully')
    } else {
      // Create new admin
      const newAdmin = {
        id: Date.now(),
        ...adminForm.value,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: null
      }
      admins.value.unshift(newAdmin)
      showSnackbar('Administrator created successfully')
    }
    
    closeAdminDialog()
    
  } catch (error) {
    console.error('Error saving admin:', error)
    showSnackbar('Failed to save administrator: ' + (error.response?.data?.message || error.message), 'error')
  } finally {
    saving.value = false
  }
}

async function toggleAdminStatus(admin) {
  admin.togglingStatus = true
  
  try {
    const newStatus = admin.status === 'active' ? 'inactive' : 'active'
    admin.status = newStatus
    
    showSnackbar(`Administrator ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
    
  } catch (error) {
    console.error('Error toggling admin status:', error)
    showSnackbar('Failed to update administrator status', 'error')
  } finally {
    admin.togglingStatus = false
  }
}

async function deleteAdmin(admin) {
  if (!confirm(`Are you sure you want to delete administrator ${admin.name}? This action cannot be undone.`)) {
    return
  }

  admin.deleting = true
  
  try {
    const index = admins.value.findIndex(a => a.id === admin.id)
    if (index !== -1) {
      admins.value.splice(index, 1)
    }
    
    showSnackbar('Administrator deleted successfully')
    
  } catch (error) {
    console.error('Error deleting admin:', error)
    showSnackbar('Failed to delete administrator', 'error')
  } finally {
    admin.deleting = false
  }
}

function viewPermissions(admin) {
  selectedAdmin.value = admin
  showPermissionsDialog.value = true
}

async function refreshData() {
  loading.value = true
  try {
    // Mock data for demonstration - replace with actual API call
    admins.value = [
      {
        id: 1,
        name: 'System Administrator',
        username: 'sysadmin',
        email: 'admin@hivsystem.com',
        phone: '+255123456789',
        role: 'super_admin',
        department: 'IT Support',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        lastLogin: '2024-01-25T14:30:00Z'
      },
      {
        id: 2,
        name: 'Dr. Sarah Johnson',
        username: 'sjohnson',
        email: 's.johnson@clinic.com',
        phone: '+255123456788',
        role: 'admin',
        department: 'Clinical Services',
        status: 'active',
        createdAt: '2024-01-05T09:15:00Z',
        lastLogin: '2024-01-25T10:20:00Z'
      },
      {
        id: 3,
        name: 'Michael Chen',
        username: 'mchen',
        email: 'm.chen@lab.com',
        phone: '+255123456787',
        role: 'operator',
        department: 'Laboratory',
        status: 'active',
        createdAt: '2024-01-10T14:45:00Z',
        lastLogin: '2024-01-24T16:10:00Z'
      },
      {
        id: 4,
        name: 'Emily Rodriguez',
        username: 'erodriguez',
        email: 'e.rodriguez@pharmacy.com',
        phone: '+255123456786',
        role: 'viewer',
        department: 'Pharmacy',
        status: 'pending',
        createdAt: '2024-01-15T11:30:00Z',
        lastLogin: null
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
</style>