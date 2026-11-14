import type { FormData } from '../types'

const labels: Record<string, string> = {
  b2: 'Học phần B2',
  'tin-chi': 'Số tín tự chọn',
  'kiem-tra': 'Kiểm tra lớp',
}

// Gom tín theo khối TC (khối I không tính B2)
function blockTotals(d: FormData) {
  const map = new Map<string, { name: string; max: number | null; total: number }>()
  for (const m of d.monDaChon) {
    for (const b of m.blocks) {
      if (b.requirement !== 'TC' || b.block_code === 'I') continue
      const cur = map.get(b.block_code) ?? { name: b.block_name_vi, max: b.max_credits, total: 0 }
      cur.total += m.credits
      map.set(b.block_code, cur)
    }
  }
  return [...map.entries()].map(([code, v]) => ({
    block_code: code,
    block_name: v.name,
    total: v.total,
    max: v.max,
    over: v.max !== null && v.total > v.max,
  }))
}

export async function askDify(d: FormData): Promise<string> {
  const totals = blockTotals(d)
  const mon = d.monDaChon.map(m => ({
    course_code: m.course_code,
    name: m.name_vi,
    credits: m.credits,
    class_code: m.class_code,
    language: m.language,
  }))

  const res = await fetch('/api/ask-dify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `Năm ${d.namHoc}, ${d.hocKy} 2026-2027, tình huống: ${labels[d.tinhHuong] ?? ''}. ${d.cauHoi}`,
      inputs: {
        nam_hoc: d.namHoc,
        hoc_ky: d.hocKy,
        tinh_huong: labels[d.tinhHuong] ?? '',
        mon_da_chon: JSON.stringify(mon),
        tong_tin_theo_khoi: JSON.stringify(totals),
      },
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Lỗi khi gọi Dify')
  return data.answer as string
}