import { supabase } from '../lib/supabase'

// Lớp đang mở theo học kỳ (quy tắc UI-01 được áp dụng ở đây)
export async function getOfferings(semester: string) {
  const { data, error } = await supabase
    .from('v_course_offerings')
    .select('*')
    .eq('semester', semester)
  if (error) throw error
  return data
}

export async function getRules() {
  const { data, error } = await supabase.from('rules').select('*')
  if (error) throw error
  return data
}

export async function getBlocks() {
  const { data, error } = await supabase.from('elective_blocks').select('*')
  if (error) throw error
  return data
}

export async function getCourseBlocks() {
  const { data, error } = await supabase.from('v_course_blocks').select('*')
  if (error) throw error
  return data
}