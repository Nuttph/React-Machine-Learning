import { GoArrowRight } from "react-icons/go";
import { Link } from "react-router-dom";
//css
import "../../assets/t.css";
const Title = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-[56px] text-center">
        <div>ระบบแปลภาษามือ</div>
        <div>ด้วย AI เพื่อสังคมไร้กำแพง</div>
        <div className="text-[17px]">
          สะพานเชื่อมการสื่อสารเพิ่อเข้าใจที่เท่าเทียม
        </div>
      </div>
      <Link
      to={"/check-device"}
        className="
      mt-[50px] hover:scale-110
  w-[260px] h-[85px] text-[20px] flex flex-row items-center justify-center
  bg-g-b
  text-white font-semibold px-6 py-2 rounded-full shadow-md hover:opacity-90 transition cursor-pointer"
      >
        เริ่มต้นการใช้งาน
        <GoArrowRight className="text-[30px] ml-2" />
      </Link>
    </div>
  );
};

export default Title;
