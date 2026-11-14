import type { FormData } from '../types'

// Tín theo khối là dữ liệu thật; phần kết luận là mẫu – sau này thay bằng Dify
export async function askDify(d: FormData): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Cộng tín theo từng khối TC
  const byBlock = new Map<string, { name: string; max: number | null; total: number }>()
  for (const m of d.monDaChon) {
    for (const b of m.blocks) {
      if (b.requirement !== 'TC' || b.block_code === 'I') continue
      const cur = byBlock.get(b.block_code) ?? { name: b.block_name_vi, max: b.max_credits, total: 0 }
      cur.total += m.credits
      byBlock.set(b.block_code, cur)
    }
  }

  const overs = [...byBlock.entries()].filter(([, v]) => v.max !== null && v.total > v.max)

  const header = '| Khối | Tín đã chọn | Giới hạn | Trạng thái |\n|---|---|---|---|'
  const rows = [...byBlock.entries()].map(([code, v]) => {
    const status = v.max !== null && v.total > v.max ? `Vượt ${v.total - v.max} TC` : 'Trong giới hạn'
    return `| ${code} – ${v.name} | ${v.total} | ${v.max ?? '-'} | ${status} |`
  })
  const table = rows.length ? `${header}\n${rows.join('\n')}` : `${header}\n| - | 0 | - | Chưa chọn học phần tự chọn |`

  const warnings = overs.length
    ? overs.map(([code, v]) => `- **Nghiêm trọng:** khối ${code} vượt ${v.total - (v.max ?? 0)} TC.`).join('\n')
    : '- Không có khối nào vượt giới hạn.'

  const list = d.monDaChon.length
    ? d.monDaChon
        .map(m => `- ${m.course_code} ${m.name_vi} (${m.credits} TC, lớp ${m.class_code}, ${m.language ?? 'chưa rõ ngôn ngữ'})`)
        .join('\n')
    : '- Chưa chọn học phần'

  const conclusion = overs.length
    ? `Bạn đang vượt giới hạn tín chỉ ở ${overs.length} khối. Cần bỏ bớt học phần trước khi đăng ký.`
    : 'Các khối đang trong giới hạn tín chỉ. Vẫn cần đối chiếu cổng đăng ký chính thức.'

  return `**Kết luận:** ${conclusion}

**Chi tiết theo khối:**

${table}

**Cảnh báo:**
${warnings}

**Hệ quả:** Học phí và GPA sẽ được tính khi có dữ liệu thật.

**Việc cần làm:**
${list}

**Nguồn:** [CTĐT NNA – mục III.2]

Kết quả mang tính tham khảo, cần đối chiếu cổng đăng ký chính thức.`
}