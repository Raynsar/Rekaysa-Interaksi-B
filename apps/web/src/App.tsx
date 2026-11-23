import AppShell from './components/AppShell'
import { ToastProvider } from './components/ToastProvider'
import { AppProvider } from './context/AppContext'
import { RouterProvider, matchRoute, useRouter } from './utils/router'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ReportPage from './pages/ReportPage'
import AccountPage from './pages/AccountPage'
import NotFoundPage from './pages/NotFoundPage'

function Routes() {
  const { path } = useRouter()

  if (path === '/') return <HomePage />
  if (path === '/product') return <ProductPage />
  if (path === '/cart') return <CartPage />
  if (path === '/checkout') return <CheckoutPage />
  if (path === '/orders') return <OrdersPage />
  if (path === '/account') return <AccountPage />

  const detail = matchRoute('/orders/:id', path)
  if (detail) return <OrderDetailPage orderId={detail.id} />

  const report = matchRoute('/report/:id', path)
  if (report) return <ReportPage orderId={report.id} />

  return <NotFoundPage />
}

export default function App({ initialNow }: { initialNow?: number } = {}) {
  return (
    <ToastProvider>
      <AppProvider initialNow={initialNow}>
        <RouterProvider>
          <AppShell>
            <Routes />
          </AppShell>
        </RouterProvider>
      </AppProvider>
    </ToastProvider>
  )
}
