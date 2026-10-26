import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import { RoleProvider } from './context/RoleContext'
import { DateRangeProvider } from './context/DateRangeContext'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <RoleProvider>
          <DateRangeProvider>
            <App />
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
          </DateRangeProvider>
        </RoleProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
