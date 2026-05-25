import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user:  JSON.parse(localStorage.getItem('rw_user') || 'null'),
  token: localStorage.getItem('rw_token') || null,
  login: (token, user) => {
    localStorage.setItem('rw_token', token)
    localStorage.setItem('rw_user', JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('rw_token')
    localStorage.removeItem('rw_user')
    set({ token: null, user: null })
  },
}))

export const useRideStore = create((set) => ({
  activeRide: null,
  setActiveRide: (ride) => set({ activeRide: ride }),
  clearActiveRide: () => set({ activeRide: null }),
}))
