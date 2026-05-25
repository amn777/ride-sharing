import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1', timeout: 15000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rw_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rw_token')
      localStorage.removeItem('rw_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
}

export const rideApi = {
  request:      (data)       => api.post('/rides/request', data),
  getById:      (id)         => api.get(`/rides/${id}`),
  myRides:      ()           => api.get('/rides/my-rides'),
  driverRides:  ()           => api.get('/rides/driver-rides'),
  startRide:    (id, otp)    => api.post(`/rides/${id}/start?otp=${otp}`),
  completeRide: (id, data)   => api.post(`/rides/${id}/complete`, data),
  cancelRide:   (id, reason) => api.post(`/rides/${id}/cancel?reason=${encodeURIComponent(reason)}`),
}

export const driverApi = {
  goOnline:       (lat, lng) => api.post(`/drivers/go-online?lat=${lat}&lng=${lng}`),
  goOffline:      ()         => api.post('/drivers/go-offline'),
  updateLocation: (lat, lng) => api.post(`/drivers/location?lat=${lat}&lng=${lng}`),
}

export const ratingApi = {
  submit: (data) => api.post('/ratings', data),
}

export default api
