# Kế hoạch dựng lại CMS RosyClass

*Đơn vị: Hộ Kinh Doanh Rosy Class · MST 001093004500 · Số 22A, ngõ 5, đường Dương Xá, Gia Lâm, Hà Nội*

## 1. Mục tiêu

1. Một hệ thống quản trị gọn, dễ dùng hằng ngày cho **giáo viên, giáo vụ và chủ trung tâm**, thay cho 25 mục menu rời rạc hiện nay.
2. Phân hệ riêng cho **Tiếng Anh lớp 1** (bé 6–7 tuổi): giáo trình theo Unit/Bài, lên lớp trên máy tính bảng, sao thưởng, nhận xét, bài tập và báo cáo gửi phụ huynh.
3. Phụ huynh xem được tình hình học của con trên điện thoại mà không phải hỏi giáo viên.
4. Giữ những phần đã làm tốt: page builder website, lớp học 3D, đăng nhập và phân quyền, hạ tầng Cloudflare.

## 2. Hiện trạng

| Vấn đề | Hệ quả |
| --- | --- |
| Menu có 25 mục, trộn lẫn CRM, đào tạo, tài chính và website | Giáo viên khó tìm việc của mình; mục nào cũng như nhau |
| Khoá học chỉ có tên, cấp độ và học phí; **không có giáo trình** | Không biết buổi nào dạy bài gì, không theo dõi được tiến độ chương trình |
| Đánh giá chỉ có điểm số chung (`Score`) | Không hợp với bé lớp 1: cần nhận xét theo kỹ năng, sao và huy hiệu thay cho điểm |
| Phụ huynh không có chỗ xem | Mọi trao đổi đi qua Zalo cá nhân của giáo viên, dễ thất lạc |
| Trang website có nhiều trang quản trị riêng (banner, cảm nhận, FAQ, cài đặt trang chủ) song song với page builder | Trùng lặp: sửa cùng một nội dung ở hai nơi |

Database mới bắt đầu từ trống (đã bỏ Supabase), nên có thể đổi cấu trúc dữ liệu thoải mái, **không phải chuyển dữ liệu cũ**.

## 3. Cấu trúc CMS mới

Menu gom lại thành 5 khu vực. Mỗi vai trò chỉ thấy khu vực của mình.

| Khu vực | Gồm | Ai dùng |
| --- | --- | --- |
| **Hôm nay** | Buổi dạy hôm nay, việc cần làm (điểm danh, chấm bài, gọi lead), thông báo | Mọi người, mở ra là thấy |
| **Đào tạo** | Chương trình học (giáo trình) · Lớp học · Lịch & buổi học · Lên lớp · Bài tập · Đánh giá & báo cáo | Giáo viên, giáo vụ |
| **Học viên & tuyển sinh** | Lead · Học viên · Phụ huynh · Xếp lớp · Kiểm tra trình độ | Tư vấn, giáo vụ |
| **Tài chính** | Học phí & công nợ · Phiếu thu (VietQR) · Lương giáo viên | Kế toán, chủ trung tâm |
| **Website** | Trang (page builder, kể cả trang chủ) · Góc học tập (blog) · Thư viện ảnh · Cài đặt website | Marketing |

**Thay đổi chính:**

- **Báo cáo** không còn là một mục riêng: biểu đồ nằm ngay trong khu vực tương ứng (chuyên cần trong Đào tạo, doanh thu trong Tài chính), cộng một trang tổng quan cho chủ trung tâm.
- **Website:** banner, cảm nhận, FAQ và cài đặt trang chủ được gộp hết vào page builder thành các khối. Bỏ 4 trang quản trị cũ.
- **Giao diện admin** dùng cùng phong cách với website (màu và font trẻ em) nhưng tiết chế hơn, tối ưu cho máy tính bảng vì giáo viên dùng ngay trong lớp.

## 4. Phân hệ Tiếng Anh lớp 1

### 4.1. Luồng công việc

```
Chương trình (vd. "Tiếng Anh lớp 1 – Học kỳ 1")
  └─ Unit 1: Hello!            ← mục tiêu, từ vựng, âm phonics, bài hát
       ├─ Bài 1, Bài 2, Bài 3  ← giáo án, tài liệu, trò chơi gợi ý
       └─ Kiểm tra cuối Unit   ← tiêu chí đánh giá theo kỹ năng
Lớp "Lớp 1A – Thứ 3/5" dùng chương trình trên
  └─ Buổi học ngày 12/11 ↔ gắn với "Unit 1 – Bài 2"
       ├─ Điểm danh (chạm chọn)
       ├─ Sao thưởng & nhận xét nhanh cho từng bé
       └─ Bài tập về nhà → phụ huynh nộp ảnh hoặc video → giáo viên chấm bằng sticker
Cuối tháng / cuối Unit → Báo cáo tiến bộ tự tổng hợp → gửi link cho phụ huynh
```

### 4.2. Chức năng

