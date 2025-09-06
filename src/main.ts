import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Welcome to my Todo App!</h1>
    <button id="counter" type="button">Add a Category</button>
  </div>
`

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
