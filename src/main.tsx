import { render } from 'preact'
import './index.css'
import './setupRemoteControl' // Configure remote control before app starts
import { App } from './app.tsx'

render(<App />, document.getElementById('app')!)
