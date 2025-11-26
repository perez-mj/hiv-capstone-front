<template>
  <v-container fluid>
    <div class="page-header">
      <div>
        <h1 class="text-h4 font-weight-bold">Biometric Management</h1>
        <p class="text-body-1 text-medium-emphasis">
          Manage patient biometric associations
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-fingerprint-plus">
        Add Biometric
      </v-btn>
    </div>

    <v-card elevation="2">
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>Biometric ID</th>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Linked Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="link in biometricLinks" :key="link.id">
              <td>{{ link.biometricId }}</td>
              <td>{{ link.patientId }}</td>
              <td>{{ link.patientName }}</td>
              <td>{{ link.linkedDate }}</td>
              <td>
                <v-btn size="small" color="error" variant="text">
                  Unlink
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
const biometricLinks = ref([
  {
    id: 1,
    biometricId: 'BIO001',
    patientId: 'P001',
    patientName: 'John Doe',
    linkedDate: '2024-01-15'
  }
])
</script>