import { useEffect, useState } from 'react'
import { getCourseBlocks, getOfferings } from '../services/data'
import type { CourseBlock, FormData, Offering } from '../types'
function uniqueBlocks(list: CourseBlock[]): CourseBlock[] {
  const seen = new Map<string, CourseBlock>()
  list.forEach(b => {
    if (!seen.has(b.block_code)) seen.set(b.block_code, b)
  })
  return [...seen.values()]
}

type Props = {
  value: FormData
  onChange: (d: FormData) => void
  onSubmit: () => void
}

export default function FormPage({ value, onChange, onSubmit }: Props) {
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [courseBlocks, setCourseBlocks] = useState<CourseBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const semester = value.hocKy ? `${value.hocKy} 2026-2027` : ''

  useEffect(() => {
    if (step !== 3 || !semester) return
    setLoading(true)
    setLoadError(null)
    Promise.all([getOfferings(semester), getCourseBlocks()])
      .then(([o, b]) => {
        setOfferings(o)
        setCourseBlocks(b)
      })
      .catch((e: Error) => setLoadError(e.message))
      .finally(() => setLoading(false))
  }, [step, semester])

  const set = (patch: Partial<FormData>) => onChange({ ...value, ...patch })

  function next() {
    const e: Record<string, string> = {}
    if (step === 1) {
      if (!value.namHoc) e.namHoc = 'Vui lòng chọn năm học'
      if (!value.hocKy) e.hocKy = 'Vui lòng chọn học kỳ'
    }
    if (step === 2 && !value.tinhHuong) e.tinhHuong = 'Vui lòng chọn một tình huống'
    setErrors(e)
    if (Object.keys(e).length === 0) setStep(s => s + 1)
  }

  // Gom các lớp theo mã học phần
  const groups = Object.values(
    offerings.reduce<Record<string, Offering[]>>((acc, o) => {
      ;(acc[o.course_code] ??= []).push(o)
      return acc
    }, {})
  )

  function toggle(classes: Offering[]) {
    const code = classes[0].course_code
    const picked = value.monDaChon.some(m => m.course_code === code)
    set({
      monDaChon: picked
        ? value.monDaChon.filter(m => m.course_code !== code)
        : [
            ...value.monDaChon,
            {
              course_code: code,
              name_vi: classes[0].name_vi,
              credits: classes[0].credits ?? 0,
              class_code: classes[0].class_code,
              language: classes[0].language,
              blocks: uniqueBlocks(courseBlocks.filter(b => b.course_code === code)),
            },
          ],
    })
  }

  function pickClass(code: string, class_code: string) {
    set({
      monDaChon: value.monDaChon.map(m =>
        m.course_code === code ? { ...m, class_code } : m
      ),
    })
  }

  return (
    <section className="card">
      <div className="progress">
        <div style={{ width: `${(step / 3) * 100}%` }} />
      </div>
      <p className="step-label">Bước {step} / 3</p>

      {step === 1 && (
        <div>
          <h2>Thông tin sinh viên</h2>
          <label>
            Ngành
            <input value="Ngôn ngữ Anh" disabled />
          </label>
          <label>
            Khóa
            <input value="QH2025" disabled />
          </label>
          <label>
            Hệ
            <input value="Thường" disabled />
          </label>
          <label>
            Năm học
            <select
              value={value.namHoc}
              onChange={e => set({ namHoc: e.target.value as FormData['namHoc'] })}
            >
              <option value="">-- Chọn --</option>
              <option value="1">Năm 1</option>
              <option value="2">Năm 2</option>
            </select>
          </label>
          {errors.namHoc && <p className="error">{errors.namHoc}</p>}
          <label>
            Học kỳ
            <select
              value={value.hocKy}
              onChange={e =>
                // Đổi học kỳ thì xóa các môn đã chọn ở học kỳ cũ
                set({ hocKy: e.target.value as FormData['hocKy'], monDaChon: [] })
              }
            >
              <option value="">-- Chọn --</option>
              <option value="HK1">HK1</option>
              <option value="HK2">HK2</option>
            </select>
          </label>
          {errors.hocKy && <p className="error">{errors.hocKy}</p>}
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Chọn tình huống</h2>
          {[
            ['b2', 'Học phần ngoại ngữ B2'],
            ['tin-chi', 'Số tín tự chọn ở mỗi khối'],
            ['kiem-tra', 'Kiểm tra lớp muốn đăng ký'],
          ].map(([v, label]) => (
            <label key={v} className="radio">
              <input
                type="radio"
                name="tinhHuong"
                value={v}
                checked={value.tinhHuong === v}
                onChange={() => set({ tinhHuong: v as FormData['tinhHuong'] })}
              />
              {label}
            </label>
          ))}
          {errors.tinhHuong && <p className="error">{errors.tinhHuong}</p>}
          <label>
            Câu hỏi thêm (không bắt buộc)
            <textarea
              value={value.cauHoi}
              onChange={e => set({ cauHoi: e.target.value })}
            />
          </label>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Chọn học phần và lớp ({semester})</h2>
          {loading && <p>Đang tải danh sách...</p>}
          {loadError && <p className="error">Không tải được dữ liệu: {loadError}</p>}
          {!loading && !loadError && groups.length === 0 && (
            <p>Không có học phần nào mở ở học kỳ này.</p>
          )}
          {groups.map(classes => {
            const code = classes[0].course_code
            const sel = value.monDaChon.find(m => m.course_code === code)
            return (
              <div key={code} className="course">
                <label>
                  <input
                    type="checkbox"
                    checked={!!sel}
                    onChange={() => toggle(classes)}
                  />
                  <strong>{code}</strong> {classes[0].name_vi} · {classes[0].credits ?? '?'} TC
                </label>
                <div className="meta">
                  {classes[0].language && (
                    <span className="badge">{classes[0].language}</span>
                  )}
                  {courseBlocks
                    .filter(b => b.course_code === code)
                    .map(b => (
                    <span key={b.block_code} className="badge">
                      {b.block_code} · {b.block_name_vi}
                    </span>
                  ))}
                </div>
                {sel && (
                  <select
                    value={sel.class_code}
                    onChange={e => pickClass(code, e.target.value)}
                  >
                    {classes.map(c => (
                      <option key={c.class_code} value={c.class_code}>
                        {c.class_code} · {c.schedule_thu} tiết {c.schedule_tiet} · {c.lecturer ?? ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="actions">
        {step > 1 && (
          <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>
            Quay lại
          </button>
        )}
        {step < 3 && (
          <button className="btn" onClick={next}>Tiếp</button>
        )}
        {step === 3 && (
          <button
            className="btn"
            onClick={onSubmit}
            disabled={value.monDaChon.length === 0}
          >
            Gửi
          </button>
        )}
      </div>
    </section>
  )
}