export default function IntroPage() {
  return (
    <section className="card">
      <h2>Giới thiệu RULEPATH</h2>
      <p>
        Nhiều sinh viên không biết mình đã chọn đủ tín chỉ theo khối hay chưa,
        hoặc lớp đã chọn có đúng đối tượng không. RULEPATH giúp bạn kiểm tra
        trước khi đăng ký.
      </p>
      <ol>
        <li>Nhập thông tin sinh viên và học kỳ.</li>
        <li>Chọn tình huống cần kiểm tra.</li>
        <li>Chọn học phần và lớp, rồi xem kết quả.</li>
      </ol>
      <p className="muted">RULEPATH – Bản demo MVP. Kết quả chỉ mang tính tham khảo.</p>
    </section>
  )
}