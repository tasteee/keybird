import { observable, action, computed } from 'mobx'

class AuthStore {
	@observable accessor user = null
	@observable accessor error = null

	@computed get isAuthenticated() {
		return !!this.user
	}

	@action authenticate = (email: string, password: string) => {
		this.user = { email, password } // Simulate user object
		this.error = null
		console.log('User authenticated:', this.user)
	}
}

export const $auth = new AuthStore()
