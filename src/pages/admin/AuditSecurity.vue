<!-- frontend/src/pages/admin/AuditSecurity.vue -->
<template>
  <v-container fluid class="pa-6">
    <!-- Page Header -->
    <div class="page-header d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary">Audit & Security</h1>
        <p class="text-body-1 text-medium-emphasis mt-2">
          Monitor system activities and security events
        </p>
      </div>
      <div class="d-flex gap-2">
        <v-btn 
          variant="outlined" 
          prepend-icon="mdi-download"
          @click="exportAuditLogs"
          :loading="exporting"
        >
          Export
        </v-btn>
        <v-btn 
          color="primary" 
          prepend-icon="mdi-refresh"
          @click="refreshData"
          :loading="loading"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="primary" size="48" class="mb-2">mdi-shield-account</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.totalActions }}</div>
            <div class="text-body-2 text-medium-emphasis">Total Actions</div>
            <div class="text-caption text-success" v-if="stats.change24h > 0">
              +{{ stats.change24h }}% today
            </div>
            <div class="text-caption text-error" v-else-if="stats.change24h < 0">
              {{ stats.change24h }}% today
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="success" size="48" class="mb-2">mdi-login</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.successfulLogins }}</div>
            <div class="text-body-2 text-medium-emphasis">Successful Logins</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="error" size="48" class="mb-2">mdi-login-variant</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.failedLogins }}</div>
            <div class="text-body-2 text-medium-emphasis">Failed Logins</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" border>
          <v-card-text class="text-center">
            <v-icon color="warning" size="48" class="mb-2">mdi-alert-circle</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.securityAlerts }}</div>
            <div class="text-body-2 text-medium-emphasis">Security Alerts</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts and Analytics -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <v-card elevation="2" border>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Activity Timeline (Last 7 Days)</span>
            <v-btn variant="text" size="small" @click="showActivityChart = !showActivityChart">
              {{ showActivityChart ? 'Hide' : 'Show' }}
            </v-btn>
          </v-card-title>
          <v-card-text v-if="showActivityChart">
            <div class="activity-chart">
              <div 
                v-for="day in activityData" 
                :key="day.date"
                class="chart-bar-container"
              >
                <div class="chart-bar-label">{{ day.date }}</div>
                <div class="chart-bar">
                  <div 
                    class="chart-bar-fill success" 
                    :style="{ height: `${(day.successful / day.total) * 100}%` }"
                    :title="`Successful: ${day.successful}`"
                  ></div>
                  <div 
                    class="chart-bar-fill warning" 
                    :style="{ height: `${(day.warning / day.total) * 100}%` }"
                    :title="`Warning: ${day.warning}`"
                  ></div>
                  <div 
                    class="chart-bar-fill error" 
                    :style="{ height: `${(day.failed / day.total) * 100}%` }"
                    :title="`Failed: ${day.failed}`"
                  ></div>
                </div>
                <div class="chart-bar-total">{{ day.total }}</div>
              </div>
            </div>
            <div class="chart-legend d-flex justify-center gap-4 mt-4">
              <div class="d-flex align-center gap-1">
                <div class="legend-color success"></div>
                <span class="text-caption">Successful</span>
              </div>
              <div class="d-flex align-center gap-1">
                <div class="legend-color warning"></div>
                <span class="text-caption">Warning</span>
              </div>
              <div class="d-flex align-center gap-1">
                <div class="legend-color error"></div>
                <span class="text-caption">Failed</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card elevation="2" border>
          <v-card-title>Action Types</v-card-title>
          <v-card-text>
            <div class="action-types">
              <div 
                v-for="type in actionTypes" 
                :key="type.name"
                class="action-type-item d-flex justify-space-between align-center py-2"
              >
                <div class="d-flex align-center gap-2">
                  <v-icon :color="getActionTypeColor(type.name)" size="20">
                    {{ getActionTypeIcon(type.name) }}
                  </v-icon>
                  <span class="text-body-2">{{ formatActionType(type.name) }}</span>
                </div>
                <v-chip size="small" variant="flat">
                  {{ type.count }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Security Alerts -->
    <v-card elevation="2" class="mb-6" border v-if="securityAlerts.length > 0">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Security Alerts</span>
        <v-chip color="error" variant="flat" prepend-icon="mdi-alert">
          {{ securityAlerts.length }} Active
        </v-chip>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-list>
          <v-list-item
            v-for="alert in securityAlerts"
            :key="alert.id"
            :class="`alert-${alert.severity}`"
          >
            <template v-slot:prepend>
              <v-icon :color="getAlertColor(alert.severity)">
                {{ getAlertIcon(alert.severity) }}
              </v-icon>
            </template>
            <v-list-item-title class="font-weight-medium">
              {{ alert.title }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ alert.description }} \u2022 {{ formatTimeAgo(alert.timestamp) }}
            </v-list-item-subtitle>
            <template v-slot:append>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="resolveAlert(alert)"
              >
                Resolve
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Search and Filters -->
    <v-card elevation="2" class="mb-4" border>
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="search"
              density="comfortable"
              variant="outlined"
              placeholder="Search by user, action, or IP..."
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="actionTypeFilter"
              density="comfortable"
              variant="outlined"
              :items="actionTypeOptions"
              placeholder="Action Type"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="userFilter"
              density="comfortable"
              variant="outlined"
              :items="userOptions"
              placeholder="User"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="statusFilter"
              density="comfortable"
              variant="outlined"
              :items="statusOptions"
              placeholder="Status"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-row dense>
              <v-col>
                <v-menu v-model="dateMenu" :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="dateRangeText"
                      density="comfortable"
                      variant="outlined"
                      placeholder="Date Range"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      v-bind="props"
                      hide-details
                    />
                  </template>
                  <v-date-picker
                    v-model="dateRange"
                    range
                    @update:model-value="dateMenu = false"
                  />
                </v-menu>
              </v-col>
              <v-col cols="auto">
                <v-btn
                  variant="outlined"
                  @click="clearFilters"
                  :disabled="!hasActiveFilters"
                >
                  Clear
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Main Audit Log Table -->
    <v-card elevation="2" border>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Audit Logs</span>
        <span class="text-body-2 text-medium-emphasis">
          Showing {{ paginatedLogs.length }} of {{ filteredLogs.length }} records
        </span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="paginatedLogs"
          :loading="loading"
          :search="search"
          :sort-by="[{ key: sortBy, order: 'desc' }]"
          :items-per-page="perPage"
          :page="page"
          @update:options="updatePagination"
          class="elevation-0"
        >
          <!-- Loading State -->
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@10" />
          </template>

          <!-- Timestamp Column -->
          <template v-slot:item.timestamp="{ item }">
            <div class="text-no-wrap">
              {{ formatDateTime(item.timestamp) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ formatTimeAgo(item.timestamp) }}
            </div>
          </template>

          <!-- User Column -->
          <template v-slot:item.user="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="primary" class="mr-3">
                <span class="text-caption text-white">
                  {{ getInitials(item.userName || 'System') }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.userName || 'System' }}</div>
                <div class="text-caption text-medium-emphasis" v-if="item.userId">
                  {{ item.userId }}
                </div>
              </div>
            </div>
          </template>

          <!-- Action Type Column -->
          <template v-slot:item.actionType="{ item }">
            <v-chip 
              :color="getActionTypeColor(item.actionType)" 
              size="small"
              variant="flat"
              :prepend-icon="getActionTypeIcon(item.actionType)"
            >
              {{ formatActionType(item.actionType) }}
            </v-chip>
          </template>

          <!-- Description Column -->
          <template v-slot:item.description="{ item }">
            <div class="description-cell">
              {{ item.description }}
            </div>
            <div v-if="item.patientId" class="text-caption text-medium-emphasis">
              Patient: {{ item.patientId }}
            </div>
          </template>

          <!-- IP Address Column -->
          <template v-slot:item.ipAddress="{ item }">
            <code class="text-body-2">{{ item.ipAddress || 'N/A' }}</code>
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
            <div class="d-flex gap-1">
              <v-btn
                size="small"
                variant="text"
                color="primary"
                icon="mdi-information"
                @click="viewLogDetails(item)"
              />
              <v-btn
                size="small"
                variant="text"
                color="error"
                icon="mdi-alert"
                v-if="item.status === 'failed'"
                @click="flagSecurityIssue(item)"
              />
            </div>
          </template>

          <!-- Empty State -->
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-shield-off</v-icon>
              <div class="text-h6 text-grey">No audit logs found</div>
              <div class="text-body-2 text-grey mt-2">
                {{ hasActiveFilters ? 'Try adjusting your filters' : 'No audit records available' }}
              </div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>

      <!-- Pagination -->
      <v-card-actions class="d-flex justify-space-between align-center px-4 py-3">
        <span class="text-body-2 text-medium-emphasis">
          Page {{ page }} of {{ pageCount }}
        </span>
        <v-pagination
          v-model="page"
          :length="pageCount"
          :total-visible="7"
          density="comfortable"
        />
      </v-card-actions>
    </v-card>

    <!-- Log Details Dialog -->
    <v-dialog v-model="showLogDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Audit Log Details</span>
          <v-btn icon @click="showLogDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="selectedLog" class="log-details">
            <v-row>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">Timestamp</div>
                <div class="text-body-1 mb-2">{{ formatDateTime(selectedLog.timestamp) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">Status</div>
                <v-chip 
                  :color="getStatusColor(selectedLog.status)" 
                  size="small"
                  class="mb-2"
                >
                  {{ selectedLog.status }}
                </v-chip>
              </v-col>
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis">User</div>
                <div class="text-body-1 mb-2">{{ selectedLog.userName }} ({{ selectedLog.userId }})</div>
              </v-col>
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis">Action</div>
                <div class="text-body-1 mb-2">{{ formatActionType(selectedLog.actionType) }}</div>
              </v-col>
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis">Description</div>
                <div class="text-body-1 mb-2">{{ selectedLog.description }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">IP Address</div>
                <div class="text-body-1 mb-2">{{ selectedLog.ipAddress || 'N/A' }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">Patient ID</div>
                <div class="text-body-1 mb-2">{{ selectedLog.patientId || 'N/A' }}</div>
              </v-col>
              <v-col cols="12" v-if="selectedLog.additionalData">
                <div class="text-caption text-medium-emphasis">Additional Data</div>
                <pre class="text-body-2 pa-2 bg-grey-lighten-3 rounded">{{ JSON.stringify(selectedLog.additionalData, null, 2) }}</pre>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="showLogDialog = false">
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
import { auditApi } from '@/api'

// Reactive state
const loading = ref(false)
const exporting = ref(false)
const search = ref('')
const actionTypeFilter = ref('')
const userFilter = ref('')
const statusFilter = ref('')
const dateRange = ref([])
const dateMenu = ref(false)
const sortBy = ref('timestamp')
const page = ref(1)
const perPage = ref(20)
const auditLogs = ref([])
const securityAlerts = ref([])
const showLogDialog = ref(false)
const selectedLog = ref(null)
const showActivityChart = ref(true)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Stats
const stats = computed(() => {
  const totalActions = auditLogs.value.length
  const successfulLogins = auditLogs.value.filter(log => 
    log.actionType === 'LOGIN_SUCCESS'
  ).length
  const failedLogins = auditLogs.value.filter(log => 
    log.actionType === 'LOGIN_FAILED'
  ).length
  const securityAlertsCount = securityAlerts.value.length
  const change24h = 12 // Mock data - calculate based on actual data

  return { totalActions, successfulLogins, failedLogins, securityAlerts: securityAlertsCount, change24h }
})

// Activity data for chart
const activityData = ref([
  { date: 'Jan 19', total: 45, successful: 35, warning: 7, failed: 3 },
  { date: 'Jan 20', total: 52, successful: 42, warning: 6, failed: 4 },
  { date: 'Jan 21', total: 38, successful: 32, warning: 4, failed: 2 },
  { date: 'Jan 22', total: 61, successful: 48, warning: 9, failed: 4 },
  { date: 'Jan 23', total: 49, successful: 41, warning: 5, failed: 3 },
  { date: 'Jan 24', total: 55, successful: 45, warning: 6, failed: 4 },
  { date: 'Jan 25', total: 42, successful: 36, warning: 4, failed: 2 }
])

const actionTypes = ref([
  { name: 'LOGIN_SUCCESS', count: 279 },
  { name: 'PATIENT_CREATED', count: 156 },
  { name: 'PATIENT_UPDATED', count: 89 },
  { name: 'DLT_VERIFICATION', count: 67 },
  { name: 'LOGOUT', count: 45 },
  { name: 'LOGIN_FAILED', count: 23 }
])

// Table headers
const headers = ref([
  { title: 'Timestamp', key: 'timestamp', sortable: true, width: '180px' },
  { title: 'User', key: 'user', sortable: true },
  { title: 'Action Type', key: 'actionType', sortable: true },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'IP Address', key: 'ipAddress', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end', width: '100px' }
])

// Filter options
const actionTypeOptions = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'LOGOUT',
  'PATIENT_CREATED',
  'PATIENT_UPDATED',
  'PATIENT_DELETED',
  'DLT_VERIFICATION',
  'DLT_HASH_CREATED',
  'BIOMETRIC_LINK_CREATED',
  'BIOMETRIC_VERIFICATION'
].map(type => ({ title: formatActionType(type), value: type }))

const userOptions = computed(() => {
  const users = [...new Set(auditLogs.value.map(log => log.userName).filter(Boolean))]
  return users.map(user => ({ title: user, value: user }))
})

const statusOptions = [
  { title: 'Success', value: 'success' },
  { title: 'Failed', value: 'failed' },
  { title: 'Warning', value: 'warning' }
]

// Computed properties
const filteredLogs = computed(() => {
  let filtered = auditLogs.value

  // Action type filter
  if (actionTypeFilter.value) {
    filtered = filtered.filter(log => log.actionType === actionTypeFilter.value)
  }

  // User filter
  if (userFilter.value) {
    filtered = filtered.filter(log => log.userName === userFilter.value)
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(log => log.status === statusFilter.value)
  }

  // Date range filter
  if (dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    filtered = filtered.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= startDate && logDate <= endDate
    })
  }

  // Search filter
  if (search.value) {
    const query = search.value.toLowerCase()
    filtered = filtered.filter(log => 
      log.userName?.toLowerCase().includes(query) ||
      log.actionType?.toLowerCase().includes(query) ||
      log.description?.toLowerCase().includes(query) ||
      log.ipAddress?.includes(query) ||
      log.patientId?.toLowerCase().includes(query)
    )
  }

  // Sorting
  return sortLogs(filtered, sortBy.value)
})

const paginatedLogs = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredLogs.value.slice(start, start + perPage.value)
})

