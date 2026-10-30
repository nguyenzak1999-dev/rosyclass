// Route của các trang hệ thống, để trang xem trước dựng y như trên website (kể cả phần chức năng có sẵn)
import type { SystemPageSlug } from "@/lib/page-builder/constants"
import ChinhSachBaoMat from "../../chinh-sach-bao-mat/page"
import DangKy from "../../dang-ky/page"
import GiaoVien from "../../giao-vien/page"
import GocHocTap from "../../goc-hoc-tap/page"
import HoiDap from "../../hoi-dap/page"
import KhoaHoc from "../../khoa-hoc/page"
import KiemTraTrinhDo from "../../kiem-tra-trinh-do/page"
import LichKhaiGiang from "../../lich-khai-giang/page"
import LienHe from "../../lien-he/page"
import VeChungToi from "../../ve-chung-toi/page"

export const SYSTEM_PAGE_ROUTES: Record<SystemPageSlug, () => React.ReactNode> = {
  "khoa-hoc": KhoaHoc,
  "lich-khai-giang": LichKhaiGiang,
  "giao-vien": GiaoVien,
  "ve-chung-toi": VeChungToi,
  "goc-hoc-tap": GocHocTap,
  "hoi-dap": HoiDap,
  "lien-he": LienHe,
  "dang-ky": DangKy,
  "kiem-tra-trinh-do": KiemTraTrinhDo,
  "chinh-sach-bao-mat": ChinhSachBaoMat,
}
