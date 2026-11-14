import { useState } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import ChatPage from './pages/ChatPage'
import FormPage from './pages/FormPage'
import IntroPage from './pages/IntroPage'
import { emptyForm, type FormData } from './types'

function Home() {
  const [draft, setDraft] = useState<FormData>(emptyForm)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return <ChatPage data={draft} onEdit={() => setSubmitted(false)} />
  }
  return (
    <FormPage value={draft} onChange={setDraft} onSubmit={() => setSubmitted(true)} />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <header className="topbar">
        <Link to="/" className="brand">RULEPATH</Link>
        <nav>
          <Link to="/gioi-thieu">Giới thiệu</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gioi-thieu" element={<IntroPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>

      <footer className="footer">
        RULEPATH – Bản demo MVP. Kết quả chỉ mang tính tham khảo.
      </footer>
    </BrowserRouter>
  )
}