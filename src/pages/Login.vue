<!-- frontend/src/pages/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>HIV Enrollment System</h1>
        <p>Secure Patient Management with DLT Integrity</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" v-model="credentials.username" type="text" required placeholder="Enter your username"
            :disabled="loading">
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="credentials.password" type="password" required placeholder="Enter your password"
            :disabled="loading">
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading">Signing In...</span>
          <span v-else>Sign In</span>
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>

      <div class="demo-credentials">
        <h3>Demo Credentials:</h3>
        <p><strong>Username:</strong> admin</p>
        <p><strong>Password:</strong> admin</p> <!-- Changed from admin123 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const credentials = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!credentials.value.username || !credentials.value.password) {
    error.value = 'Please enter both username and password'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login(credentials.value)
    // ✅ FIX: Let the auth store handle navigation
    // The router push is already handled in the auth store
    console.log('✅ Login successful, navigation handled by auth store')
  } catch (err) {
    error.value = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.'
    console.error('❌ Login error details:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.login-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c33;
  font-size: 14px;
  text-align: center;
}

.demo-credentials {
  margin-top: 25px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.demo-credentials h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
}

.demo-credentials p {
  margin: 5px 0;
  color: #666;
  font-size: 13px;
}
</style>