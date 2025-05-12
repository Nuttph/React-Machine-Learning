import { RiArrowDropDownLine } from "react-icons/ri";
import Container from "./Container";

const Navbar = () => {
  const options = [
    { id: 1, name: "ฟีเจอร์" },
    { id: 2, name: "กรณีการใช้งาน" },
    { id: 3, name: "แหล่งข้อมูล" },
    { id: 4, name: "ติดต่อ" },
  ];
  return (
    <Container>
      <div
        className="
    text-[18px]
    flex flex-row justify-between items-center
    bg-[#D9D9D9] border-2 border-[#fff] px-[50px] rounded-full py-[20px]"
      >
        <div className="flex flex-row gap-[20px] items-center">
          <div className="font-bold text-[35px]">Logo</div>
          {options.map((item) => (
            <div
              key={item.id}
              className="flex flex-row items-center cursor-pointer"
            >
              <div className="text-[#000] ">{item.name}</div>
              {item.id !== 4 && <RiArrowDropDownLine size={30} color="#000" />}
            </div>
          ))}
        </div>
        <div className="flex flex-row gap-[20px] items-center">
          <div className="flex items-center cursor-pointer">
            ภาษาไทย <RiArrowDropDownLine size={30} color="#000" />
          </div>
          <div className="flex flex-row items-center gap-[10px]">
            <button className="text-[#000]  bg-white w-[100px] items-center justify-center flex h-[50px] rounded-full cursor-pointer shadow-2xl">
              Login
            </button>
            <button className="bg-[#000] text-[#fff] w-[100px] items-center justify-center flex h-[50px] rounded-full cursor-pointer shadow-2xl">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Navbar;
