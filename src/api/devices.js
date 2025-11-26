// src/api/devices.js
import http from './http'

async function safeAxiosRequest(requestFn) {
  try {
    const res = await requestFn()
    return res.data
  } catch (err) {
    throw err
  }
}

export async function getDevices() {
  try {
    const devices = await safeAxiosRequest(() => http.get('/devices'))
    return devices
  } catch (e) {
    try {
      const db = await safeAxiosRequest(() => http.get('/db.json'))
      return db.devices || []
    } catch (err) {
      console.error('Failed to load devices from server and db.json:', err)
      return []
    }
  }
}

export async function createDevice(device) {
  try {
    const created = await safeAxiosRequest(() => http.post('/devices', device))
    return created
  } catch (err) {
    console.warn('POST /devices failed \u2014 falling back to client-only create', err)
    return { ...device }
  }
}

export async function updateDevice(id, changes) {
  try {
    const updated = await safeAxiosRequest(() => http.put(`/devices/${id}`, changes))
    return updated
  } catch (err) {
    console.warn('PUT /devices/:id failed \u2014 falling back to client-only update', err)
    return { id, ...changes }
  }
}

export async function deleteDevice(id) {
  try {
    await safeAxiosRequest(() => http.delete(`/devices/${id}`))
    return true
  } catch (err) {
    console.warn('DELETE /devices/:id failed \u2014 falling back to client-only delete', err)
    return true
  }
}