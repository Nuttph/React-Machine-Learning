import React, { useState, useEffect } from 'react'
import { FaCheckCircle } from 'react-icons/fa'
import { GoArrowRight } from 'react-icons/go'
import { MdCameraAlt } from 'react-icons/md'

const CheckDevice = () => {
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(0)

  const checks = [
    {
      icon: <MdCameraAlt className="text-[30px] text-[#6875FF]" />,
      title: 'Device Access',
      description: 'ยินยอมให้เปิดใช้งานกล้อง',
    },
    {
      icon: <FaCheckCircle className="text-[30px] text-[#6875FF]" />,
      title: 'Preparing Camera Device',
      description: 'ตรวจสอบฟังก์ชันกล้อง',
    },
    {
      icon: <FaCheckCircle className="text-[30px] text-[#6875FF]" />,
      title: 'Device Access And Capabilities',
      description: 'ตรวจสอบระบบการทำงานของกล้อง',
    },
    {
      icon: <FaCheckCircle className="text-[30px] text-[#6875FF]" />,
      title: 'Browser Compatibility',
      description: 'ตรวจสอบความพร้อมของระบบปฏิบัติการและบราวเซอร์',
    },
  ]

  // Simulate progress
  useEffect(() => {
    let interval
    if (progress < 100) {
      interval = setInterval(() => {
        setProgress(prevProgress => {
          if (prevProgress < 100) {
            return prevProgress + 20
          } else {
            clearInterval(interval)
            return 100
          }
        })
      }, 1000) // Every 1 second
    }

    return () => clearInterval(interval)
  }, [progress])

  // Track completion state based on progress
  useEffect(() => {
    if (progress === 100) {
      setCompleted(checks.length)
    } else {
      setCompleted(Math.floor((progress / 100) * checks.length))
    }
  }, [progress])

  return (
    <div className="flex flex-col items-center mt-[50px] min-h-screen px-4 py-8 pb-[90px]">
      <div className="text-[28px] font-bold text-[#333]">ตรวจสอบความพร้อม</div>
      <div className="text-gray-600 mt-2">กรุณารอสักครู่ ระบบกำลังตรวจสอบอุปกรณ์ของท่าน</div>

      {/* Progress bar */}
      <div className='w-[500px] h-[20px] mt-6'>
        <div className="text-gray-500 text-sm justify-between flex items-center">
          <div>ความคืบหน้า</div>
          <div>{progress}%</div>
        </div>
        <div className="h-[10px] bg-gray-300 rounded-full mt-2 overflow-hidden">
          <div className="bg-green-500 h-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Checks */}
      <div className="flex flex-col gap-6 mt-10 w-full max-w-[1000px]">
        {checks.map((item, index) => (
          <div
            key={index}
            className={`bg-[#D0FFD9] border-2 rounded-xl shadow-md p-6 flex text-left hover:shadow-xl transition ${
              index < completed ? 'border-[#00E52A]' : 'border-gray-300'
            }`}
            style={{
              backgroundColor: index < completed ? '#D0FFD9' : '#F1F1F1', // สีเทาสำหรับขั้นตอนที่ยังไม่เสร็จ
            }}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              {item.icon}
            </div>

            {/* Title and Description */}
            <div className="ml-4 flex flex-col">
              <div className="text-lg font-semibold text-[#333]">{item.title}</div>
              <div className="text-gray-500 mt-2">{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className='shadow-2xl cursor-pointer mt-[50px] w-full bg-[#00E52A] max-w-[1000px] h-[60px] rounded-lg flex flex-row items-center justify-center gap-3 text-[20px]'>
        ดำเนินการต่อ <span><GoArrowRight/></span>
      </div>
    </div>
  )
}

export default CheckDevice
