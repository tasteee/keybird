import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const reactPlugin = react({
	babel: {
		plugins: [['@babel/plugin-proposal-decorators', { version: '2023-05' }]]
	}
})

export default defineConfig({
	plugins: [reactPlugin, tsconfigPaths()]
})
