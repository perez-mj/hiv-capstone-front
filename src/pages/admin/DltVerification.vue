<template>
  <v-container fluid>
    <div class="page-header">
      <div>
        <h1 class="text-h4 font-weight-bold">DLT Verification</h1>
        <p class="text-body-1 text-medium-emphasis">
          Verify patient data integrity on the blockchain
        </p>
      </div>
    </div>

    <v-card elevation="2">
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Hash</th>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="verification in verifications" :key="verification.id">
              <td>{{ verification.patientId }}</td>
              <td>{{ verification.name }}</td>
              <td class="hash-cell">{{ verification.hash }}</td>
              <td>{{ verification.timestamp }}</td>
              <td>
                <v-chip :color="getStatusColor(verification.status)" size="small">
                  {{ verification.status }}
                </v-chip>
              </td>
              <td>
                <v-btn size="small" @click="verifyHash(verification)">
                  Verify
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
const verifications = ref([
  {
    id: 1,
    patientId: 'P001',
    name: 'John Doe',
    hash: 'a1b2c3d4e5f6...',
    timestamp: '2024-01-15 10:30:00',
    status: 'Verified'
  }
])

function getStatusColor(status) {
  const colors = {
    'Verified': 'success',
    'Pending': 'warning',
    'Failed': 'error'
  }
  return colors[status] || 'grey'
}

function verifyHash(verification) {
  console.log('Verifying hash for:', verification)
}
</script>

<style scoped>
.hash-cell {
  font-family: monospace;
  font-size: 0.875rem;
}
</style>