const pageCount = computed(() => Math.ceil(filteredLogs.value.length / perPage.value))

const dateRangeText = computed(() => {
  if (dateRange.value.length === 2) {
    return `${formatDate(dateRange.value[0])} - ${formatDate(dateRange.value[1])}`
  }
  return 'Select date range'
})

const hasActiveFilters = computed(() => {
  return search.value || actionTypeFilter.value || userFilter.value || statusFilter.value || dateRange.value.length > 0
})

// Methods
function getActionTypeColor(actionType) {
  const colors = {
    'LOGIN_SUCCESS': 'success',
    'LOGIN_FAILED': 'error',
    'LOGOUT': 'warning',
    'PATIENT_CREATED': 'primary',
    'PATIENT_UPDATED': 'info',
    'PATIENT_DELETED': 'error',
    'DLT_VERIFICATION': 'teal',
    'DLT_HASH_CREATED': 'deep-purple',
    'BIOMETRIC_LINK_CREATED': 'orange',
    'BIOMETRIC_VERIFICATION': 'green'
  }
  return colors[actionType] || 'grey'
}

function getActionTypeIcon(actionType) {
  const icons = {
    'LOGIN_SUCCESS': 'mdi-login',
    'LOGIN_FAILED': 'mdi-login-variant',
    'LOGOUT': 'mdi-logout',
    'PATIENT_CREATED': 'mdi-account-plus',
    'PATIENT_UPDATED': 'mdi-account-edit',
    'PATIENT_DELETED': 'mdi-account-remove',
    'DLT_VERIFICATION': 'mdi-shield-check',
    'DLT_HASH_CREATED': 'mdi-database-plus',
    'BIOMETRIC_LINK_CREATED': 'mdi-fingerprint',
    'BIOMETRIC_VERIFICATION': 'mdi-shield-account'
  }
  return icons[actionType] || 'mdi-information'
}

