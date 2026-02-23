import { api } from './client'
import type { Token, User } from '../types'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<Token>('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post<Token>('/auth/register', { email, password }),
  getMe: () => api.get<User>('/auth/me'),
  changePassword: (old_password: string, new_password: string) =>
    api.patch<{ message: string }>('/auth/password', { old_password, new_password }),
}