| Chức năng | Mô tả |
| --- | --- |
| **Chương trình học** | Soạn Unit và Bài: mục tiêu, từ vựng (kèm ảnh và âm thanh), mẫu câu, âm phonics, link bài hát hoặc video, tài liệu in. Nhân bản chương trình sang năm sau. |
| **Lịch dạy tự gắn bài** | Khi sinh lịch buổi học, hệ thống gán lần lượt Unit 1 – Bài 1, Bài 2… Nghỉ lễ thì tự dồn bài. Giáo viên luôn biết hôm nay dạy gì. |
| **Màn hình "Lên lớp"** (máy tính bảng) | Giáo án buổi hôm nay; điểm danh một chạm; bấm vào bé để tặng ⭐; chọn ngẫu nhiên bé trả lời; đồng hồ đếm giờ hoạt động; mở lớp học 3D với số sao từng bé. |
| **Sao thưởng & huy hiệu** | Sao theo buổi (tham gia, phát âm, làm bài, hành vi tốt), tích đủ thì nhận huy hiệu ("Siêu phát âm", "Chăm chỉ 10 buổi"). Có bảng xếp hạng thân thiện, không so điểm. |
| **Nhận xét nhanh** | Chọn emoji và câu mẫu ("Con phát âm /s/ rất rõ") cùng một dòng ghi chú; viết xong cả lớp chỉ mất khoảng 2 phút. |
| **Bài tập về nhà** | Giao theo bài: nghe bài hát, tô màu, nói 3 câu. Phụ huynh nộp ảnh hoặc ghi âm từ điện thoại; giáo viên chấm bằng sticker và một câu nhận xét. |
| **Đánh giá kỹ năng** | Cuối Unit: Nghe, Nói, Nhận biết chữ và âm, Viết (tô và chép), mỗi kỹ năng 3 mức (Cần cố gắng / Đạt / Tốt) theo chuẩn Cambridge Pre-A1 Starters. Không dùng thang điểm 10. |
| **Báo cáo tiến bộ** | Tự tổng hợp: chuyên cần, sao, bài tập đã nộp, biểu đồ kỹ năng, nhận xét của giáo viên. Mở bằng link trên điện thoại, in được PDF. |
| **Cổng phụ huynh** | Đăng nhập bằng số điện thoại qua link một lần gửi Zalo hoặc SMS. Xem lịch học, bài hôm nay, nhận xét, sao, bài tập; nộp bài; xem và thanh toán học phí. |

### 4.3. Dữ liệu cần thêm

| Bảng | Nội dung chính |
| --- | --- |
| `Curriculum` | Tên, khối lớp (Lớp 1), học kỳ, giáo trình gốc |
| `CurriculumUnit` | Thứ tự, tên, mục tiêu, từ vựng (JSON), âm phonics |
| `Lesson` | Thuộc Unit; thứ tự, giáo án, tài liệu, link media |
| `ClassSession.lessonId` | Buổi học gắn với bài |
| `SessionFeedback` | Bé × buổi: số sao theo tiêu chí, emoji, nhận xét |
| `Badge`, `StudentBadge` | Huy hiệu và thời điểm nhận |
| `Homework`, `HomeworkSubmission` | Bài tập theo buổi; bài nộp (ảnh hoặc âm thanh lưu trên Cloudinary), sticker chấm |
| `SkillAssessment` | Bé × Unit × kỹ năng → mức 1–3 |
| `ProgressReport` | Bé × kỳ: số liệu đã tổng hợp, nhận xét, link chia sẻ |
| `ParentAccess` | Phụ huynh × số điện thoại, token đăng nhập một lần |

Bảng `Score` hiện có được giữ cho các lớp lớn (IELTS, giao tiếp). Lớp 1 dùng sao và đánh giá kỹ năng thay thế.

## 5. Lộ trình

Mỗi giai đoạn khoảng 1–2 tuần và **dùng được ngay khi xong**, không chờ làm hết.

| Giai đoạn | Nội dung | Kết quả dùng được |
| --- | --- | --- |
| **0. Nền móng** | Khung admin mới (5 khu vực, màn "Hôm nay"), phân quyền theo khu vực, giao diện tối ưu cho máy tính bảng | Menu gọn, mỗi vai trò thấy đúng việc của mình |
| **1. Chương trình học** | Soạn Unit và Bài; gắn chương trình vào lớp; lịch tự gắn bài | Giáo viên biết buổi nào dạy gì |
| **2. Lên lớp** | Màn hình Lên lớp, điểm danh một chạm, sao thưởng, nhận xét nhanh, lớp học 3D có sao | Dùng ngay trong giờ học |
| **3. Bài tập & đánh giá** | Giao và chấm bài, đánh giá kỹ năng cuối Unit, báo cáo tiến bộ | Báo cáo tháng gửi được phụ huynh |
| **4. Cổng phụ huynh** | Đăng nhập bằng số điện thoại, xem tiến độ, nộp bài, xem học phí | Phụ huynh tự theo dõi |
| **5. Dọn dẹp** | Gộp banner, cảm nhận, FAQ vào page builder; bỏ trang cũ; báo cáo tổng quan cho chủ trung tâm | Hết trùng lặp |

## 6. Cần anh/chị quyết định trước khi bắt đầu

1. **Giáo trình lớp 1** dùng bộ nào: *Tiếng Anh 1 Global Success* (Bộ GD&ĐT, bám chương trình ở trường), *i-Learn Smart Start 1*, hay bộ Cambridge (*Family and Friends 1*, *Super Minds 1*)? Câu trả lời quyết định cấu trúc Unit và dữ liệu mẫu nạp sẵn.
2. **Một lớp bao nhiêu bé, học mấy buổi một tuần, mỗi buổi bao lâu?** (gợi ý: 8–12 bé, 2 buổi/tuần, 60–75 phút)
3. **Cổng phụ huynh** gửi link đăng nhập qua đâu: Zalo OA (cần đăng ký Zalo Official Account, tốn phí tin ZNS), SMS (tốn phí), hay chỉ cần giáo viên gửi link riêng cho từng phụ huynh (miễn phí, làm nhanh nhất)?
4. **Đập đi** đến mức nào: dựng lại cả admin (Đào tạo, Tuyển sinh, Tài chính, Website) theo lộ trình trên, hay trước mắt chỉ làm phân hệ Lớp 1 và giữ các phần khác như hiện tại?
5. Có muốn **bé** có màn hình riêng (chơi ôn từ vựng, xem sao của mình) không, hay chỉ phụ huynh?
