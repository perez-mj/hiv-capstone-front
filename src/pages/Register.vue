<template>
  <v-container fluid class="register-page d-flex flex-column align-center justify-center">
    <v-row class="w-100 justify-center pa-4">
      <v-col cols="12" md="9" lg="8">
        <v-card class="register-card pa-10">
          <!-- Header -->
          <div class="text-center mb-8">
            <v-avatar size="70" color="primary" class="mb-3">
              <v-icon size="40" color="white">mdi-account-plus</v-icon>
            </v-avatar>
            <h2 class="text-h5 font-weight-bold mb-1">REGISTER NEW ACCOUNT</h2>
            <p class="text-body-2 text-medium-emphasis">
              Fill in your details to get started.
            </p>
          </div>

          <v-divider class="mb-6"></v-divider>

          <v-form @submit.prevent="handleRegister" ref="form">
            <!-- Role Selection -->
            <label class="text-subtitle-1 font-weight-medium mb-2 d-block">Select Your Role</label>
            <v-row dense class="mb-6">
              <v-col cols="12" sm="6" v-for="role in roles" :key="role.value">
                <v-btn :color="selectedRole === role.value ? 'primary' : ''" variant="outlined"
                  class="w-100 py-4 role-btn" @click="selectedRole = role.value"
                  :class="{ 'role-btn-active': selectedRole === role.value }">
                  <v-icon left class="flex-shrink-0 mr-3" :color="selectedRole === role.value ? 'white' : ''">{{
                    role.icon }}</v-icon>
                  <div class="text-left flex-grow-1 min-width-0">
                    <div class="font-weight-medium text-truncate"
                      :class="selectedRole === role.value ? 'text-white' : ''">{{ role.label }}</div>
                    <small class="text-truncate d-block"
                      :class="selectedRole === role.value ? 'text-white' : 'text-medium-emphasis'">{{ role.subtitle
                      }}</small>
                  </div>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Form Fields -->
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field v-model="firstName" label="First Name" prepend-inner-icon="mdi-account" required />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="lastName" label="Last Name" prepend-inner-icon="mdi-account-outline" required />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="email" label="Email Address" prepend-inner-icon="mdi-email" type="email"
                  required />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="phone" label="Phone Number" prepend-inner-icon="mdi-phone" required />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="dob" label="Date of Birth" prepend-inner-icon="mdi-calendar"
                  placeholder="dd/mm/yyyy" required />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="license" label="License/ID Number"
                  prepend-inner-icon="mdi-card-account-details" />
              </v-col>

              <v-col cols="12">
                <v-textarea v-model="address" label="Address" prepend-inner-icon="mdi-home" rows="2" required />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="password" label="Password" prepend-inner-icon="mdi-lock" type="password"
                  required />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="confirmPassword" label="Confirm Password" prepend-inner-icon="mdi-lock-check"
                  type="password" required />
              </v-col>
            </v-row>

            <!-- Terms -->
            <v-checkbox v-model="agree" class="mt-2"
              label="I agree to the Terms of Service, Privacy Policy, and HIPAA Compliance requirements." required />

            <!-- Alert -->
            <v-alert v-if="authStore.error" type="error" density="compact" class="my-3">
              {{ authStore.error }}
            </v-alert>

            <!-- Submit -->
            <v-btn type="submit" color="primary" block class="mt-4 py-3 text-body-1" :loading="authStore.loading">
              REGISTER
            </v-btn>

            <div class="text-center mt-4">
              <small>
                Already have an account?
                <router-link to="/login">Login</router-link>
              </small>
            </div>
          </v-form>
        </v-card>

        <div class="text-center mt-4 text-body-2 text-medium-emphasis">
          Powered by Blockchain • HIPAA Compliant • ISO 27001 Certified
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const roles = [
  {
    label: 'Healthcare Provider',
    subtitle: 'Doctors, Specialists',
    icon: 'mdi-stethoscope',
    value: 'provider',
  },
  {
    label: 'Patient',
    subtitle: 'Patient Access',
    icon: 'mdi-account-heart',
    value: 'patient',
  },
  {
    label: 'Administrator',
    subtitle: 'System Management',
    icon: 'mdi-shield-account',
    value: 'admin',
  },
  {
    label: 'Nurse',
    subtitle: 'Nursing Staff',
    icon: 'mdi-hospital-box',
    value: 'nurse',
  },
]

const selectedRole = ref(null)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const dob = ref('')
const license = ref('')
const address = ref('')
const password = ref('')
const confirmPassword = ref('')
const agree = ref(false)

async function handleRegister() {
  if (!agree.value) return alert('Please agree to the terms before proceeding.')
  const success = await authStore.register({
    role: selectedRole.value,
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    phone: phone.value,
    dob: dob.value,
    license: license.value,
    address: address.value,
    password: password.value,
  })
  if (success) router.push('/admin/dashboard')
}
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.register-page {
  background-color: var(--v-theme-background);
  min-height: 100vh;
}

.register-card {
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  background: var(--v-theme-surface);
}

.role-btn {
  border-radius: 12px;
  text-transform: none;
  justify-content: flex-start;
  transition: 0.2s;
  min-height: 64px;
}

.role-btn-active {
  background-color: rgb(var(--v-theme-primary)) !important;
  border-color: rgb(var(--v-theme-primary)) !important;
}

.min-width-0 {
  min-width: 0;
}

.role-btn:hover {
  background-color: var(--v-primary-lighten2);
}

@media (max-width: 960px) {
  .register-card {
    padding: 1.5rem !important;
  }
}
</style>
