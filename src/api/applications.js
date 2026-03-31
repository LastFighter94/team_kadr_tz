import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:3000',
})

export const getApplications = (params) => http.get('/applications', { params })

export const putApplication = (id, data) => http.put(`/applications/${id}`, data)