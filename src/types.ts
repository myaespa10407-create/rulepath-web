export type Offering = {
  course_code: string
  name_vi: string
  name_en: string | null
  credits: number | null
  is_elective: boolean | null
  allow_year1: string
  class_code: string
  semester: string
  schedule_thu: string | null
  schedule_tiet: string | null
  room: string | null
  lecturer: string | null
  status: string
  language: string | null
}

export type CourseBlock = {
  course_code: string
  block_code: string
  requirement: 'BB' | 'TC' | 'CHOOSE_1' | 'CHOOSE' | 'CONDITION'
  block_name_vi: string
  max_credits: number | null
}

export type SelectedCourse = {
  course_code: string
  name_vi: string
  credits: number
  class_code: string
  language: string | null
  blocks: CourseBlock[]
}

export type FormData = {
  namHoc: '' | '1' | '2'
  hocKy: '' | 'HK1' | 'HK2'
  tinhHuong: '' | 'b2' | 'tin-chi' | 'kiem-tra'
  cauHoi: string
  monDaChon: SelectedCourse[]
}

export const emptyForm: FormData = {
  namHoc: '',
  hocKy: '',
  tinhHuong: '',
  cauHoi: '',
  monDaChon: [],
}