<!-- components/PatientDialog.vue -->
<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">{{ isEdit ? 'Edit Patient' : 'New Patient Enrollment' }}</span>
        <v-btn
          icon
          variant="text"
          @click="closeDialog"
          :disabled="loading"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="savePatient">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                label="Full Name *"
                variant="outlined"
                density="comfortable"
                :rules="[requiredRule]"
                :disabled="loading"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.date_of_birth"
                label="Date of Birth *"
                type="date"
                variant="outlined"
                density="comfortable"
                :rules="[requiredRule, dateRule]"
                :disabled="loading"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="formData.contact"
                label="Contact Information"
                variant="outlined"
                density="comfortable"
                placeholder="Email or phone number"
                :rules="[contactRule]"
                :disabled="loading"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="formData.consent"
                :items="consentOptions"
                label="Consent Status *"
                variant="outlined"
                density="comfortable"
                :rules="[requiredRule]"
                :disabled="loading"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="formData.hiv_status"
                :items="hivStatusOptions"
                label="HIV Status *"
                variant="outlined"
                density="comfortable"
                :rules="[requiredRule]"
                :disabled="loading"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="formData.biometric_id"
                label="Biometric ID *"
                variant="outlined"
                density="comfortable"
                placeholder="Unique biometric identifier"
                :rules="[requiredRule]"
                :disabled="loading"
                required
              />
              <div class="text-caption text-medium-emphasis">
                This will be used for patient identification and check-ins
              </div>
            </v-col>

            <!-- DLT Information -->
            <v-col cols="12" v-if="isEdit">
              <v-alert
                type="info"
                variant="tonal"
                density="compact"
              >
                <div class="d-flex align-center">
                  <v-icon class="me-2">mdi-information</v-icon>
                  <span>
                    <strong>DLT Integrity Notice:</strong> 
                    Any changes to consent status or HIV status will automatically create 
                    a new DLT hash record to maintain blockchain data integrity.
                  </span>
                </div>
              </v-alert>
            </v-col>

            <!-- New Enrollment DLT Info -->
            <v-col cols="12" v-else>
              <v-alert
                type="success"
                variant="tonal"
                density="compact"
              >
                <div class="d-flex align-center">
                  <v-icon class="me-2">mdi-shield-check</v-icon>
                  <span>
                    <strong>Blockchain Enrollment:</strong> 
                    This patient record will be secured on the blockchain with an 
                    immutable hash of their consent and HIV status data.
                  </span>
                </div>
              </v-alert>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="closeDialog"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!valid || loading"
          @click="savePatient"
        >
          {{ isEdit ? 'Update' : 'Enroll' }} Patient
        </v-btn>
      </v-card-actions>

      <!-- Loading Overlay -->
      <v-overlay :model-value="loading" contained scrim="white" class="align-center justify-center">
        <div class="text-center">
          <v-progress-circular color="primary" indeterminate size="64" />
          <div class="text-h6 mt-4">
            {{ isEdit ? 'Updating Patient...' : 'Enrolling Patient...' }}
          </div>
          <div class="text-body-2 text-medium-emphasis mt-2">
            {{ isEdit ? 'Storing changes on blockchain...' : 'Creating blockchain record...' }}
          </div>
        </div>
      </v-overlay>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { usePatientStore } from '@/stores/patient'

const props = defineProps({
  modelValue: Boolean,
  patient: Object,
  mode: String
})

const emit = defineEmits(['update:modelValue', 'saved'])

const patientStore = usePatientStore()

// Reactive data
const dialog = ref(false)
const valid = ref(false)
const loading = ref(false)
const form = ref(null)

const formData = ref({
  name: '',
  date_of_birth: '',
  contact: '',
  consent: true, // Default to true for boolean
  hiv_status: '',
  biometric_id: ''
})

// Options
const consentOptions = [
  { title: 'Consented', value: true },
  { title: 'Not Consented', value: false }
]

const hivStatusOptions = [
  { title: 'Reactive', value: 'Reactive' },
  { title: 'Non-Reactive', value: 'Non-Reactive' }
]

// Validation rules
const requiredRule = value => !!value || 'This field is required'
const dateRule = value => {
  if (!value) return true
  const date = new Date(value)
  const today = new Date()
  return date <= today || 'Date of birth cannot be in the future'
}
const contactRule = value => {
  if (!value) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^\+?[\d\s-()]{10,}$/
  return emailRegex.test(value) || phoneRegex.test(value) || 'Enter a valid email or phone number'
}

// Computed
const isEdit = computed(() => props.mode === 'edit')

// Watchers
watch(() => props.modelValue, (value) => {
  dialog.value = value
  if (value) {
    initializeForm()
  }
})

watch(dialog, (value) => {
  emit('update:modelValue', value)
})

// Methods
function initializeForm() {
  if (isEdit.value && props.patient) {
    // Populate form with existing patient data
    formData.value = {
      name: props.patient.name,
      date_of_birth: formatDateForInput(props.patient.date_of_birth),
      contact: props.patient.contact_info || props.patient.contact || '',
      consent: props.patient.consent_status === 'YES' || props.patient.consent === true,
      hiv_status: props.patient.hiv_status,
      biometric_id: props.patient.biometric_id || ''
    }
  } else {
    // Reset form for new patient
    formData.value = {
      name: '',
      date_of_birth: '',
      contact: '',
      consent: true, // Default to consented
      hiv_status: '',
      biometric_id: ''
    }
  }

  // Reset validation
  nextTick(() => {
    if (form.value) {
      form.value.resetValidation()
    }
  })
}

function formatDateForInput(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

async function savePatient() {
  if (!form.value.validate()) return

  loading.value = true
  try {
    if (isEdit.value) {
      // Update existing patient
      await patientStore.updatePatient(props.patient.patient_id, formData.value)
    } else {
      // Create new patient
      await patientStore.createPatient(formData.value)
    }
    
    emit('saved', formData.value)
    closeDialog()
  } catch (error) {
    console.error('Failed to save patient:', error)
    // Error handling is done in the store
  } finally {
    loading.value = false
  }
}

function closeDialog() {
  if (!loading.value) {
    dialog.value = false
  }
}
</script>