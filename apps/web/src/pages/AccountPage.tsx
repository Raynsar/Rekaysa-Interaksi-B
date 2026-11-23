import { Settings, UserRound } from 'lucide-react'
import { useToast } from '../components/ToastProvider'

export default function AccountPage() {
  const { showToast } = useToast()

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
          Data pesanan disimpan terpisah per pengguna dalam localStorage pada fase berikutnya.
        </p>
      </section>

      <section className="card stack">
        <h2 className="section-title">Pengaturan</h2>
        <button
          type="button"
          className="button button--outline"
          onClick={() => showToast('Panel Demo akan tersedia pada Phase 4.', 'info')}
        >
          <Settings size={16} aria-hidden="true" />
          Buka Panel Demo
        </button>
        <span className="muted">Panel Demo dipakai untuk menguji skenario gagal dan perubahan harga.</span>
      </section>
    </div>
  )
}
