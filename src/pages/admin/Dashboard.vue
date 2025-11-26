<!-- frontend/src/pages/admin/Dashboard.vue -->
<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
      <div class="user-info">
        Welcome, {{ authStore.userName }}!
        <button @click="authStore.logout" class="logout-btn">Logout</button>
      </div>
    </header>

    <nav class="dashboard-nav">
      <router-link to="/enroll" class="nav-link">
        📝 Patient Enrollment
      </router-link>
      <router-link to="/patients" class="nav-link">
        👥 View Patients
      </router-link>
      <router-link to="/verify" class="nav-link">
        🔍 Verify Integrity
      </router-link>
    </nav>

    <main class="dashboard-main">
      <div class="welcome-card">
        <h2>HIV Enrollment & DLT Integrity System</h2>
        <p>Secure patient management with blockchain-based data integrity verification.</p>
        
        <div class="quick-actions">
          <router-link to="/enroll" class="action-card">
            <h3>Enroll New Patient</h3>
            <p>Register new patients with DLT hash storage</p>
          </router-link>
          
          <router-link to="/patients" class="action-card">
            <h3>Manage Patients</h3>
            <p>View and manage enrolled patients</p>
          </router-link>
          
          <router-link to="/verify" class="action-card">
            <h3>Verify Data</h3>
            <p>Check DLT integrity of patient records</p>
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.dashboard-header {
  background: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
}

.logout-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c82333;
}

.dashboard-nav {
  background: white;
  padding: 0 30px;
  display: flex;
  gap: 20px;
  border-bottom: 1px solid #e1e5e9;
}

.nav-link {
  padding: 15px 0;
  text-decoration: none;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.dashboard-main {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.welcome-card p {
  color: #666;
  margin-bottom: 30px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.action-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.action-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.action-card p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style>