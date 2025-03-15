import { create } from 'zustand'

interface RegisterState {
	name: string
	email: string
	password: string
	confirmPassword: string
	setName: (name: string) => void
	setEmail: (email: string) => void
	setPassword: (password: string) => void
	setConfirmPassword: (confirmPassword: string) => void
	resetForm: () => void
}

const useRegisterStore = create<RegisterState>(set => ({
	name: '',
	email: '',
	password: '',
	confirmPassword: '',
	setName: name => set({ name }),
	setEmail: email => set({ email }),
	setPassword: password => set({ password }),
	setConfirmPassword: confirmPassword => set({ confirmPassword }),
	resetForm: () =>
		set({ name: '', email: '', password: '', confirmPassword: '' })
}))

export default useRegisterStore
