import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, GraduationCap, Users, CalendarCheck, CheckCircle2 } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-rose-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">RosyClass</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-rose-600 transition-colors">Trang chủ</a>
            <a href="#courses" className="hover:text-rose-600 transition-colors">Khoá học</a>
            <a href="#features" className="hover:text-rose-600 transition-colors">Vì sao chọn chúng tôi?</a>
            <a href="#teachers" className="hover:text-rose-600 transition-colors">Giáo viên</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:flex text-slate-700">Đăng nhập</Button>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-6">Đăng ký tư vấn</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-50 pt-16 md:pt-24 pb-32">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 via-transparent to-blue-50/50" />
          <div className="container relative mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 w-fit mx-auto md:mx-0 text-sm font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                  </span>
                  Tuyển sinh các lớp tháng 6
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                  Phá Bỏ Rào Cản <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-500">
                    Giao Tiếp Tiếng Anh
                  </span>
                </h1>
                <p className="text-lg text-slate-600 max-w-lg mx-auto md:mx-0">
                  Môi trường học tập chuẩn quốc tế, giáo trình hiện đại cùng đội ngũ giáo viên tận tâm giúp bạn chinh phục tiếng Anh dễ dàng hơn bao giờ hết.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 justify-center md:justify-start">
                  <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-8 h-14 text-base w-full sm:w-auto">
                    Thi thử miễn phí <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base w-full sm:w-auto border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
                    Tìm hiểu thêm
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 mt-8 justify-center md:justify-start">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-bold text-xs text-slate-600 z-30">1k+</div>
                    <div className="w-10 h-10 rounded-full bg-rose-200 border-2 border-white z-20"></div>
                    <div className="w-10 h-10 rounded-full bg-blue-200 border-2 border-white z-10"></div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    Hơn 1,000+ học viên <br/> đã tốt nghiệp xuất sắc.
                  </p>
                </div>
              </div>
              
              <div className="relative mt-8 md:mt-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 to-orange-300 rounded-[2rem] transform rotate-3 scale-105 blur-lg opacity-30 animate-pulse"></div>
                <Image 
                  src="/images/hero.png" 
                  alt="English Class" 
                  width={600} 
                  height={500} 
                  className="relative rounded-[2rem] shadow-2xl object-cover h-[400px] md:h-[500px] w-full"
                  priority
                />
                
                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100 animate-bounce" style={{animationDuration: '3s'}}>
                  <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Cam kết đầu ra</p>
                    <p className="text-xs text-slate-500">IELTS 6.5+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Phương Pháp Học Tập Tối Ưu</h2>
              <p className="text-slate-600 text-lg">Chúng tôi mang đến môi trường toàn diện giúp bạn phát triển cả 4 kỹ năng Nghe - Nói - Đọc - Viết.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: "Lớp Học Nhỏ", desc: "Tối đa 10 học viên/lớp đảm bảo tương tác liên tục với giáo viên." },
                { icon: BookOpen, title: "Giáo Trình Bản Quyền", desc: "Cập nhật liên tục từ các nhà xuất bản hàng đầu như Oxford, Cambridge." },
                { icon: CalendarCheck, title: "Lịch Học Linh Hoạt", desc: "Dễ dàng sắp xếp, đổi lịch và học bù qua hệ thống quản lý học viên." }
              ].map((item, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="h-14 w-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Courses Section */}
        <section id="courses" className="py-24 bg-slate-900 text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Khoá Học Nổi Bật</h2>
                <p className="text-slate-400 text-lg">Chọn lộ trình phù hợp với mục tiêu của bạn.</p>
              </div>
              <Button variant="outline" className="rounded-full text-slate-900 bg-white hover:bg-slate-100 border-none">
                Xem tất cả khoá học
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Course 1 */}
              <div className="group rounded-3xl bg-slate-800 border border-slate-700 overflow-hidden hover:border-rose-500 transition-colors">
                <div className="h-64 overflow-hidden bg-slate-700">
                  <Image src="/images/ielts.png" alt="IELTS Course" width={600} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 text-xs font-semibold bg-rose-500/20 text-rose-400 rounded-full">Người lớn</span>
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full">Luyện thi</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">IELTS Intensive 6.5+</h3>
                  <p className="text-slate-400 mb-6 line-clamp-2">Lộ trình học cấp tốc 3 tháng, tập trung chuyên sâu vào kỹ năng Writing & Speaking cùng cựu giám khảo.</p>
                  
                  <div className="flex items-center justify-between border-t border-slate-700 pt-6">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Thời lượng</p>
                      <p className="font-semibold text-white">3 Tháng / 36 Buổi</p>
                    </div>
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-full">Tìm hiểu thêm</Button>
                  </div>
                </div>
              </div>
              
              {/* Course 2 */}
              <div className="group rounded-3xl bg-slate-800 border border-slate-700 overflow-hidden hover:border-rose-500 transition-colors">
                <div className="h-64 overflow-hidden bg-slate-700">
                  <Image src="/images/kids.png" alt="Kids Course" width={600} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full">Trẻ em 6-11 tuổi</span>
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full">Giao tiếp</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">English for Kids (Starters)</h3>
                  <p className="text-slate-400 mb-6 line-clamp-2">Phương pháp vừa học vừa chơi, giúp trẻ phát triển ngữ âm chuẩn từ đầu và phản xạ tự nhiên.</p>
                  
                  <div className="flex items-center justify-between border-t border-slate-700 pt-6">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Thời lượng</p>
                      <p className="font-semibold text-white">6 Tháng / 48 Buổi</p>
                    </div>
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-full">Tìm hiểu thêm</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-orange-500" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)]" style={{ backgroundSize: '24px 24px' }}></div>
          <div className="container relative mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Bạn đã sẵn sàng để bắt đầu?</h2>
            <p className="text-rose-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">Đăng ký ngay hôm nay để nhận ưu đãi giảm 30% học phí và bộ quà tặng nhập học trị giá 1 triệu đồng.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-white text-rose-600 hover:bg-slate-50 h-14 rounded-full px-8 text-lg font-semibold shadow-lg">
                Đăng ký học ngay
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-14 rounded-full px-8 text-lg font-semibold bg-transparent backdrop-blur-sm">
                Làm bài kiểm tra trình độ
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-8 w-8 text-rose-600" />
                <span className="text-xl font-bold tracking-tight text-slate-900">RosyClass</span>
              </div>
              <p className="text-slate-600 max-w-sm">Hệ thống giáo dục tiếng Anh hàng đầu, cam kết chất lượng đào tạo và trải nghiệm học tập tuyệt vời.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Liên kết</h4>
              <ul className="space-y-2 text-slate-600">
                <li><a href="#" className="hover:text-rose-600 transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-rose-600 transition-colors">Khoá học</a></li>
                <li><a href="#" className="hover:text-rose-600 transition-colors">Lịch khai giảng</a></li>
                <li><a href="#" className="hover:text-rose-600 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-slate-600">
                <li>Hotline: 1900 xxxx</li>
                <li>Email: hello@rosyclass.edu.vn</li>
                <li>Địa chỉ: Quận 1, TP. HCM</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
            <p>© 2026 RosyClass. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-900">Điều khoản</a>
              <a href="#" className="hover:text-slate-900">Bảo mật</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
