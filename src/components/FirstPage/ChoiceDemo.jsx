import React from 'react'
import { BsBadgeCcFill } from "react-icons/bs";
import { FaVideo } from "react-icons/fa";
import { GoArrowRight,GoArrowLeft } from "react-icons/go";

//css
import "../../assets/t.css";

const ChoiceDemo = () => {
  const options = [
    {
      icon: <BsBadgeCcFill className="text-[40px] text-[#6875FF]" />,
      title: "Text to Video",
    },
    {
      icon: <FaVideo className="text-[40px] text-[#6875FF]" />,
      title: "Video to Text",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="flex flex-wrap items-center justify-center gap-8">
        {options.map((item, index) => (
          <div
            key={index}
            className="
            flex flex-row items-center justify-center gap-[5px]
            w-[210px] h-[60px] bg-white rounded-2xl shadow-md p-6
              hover:shadow-xl hover:scale-105 transition duration-300 border border-transparent hover:border-[#6875FF] cursor-pointer"
          >
            <div>{item.icon}</div>
            <h3 className="text-lg font-bold text-[#333]">{item.title}</h3>
          </div>
        ))}
      </div>

      {/* demo */}
      <div className="flex flex-col items-center mt-[50px] w-full">
      <div className='text-[20px] text-center max-w-[800px]'>
        เปลี่ยนคำพูดของคุณเป็นวิดีโอเพียง
        <span className='text-[#6875FF]'> คลิกด้วยเครื่องสร้างข้อความเป็นวิดีโอของเรา</span>
      </div>

      <div className='w-full h-[500px] mt-[50px] rounded-2xl flex items-center justify-center gap-[50px] px-6 relative'>
        
        {/* Left Button */}
        <button className="w-[50px] h-[50px] rounded-full bg-[#f0f0f0] hover:bg-[#6875FF] hover:text-white flex items-center justify-center shadow-md transition">
          <GoArrowLeft />
        </button>

        {/* Bideo Center Placeholder */}
        <div className="
        outline-2 outline-white outline-offset-[20px]
        w-[1000px] h-[500px] video-demo-bg rounded-xl flex items-center justify-center shadow-inner text-black font-bold text-[70px] text-lg">
          Video demo
        </div>

        {/* Right Button */}
        <button className="w-[50px] h-[50px] rounded-full bg-[#f0f0f0] hover:bg-[#6875FF] hover:text-white flex items-center justify-center shadow-md transition">
          <GoArrowRight />
        </button>
      </div>
    </div>
    </div>
  );
};

export default ChoiceDemo;
