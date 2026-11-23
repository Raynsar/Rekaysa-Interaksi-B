import { FlaskConical, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function DemoPanel() {
  const { demo, actions } = useApp()

  const updatePriceOverride = (raw: string) => {
    const parsed = Number(raw)
    actions.setDemoFlag('priceOverride', raw === '' || Number.isNaN(parsed) ? undefined : parsed)
  }

  return (
    <section className="card stack demo-panel" aria-label="Panel Demo">
      <div className="row">
        <FlaskConical size={20} aria-hidden="true" />
        <div className="stack">
          <h2 className="section-title">Panel Demo</h2>
          <span className="muted">
            Alat uji internal, bukan bagian dari alur belanja normal.
          </span>
        </div>
      </div>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={demo.failStorageWrite}
          onChange={(event) => actions.setDemoFlag('failStorageWrite', event.target.checked)}
        />
        <span>Force gagal tulis localStorage (AC-039)</span>
      </label>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={demo.failNotification}
          onChange={(event) => actions.setDemoFlag('failNotification', event.target.checked)}
        />
        <span>Force gagal notifikasi (AC-021)</span>
      </label>

      <div className="field">
        <label className="field__label" htmlFor="demo-price-override">
          Override harga produk (AC-040)
        </label>
        <input
          id="demo-price-override"
          className="input"
          type="number"
          min={0}
          value={demo.priceOverride ?? ''}
          onChange={(event) => updatePriceOverride(event.target.value)}
          placeholder="Kosongkan untuk harga normal"
        />
      </div>

      <div className="notice__actions">
        <button type="button" className="button button--outline" onClick={actions.resetDemo}>
          <RotateCcw size={16} aria-hidden="true" />
          Reset Demo
        </button>
        <button type="button" className="button button--outline" onClick={actions.resetAll}>
          Reset Semua Data
        </button>
      </div>
    </section>
  )
}
