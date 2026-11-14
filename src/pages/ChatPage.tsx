import remarkGfm from 'remark-gfm'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { askDify } from '../services/askDify'
import type { FormData } from '../types'

const labels: Record<string, string> = {
  b2: 'Học phần B2',
  'tin-chi': 'Số tín tự chọn',
  'kiem-tra': 'Kiểm tra lớp',
}

type Msg = { role: 'user' | 'bot'; text: string }

type Props = { data: FormData; onEdit: () => void }

export default function ChatPage({ data, onEdit }: Props) {
  const [thinking, setThinking] = useState(true)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [run, setRun] = useState(0)
  const [fb, setFb] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    let alive = true
    setThinking(true)
    setFb(null)
    askDify(data).then(text => {
      if (!alive) return
      setMsgs([{ role: 'bot', text }])
      setThinking(false)
    })
    return () => {
      alive = false
    }
  }, [data, run])

  function send() {
    const q = input.trim()
    if (!q) return
    setMsgs(m => [
      ...m,
      { role: 'user', text: q },
      { role: 'bot', text: 'Chức năng hỏi đáp sẽ được kết nối ở bước sau.' },
    ])
    setInput('')
  }

  if (thinking) {
    return (
      <section className="card center">
        <p>Đang phân tích...</p>
      </section>
    )
  }

  return (
    <section className="chat">
      <div className="card summary">
        <p>
          <strong>Ngành:</strong> Ngôn ngữ Anh · <strong>Khóa:</strong> QH2025 ·{' '}
          <strong>Hệ:</strong> Thường
        </p>
        <p>
          <strong>Năm:</strong> {data.namHoc} · <strong>Học kỳ:</strong> {data.hocKy} 2026-2027 ·{' '}
          <strong>Tình huống:</strong> {labels[data.tinhHuong] ?? '-'}
        </p>
        <p>
          <strong>Môn đã chọn:</strong>{' '}
          {data.monDaChon.map(m => `${m.course_code} (${m.class_code})`).join(', ') || 'chưa chọn'}
        </p>
      </div>

      <div className="messages">
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role === 'bot' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown> : m.text}
          </div>
        ))}
      </div>

      <div className="bot-actions">
        <button className="btn-ghost" onClick={onEdit}>Sửa thông tin</button>
        <button className="btn-ghost" onClick={() => setRun(r => r + 1)}>Mô phỏng lại</button>
        <button className="btn-ghost" onClick={() => window.print()}>Tải kết quả (PDF)</button>
        <button className="btn-ghost" onClick={() => setFb('up')}>👍</button>
        <button className="btn-ghost" onClick={() => setFb('down')}>👎</button>
        {fb && <span className="muted">Đã ghi nhận (chưa lưu)</span>}
      </div>

      <div className="ask">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Hỏi thêm..."
        />
        <button className="btn" onClick={send}>Gửi</button>
      </div>
    </section>
  )
}