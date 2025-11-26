<!-- components/DltVerificationDialog.vue -->
<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">Verify DLT Integrity</span>
        <v-btn
          icon
          variant="text"
          @click="closeDialog"
          :disabled="loading"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <!-- Patient Info -->
        <div v-if="patient" class="patient-info mb-4">
          <div class="text-subtitle-1 font-weight-medium">{{ patient.name }}</div>
          <div class="text-caption text-medium-emphasis">ID: {{ patient.patient_id }}</div>
          <div class="text-caption text-medium-emphasis">
            HIV Status: {{ patient.hiv_status }} | 
            Consent: {{ patient.consent_status }}
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular color="primary" indeterminate size="48" />
          <div class="text-body-1 mt-4">Verifying DLT integrity...</div>
          <div class="text-caption text-medium-emphasis mt-2">
            This may take a few seconds
          </div>
        </div>

        <!-- Verification Results -->
        <div v-else-if="verificationResult" class="verification-results">
          <div class="text-center py-4">
            <v-icon
              :color="verificationResult.color"
              size="64"
              class="mb-2"
            >
              {{ verificationResult.icon }}
            </v-icon>
            <div class="text-h6" :class="`text-${verificationResult.color}`">
              {{ verificationResult.title }}
            </div>
            <div class="text-body-2 text-medium-emphasis mt-2">
              {{ verificationResult.message }}
            </div>
          </div>

          <!-- Verification Details -->
          <v-expand-transition>
            <div v-if="verificationDetails" class="verification-details mt-4">
              <v-divider class="my-2" />
              
              <div class="details-grid">
                <div class="detail-item">
                  <span class="label">Current Hash:</span>
                  <span class="value hash-value">{{ verificationDetails.current_hash }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Stored DLT Hash:</span>
                  <span class="value hash-value">{{ verificationDetails.stored_dlt_hash }}</span>
                </div>
                <div v-if="verificationDetails.transaction_id" class="detail-item">
                  <span class="label">Transaction ID:</span>
                  <span class="value">{{ verificationDetails.transaction_id }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Last DLT Update:</span>
                  <span class="value">{{ formatDate(verificationDetails.last_dlt_timestamp) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Verification Time:</span>
                  <span class="value">{{ formatDate(verificationDetails.verification_timestamp) }}</span>
                </div>
              </div>

              <!-- Hash Match Details -->
              <div v-if="verificationDetails.hash_match !== undefined" class="hash-match mt-4">
                <v-alert
                  :type="verificationDetails.hash_match ? 'success' : 'error'"
                  variant="tonal"
                  density="compact"
                >
                  <div class="d-flex align-center">
                    <v-icon class="me-2">
                      {{ verificationDetails.hash_match ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                    </v-icon>
                    <span>
                      <strong>Hash Match:</strong> 
                      {{ verificationDetails.hash_match ? 
                         'Local data matches blockchain record' : 
                         'Local data differs from blockchain record' }}
                    </span>
                  </div>
                </v-alert>
              </div>
            </div>
          </v-expand-transition>
        </div>

        <!-- Initial State -->
        <div v-else class="text-center py-8">
          <v-icon size="64" color="grey" class="mb-2">mdi-shield-check</v-icon>
          <div class="text-h6 text-grey">Ready to Verify</div>
          <div class="text-body-2 text-medium-emphasis mt-2">
            Verify this patient's data integrity on the blockchain
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="closeDialog"
          :disabled="loading"
        >
          {{ verificationResult ? 'Close' : 'Cancel' }}
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          @click="performVerification"
          v-if="!verificationResult || !verificationDetails.is_verified"
        >
          {{ verificationResult ? 'Verify Again' : 'Verify Now' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePatientStore } from '@/stores/patient'

const props = defineProps({
  modelValue: Boolean,
  patient: Object
})

const emit = defineEmits(['update:modelValue', 'verified'])

const patientStore = usePatientStore()

// Reactive data
const dialog = ref(false)
const loading = ref(false)
const verificationDetails = ref(null)

// Computed
const verificationResult = computed(() => {
  if (!verificationDetails.value) return null

  if (verificationDetails.value.is_verified) {
    return {
      icon: 'mdi-check-circle',
      color: 'success',
      title: 'Integrity Verified',
      message: 'Patient data matches the blockchain record'
    }
  } else {
    return {
      icon: 'mdi-alert-circle',
      color: 'error',
      title: 'Integrity Mismatch',
      message: 'Patient data does not match blockchain record'
    }
  }
})

// Watchers
watch(() => props.modelValue, (value) => {
  dialog.value = value
  if (!value) {
    // Reset when dialog closes
    resetVerification()
  }
})

watch(dialog, (value) => {
  emit('update:modelValue', value)
})

// Methods
function resetVerification() {
  verificationDetails.value = null
  loading.value = false
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function performVerification() {
  if (!props.patient?.patient_id) {
    console.error('No patient ID provided for verification')
    return
  }

  loading.value = true
  verificationDetails.value = null

  try {
    const result = await patientStore.verifyDltIntegrity(props.patient.patient_id)
    
    // Map the backend response to expected frontend structure
    verificationDetails.value = {
      is_verified: result.is_verified,
      current_hash: result.current_hash,
      stored_dlt_hash: result.stored_dlt_hash,
      last_dlt_timestamp: result.last_dlt_timestamp,
      verification_timestamp: result.verification_timestamp,
      hash_match: result.current_hash === result.stored_dlt_hash,
      transaction_id: result.transaction_id || `TX-${Date.now()}`
    }

    emit('verified', verificationDetails.value)
  } catch (error) {
    console.error('DLT verification failed:', error)
    
    // Create error state
    verificationDetails.value = {
      is_verified: false,
      error: error.message,
      verification_timestamp: new Date().toISOString()
    }
  } finally {
    loading.value = false
  }
}

function closeDialog() {
  dialog.value = false
}
</script>

<style scoped>
.patient-info {
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border-left: 4px solid #1976d2;
}

.verification-results {
  min-height: 200px;
}

.details-grid {
  display: grid;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  min-width: 140px;
}

.detail-item .value {
  color: rgba(0, 0, 0, 0.87);
  word-break: break-all;
  text-align: right;
  flex: 1;
}

.hash-value {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px 8px;
  border-radius: 4px;
}
</style>