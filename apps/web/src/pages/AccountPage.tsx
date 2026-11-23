import { UserRound } from 'lucide-react'
import DemoPanel from '../components/DemoPanel'

export default function AccountPage() {
  return (
    <div className="stack stack--large">
      <h1 className="page-title">Akun</h1>

      <section className="card card--lg stack">
        <div className="row">
          <UserRound size={24} aria-hidden="true" />
          <div className="stack">
            <strong>Raka Pratama</strong>
            <span className="muted">Simulasi pengguna · pesanan sendiri saja</span>
          </div>
        </div>
        <p className="muted">
          Data pesanan, laporan, dan preferensi disimpan per pengguna di localStorage.
        </p>
      </section>

      <DemoPanel />
    </div>
  )
}
