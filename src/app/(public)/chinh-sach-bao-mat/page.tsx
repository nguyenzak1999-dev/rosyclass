"use client"

import { motion } from "framer-motion"
import { ShieldCheck } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col w-full min-h-screen pb-20">
      <section className="pt-24 pb-20 bg-[#fcf5eb] overflow-hidden">
        <div className="max-w-[1200px] px-4 sm:px-8 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full bg-white border border-[#e9edef] px-4 py-1.5 text-[14px] text-[#54656f] font-medium mb-6 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 mr-2 text-[#25d366]" /> Thông tin pháp lý
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[40px] md:text-[56px] font-medium tracking-tight text-[#111b21] mb-6 leading-tight"
          >
            Chính sách bảo mật
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-[#54656f] text-[18px] leading-relaxed"
          >
            Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn một cách an toàn và minh bạch nhất.
          </motion.p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[800px] px-4 sm:px-8 mx-auto bg-white rounded-[24px] p-8 md:p-12 border border-[#e9edef] shadow-sm">
          <div className="prose prose-stone max-w-none text-[#54656f] prose-h2:text-[#111b21] prose-h2:text-[24px] prose-h2:font-medium prose-h2:mb-4 prose-p:leading-relaxed prose-p:mb-6">
            <h2>1. Thu thập thông tin</h2>
            <p>
              RosyClass thu thập các thông tin cá nhân cơ bản như họ tên, số điện thoại, và email khi bạn đăng ký nhận tư vấn, làm bài kiểm tra trình độ, hoặc tham gia khóa học tại trung tâm. 
              Các thông tin này chỉ được sử dụng cho mục đích liên hệ và cải thiện chất lượng dịch vụ.
            </p>
            
            <h2>2. Sử dụng thông tin</h2>
            <p>
              Thông tin của bạn được sử dụng để:
            </p>
            <ul className="list-disc pl-5 mb-6 space-y-2">
              <li>Sắp xếp lịch học và lớp học phù hợp.</li>
              <li>Cung cấp tài liệu và thông tin liên quan đến khóa học.</li>
              <li>Gửi các thông báo về lịch học, học phí, và các sự kiện tại trung tâm.</li>
            </ul>

            <h2>3. Bảo mật thông tin</h2>
            <p>
              Chúng tôi cam kết không bán, chia sẻ hay trao đổi thông tin cá nhân của học viên cho bất kỳ bên thứ ba nào, ngoại trừ các trường hợp theo yêu cầu của pháp luật. Dữ liệu của bạn được lưu trữ an toàn trên hệ thống máy chủ bảo mật.
            </p>

            <h2>4. Quyền của người dùng</h2>
            <p>
              Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình khỏi hệ thống của RosyClass bất cứ lúc nào bằng cách liên hệ với bộ phận hỗ trợ của chúng tôi qua email: contact@rosyclass.edu.vn.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
