import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from '../utils/router'
import { useApp } from '../context/AppContext'
import { suggestedReportCategory } from '../services/demoData'
import type { ReportErrors } from '../services/reportService'
import ReportForm from '../components/ReportForm'
import NotFoundPage from './NotFoundPage'
import type { ReportFormValue } from '../types'

export default function ReportPage({ orderId }: { orderId: string }) {
  const { state, actions } = useApp()
  const order = state.orders.find((item) => item.id === orderId)
  const draft = state.reportDrafts[orderId]

  const [value, setValue] = useState<ReportFormValue>(() => {
    if (draft) return draft
    return order
      ? { category: suggestedReportCategory(order.status), description: '' }
      : { category: '', description: '' }
  })
  const [errors, setErrors] = useState<ReportErrors>({})
  const [successTicket, setSuccessTicket] = useState<string | null>(null)

  if (!order) return <NotFoundPage />

  const change = (next: ReportFormValue) => {
    setValue(next)
    setErrors({})
    setSuccessTicket(null)
    actions.saveDraft(order.id, next)
  }

  const submit = () => {
    const result = actions.submitReport(order.id, value)
    if (Object.keys(result.errors).length > 0) {
      setErrors(result.errors)
      return
    }
    if (result.storageFailed) {
      setErrors({ description: 'Laporan gagal dikirim. Silakan coba kembali.' })
      return
    }
    setSuccessTicket(result.ticket?.number ?? null)
    setValue({
      category: suggestedReportCategory(order.status),
      description: '',
    })
  }

  return (
    <div className="stack stack--large">
      <Link to={`/orders/${order.id}`} className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Kembali ke Detail Pesanan
      </Link>

      <ReportForm
        orderId={order.id}
        status={order.status}
        value={value}
        errors={errors}
        successTicket={successTicket}
        onChange={change}
        onSubmit={submit}
      />
    </div>
  )
}
