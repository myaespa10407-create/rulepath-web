import { useEffect, useState } from 'react'
import { getBlocks, getRules } from '../services/data'

type Row = Record<string, unknown>

function Table({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return <p>Không có dữ liệu.</p>
  const cols = Object.keys(rows[0])
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map(c => <td key={c}>{String(r[c] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState<'blocks' | 'rules' | 'logs'>('rules')
  const [rules, setRules] = useState<Row[]>([])
  const [blocks, setBlocks] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    Promise.all([getRules(), getBlocks()])
      .then(([r, b]) => {
        setRules(r)
        setBlocks(b)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section>
      <h2>Quản trị</h2>
      <div className="tabs">
        <button className={tab === 'rules' ? 'btn' : 'btn-ghost'} onClick={() => setTab('rules')}>Quy tắc</button>
        <button className={tab === 'blocks' ? 'btn' : 'btn-ghost'} onClick={() => setTab('blocks')}>Khối tự chọn</button>
        <button className={tab === 'logs' ? 'btn' : 'btn-ghost'} onClick={() => setTab('logs')}>Nhật ký và phản hồi</button>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && (
        <div>
          <p className="error">Lỗi: {error}</p>
          <button className="btn" onClick={load}>Thử lại</button>
        </div>
      )}

      {!loading && !error && tab === 'rules' && <Table rows={rules} />}
      {!loading && !error && tab === 'blocks' && <Table rows={blocks} />}
      {tab === 'logs' && (
        <p className="muted">
          Cần đăng nhập để xem nhật ký và phản hồi. Chức năng này sẽ bật sau khi có Supabase Auth.
        </p>
      )}
    </section>
  )
}