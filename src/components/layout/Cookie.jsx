import React from 'react'

const Cookie = () => {
    const [isOpen, setIsOpen] = React.useState(true)
  return (
    <div className={`${isOpen ? "" : "hidden"} fixed bottom-[20px] left-[100px] right-[100px] bg-white rounded-lg shadow-2xl px-[20px] py-[10px] flex items-center justify-between`}>
      <div>
        <span className='font-bold'>คุณชอบคุกกี้ไหม</span> 🍪 เราใช้คุกกี้เพื่อให้แน่ใจว่าคุณได้รับประสบการณ์ที่ดีสุดบนเว็บไซต์ของเรา
        <span className='underline text-[#6875FF] ml-2 cursor-pointer'>เรียนรู้เพิ่มเติม</span>
      </div>
      <div>
        <button
        onClick={() => setIsOpen(false)}
        className='bg-[#6875FF] text-white w-[100px] h-[45px] rounded-full cursor-pointer shadow-2xl flex items-center justify-center'>
          Accept
        </button>
      </div>
    </div>
  )
}

export default Cookie
