// frontend/src/api/patients.js

import http from './http'

// READ: Fetch all patients
export async function getPatients() {
    // The endpoint is /api/patients, but your Express route might be mapped to just /patients
    // Assuming your Express app serves routes starting with '/api' implicitly, 
    // we'll use '/patients' if your baseURL already contains '/api' or you handle it in the router.
    const res = await http.get('/patients');
    return res.data;
}

// DELETE: Delete a patient record
export async function deletePatient(patientId) {
    const res = await http.delete(`/patients/${patientId}`);
    return res.data; // Should return a success message/object
}

// CREATE: Enroll a new patient
export async function enrollPatientApi(patientData) {
    // Uses the dedicated /enroll route we created in the Express backend
    const res = await http.post('/patients/enroll', patientData);
    return res.data; // Should return the created patient/enrollment status
}