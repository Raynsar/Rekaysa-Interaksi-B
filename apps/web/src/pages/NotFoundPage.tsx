import { Link } from '../utils/router'

export default function NotFoundPage() {
  return (
    <div className="card card--lg stack not-found">
      <span className="hero__eyebrow">404</span>
      <h1 className="page-title">Halaman tidak ditemukan</h1>
      <p className="muted">Alamat yang kamu buka tidak dikenal.</p>
      <Link to="/" className="button button--primary">
        Kembali ke Beranda
      </Link>
    </div>
  )
}
