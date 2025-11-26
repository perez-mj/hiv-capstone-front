// src/api/users.js
import http from './http'

export async function getUsers() {
  const res = await http.get('/users')
  return res.data
}
