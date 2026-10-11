import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './base.css'
import './coach.css'
import AdminRoot from './AdminRoot.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminRoot />
  </StrictMode>,
)
