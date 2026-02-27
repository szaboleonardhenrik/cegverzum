import { api } from './client'
import type { User, Module, UserModule, AdminStats, RequestLog, LogAggregateStats } from '../types'

export const adminApi = {
  // Users (all)
  listAllUsers: () => api.get<User[]>('/admin/users'),
  createUser: (data: { email: string; full_name?: string; password?: string; is_admin?: boolean; package?: string; monthly_price?: number }) =>
    api.post<User>('/admin/users', data),

  // Partners
  listPartners: () => api.get<User[]>('/admin/partners'),
  invitePartner: (email: string) => api.post<User>('/admin/partners', { email }),
  deactivatePartner: (userId: number) => api.patch<User>(`/admin/partners/${userId}/deactivate`),
  activatePartner: (userId: number) => api.patch<User>(`/admin/partners/${userId}/activate`),

  // Full user update
  updateUser: (userId: number, data: Partial<{ email: string; full_name: string; is_admin: boolean; is_active: boolean; package: string; monthly_price: number }>) =>
    api.patch<User>(`/admin/users/${userId}`, data),

  // Package management
  updateUserPackage: (userId: number, pkg: string, monthlyPrice: number) =>
    api.patch<User>(`/admin/users/${userId}/package`, { package: pkg, monthly_price: monthlyPrice }),

  // Role management
  toggleUserRole: (userId: number) => api.patch<User>(`/admin/users/${userId}/role`),

  // Delete user
  deleteUser: (userId: number) => api.delete(`/admin/users/${userId}`),

  // Stats
  getStats: () => api.get<AdminStats>('/admin/stats'),

  // Modules
  listModules: () => api.get<Module[]>('/admin/modules'),
  toggleModule: (moduleId: number) => api.patch<Module>(`/admin/modules/${moduleId}`),
  listUserModules: (userId: number) => api.get<UserModule[]>(`/admin/users/${userId}/modules`),
  toggleUserModule: (userId: number, moduleId: number) =>
    api.patch<UserModule>(`/admin/users/${userId}/modules/${moduleId}`),

  // Logs
  getLogs: (params?: { skip?: number; limit?: number; method?: string; path?: string; status_code?: number; user_id?: number }) => {
    const qs = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
      })
    }
    const q = qs.toString()
    return api.get<RequestLog[]>(`/admin/logs${q ? '?' + q : ''}`)
  },
  getLogStats: () => api.get<LogAggregateStats>('/admin/logs/stats'),
}
