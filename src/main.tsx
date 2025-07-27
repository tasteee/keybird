import '@radix-ui/themes/styles.css'
import './styles/reset.css'
import './styles/index.css'
// import './styles/theme.css'
import './styles/variables.css'
// import './styles/purpleTheme.css'
import './styles/fonts.css'
import './styles/accents.css'
import './styles/keycap.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { configure } from 'mobx'

configure({
	enforceActions: 'never'
})

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