function formatActionType(actionType) {
  return actionType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function getStatusColor(status) {
  const colors = {
    'success': 'success',
    'failed': 'error',
    'warning': 'warning'
  }
  return colors[status] || 'grey'
}

function getStatusIcon(status) {
  const icons = {
    'success': 'mdi-check-circle',
    'failed': 'mdi-close-circle',
    'warning': 'mdi-alert-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

function getAlertColor(severity) {
  const colors = {
    'high': 'error',
    'medium': 'warning',
    'low': 'info'
  }
  return colors[severity] || 'grey'
}

function getAlertIcon(severity) {
  const icons = {
    'high': 'mdi-alert-octagon',
    'medium': 'mdi-alert',
    'low': 'mdi-information'
  }
  return icons[severity] || 'mdi-help-circle'
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatTimeAgo(dateString) {
  const now = new Date()
  const time = new Date(dateString)
  const diffMs = now - time
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 7)}w ago`
}

function getInitials(name) {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

function sortLogs(logs, sortKey) {
  const sorted = [...logs]
  switch (sortKey) {
    case 'timestamp':
      return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    case 'timestamp_asc':
      return sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    case 'user':
      return sorted.sort((a, b) => (a.userName || '').localeCompare(b.userName || ''))
    case 'actionType':
      return sorted.sort((a, b) => a.actionType.localeCompare(b.actionType))
    case 'status':
      return sorted.sort((a, b) => a.status.localeCompare(b.status))
    default:
      return sorted
  }
}

function clearFilters() {
  search.value = ''
  actionTypeFilter.value = ''
  userFilter.value = ''
  statusFilter.value = ''
  dateRange.value = []
  page.value = 1
}

function updatePagination(options) {
  if (options.page !== undefined) page.value = options.page
  if (options.itemsPerPage !== undefined) perPage.value = options.itemsPerPage
  if (options.sortBy !== undefined) sortBy.value = options.sortBy[0]?.key || 'timestamp'
}

function viewLogDetails(log) {
  selectedLog.value = log
  showLogDialog.value = true
}

function flagSecurityIssue(log) {
  // Add to security alerts
  const alert = {
    id: Date.now(),
    title: `Suspicious activity detected: ${formatActionType(log.actionType)}`,
    description: `User: ${log.userName}, IP: ${log.ipAddress}`,
    severity: 'medium',
    timestamp: new Date().toISOString()
  }
  securityAlerts.value.unshift(alert)
  showSnackbar('Security issue flagged for investigation', 'warning')
}

function resolveAlert(alert) {
  const index = securityAlerts.value.findIndex(a => a.id === alert.id)
  if (index !== -1) {
    securityAlerts.value.splice(index, 1)
    showSnackbar('Security alert resolved', 'success')
  }
}

async function exportAuditLogs() {
  exporting.value = true
  try {
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const dataStr = JSON.stringify(auditLogs.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showSnackbar('Audit logs exported successfully')
  } catch (error) {
    console.error('Error exporting audit logs:', error)
    showSnackbar('Failed to export audit logs', 'error')
  } finally {
    exporting.value = false
  }
}

function showSnackbar(message, color = 'success') {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

async function refreshData() {
  loading.value = true
  try {
    // Fetch actual audit logs from API
    // const response = await auditApi.getLogs({ limit: 1000 })
    // auditLogs.value = response.data.logs
    
    // Mock data for demonstration
    auditLogs.value = [
      {
        id: 1,
        timestamp: '2024-01-25T14:30:00Z',
        userId: 'sysadmin',
        userName: 'System Administrator',
        actionType: 'LOGIN_SUCCESS',
        description: 'User logged in successfully',
        ipAddress: '192.168.1.100',
        status: 'success',
        patientId: null
      },
      {
        id: 2,
        timestamp: '2024-01-25T14:25:00Z',
        userId: 'sjohnson',
        userName: 'Dr. Sarah Johnson',
        actionType: 'PATIENT_CREATED',
        description: 'Patient John Doe enrolled',
        ipAddress: '192.168.1.101',
        status: 'success',
        patientId: 'HIV-1764145038945-9769'
      },
      {
        id: 3,
        timestamp: '2024-01-25T14:20:00Z',
        userId: 'mchen',
        userName: 'Michael Chen',
        actionType: 'DLT_VERIFICATION',
        description: 'DLT verification for patient HIV-1764145038945-9769',
        ipAddress: '192.168.1.102',
        status: 'success',
        patientId: 'HIV-1764145038945-9769'
      },
      {
        id: 4,
        timestamp: '2024-01-25T14:15:00Z',
        userId: null,
        userName: null,
        actionType: 'LOGIN_FAILED',
        description: 'Failed login attempt for username: unknown',
        ipAddress: '203.0.113.45',
        status: 'failed',
        patientId: null
      },
      {
        id: 5,
        timestamp: '2024-01-25T14:10:00Z',
        userId: 'erodriguez',
        userName: 'Emily Rodriguez',
        actionType: 'BIOMETRIC_VERIFICATION',
        description: 'Biometric verification successful',
        ipAddress: '192.168.1.103',
        status: 'success',
        patientId: 'HIV-1764145038946-1234'
      }
    ]

    // Mock security alerts
    securityAlerts.value = [
      {
        id: 1,
        title: 'Multiple failed login attempts',
        description: '5 failed login attempts from IP 203.0.113.45 within 10 minutes',
        severity: 'high',
        timestamp: '2024-01-25T14:16:00Z'
      },
      {
        id: 2,
        title: 'Unusual activity pattern',
        description: 'User mchen accessed system outside normal hours',
        severity: 'medium',
        timestamp: '2024-01-25T02:30:00Z'
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

.activity-chart {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 200px;
  padding: 20px 0;
}

.chart-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.chart-bar {
  width: 20px;
  height: 120px;
  background: #f5f5f5;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.chart-bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 4px;
  transition: height 0.3s ease;
}

.chart-bar-fill.success {
  background: #4CAF50;
}

.chart-bar-fill.warning {
  background: #FF9800;
}

.chart-bar-fill.error {
  background: #F44336;
}

.chart-bar-label {
  font-size: 0.75rem;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.6);
}

.chart-bar-total {
  font-size: 0.75rem;
  margin-top: 8px;
  font-weight: 600;
}

.chart-legend .legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.success { background: #4CAF50; }
.legend-color.warning { background: #FF9800; }
.legend-color.error { background: #F44336; }

.action-types {
  max-height: 200px;
  overflow-y: auto;
}

.alert-high {
  border-left: 4px solid #F44336;
  background: rgba(244, 67, 54, 0.04);
}

.alert-medium {
  border-left: 4px solid #FF9800;
  background: rgba(255, 152, 0, 0.04);
}

.alert-low {
  border-left: 4px solid #2196F3;
  background: rgba(33, 150, 243, 0.04);
}

.description-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.v-data-table-header) {
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.v-data-table .v-table__wrapper > table > thead > tr > th) {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}
</style>