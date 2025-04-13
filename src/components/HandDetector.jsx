import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import Webcam from "react-webcam";

const HandDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [handPresence, setHandPresence] = useState(false);
  const [leftHand, setLeftHand] = useState({ count: 0, fingers: [] });
  const [rightHand, setRightHand] = useState({ count: 0, fingers: [] });
  const handLandmarkerRef = useRef(null);

  // โหลดโมเดล HandLandmarker
  const initializeHandDetection = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
        },
        numHands: 2,
        runningMode: "video",
      });
      handLandmarkerRef.current = handLandmarker;
      detectHands();
    } catch (error) {
      console.error("Error initializing hand detection:", error);
    }
  };

  // ฟังก์ชันตรวจจับมือและท่าทาง
  const detectHands = () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      handLandmarkerRef.current
    ) {
      const video = webcamRef.current.video;
      const timestamp = performance.now();
      const detections = handLandmarkerRef.current.detectForVideo(video, timestamp);

      // อัปเดตสถานะว่ามีมือหรือไม่
      setHandPresence(detections.handednesses.length > 0);

      // แสดงพิกัด landmarks ใน console
      detections.landmarks.forEach((landmarks, handIndex) => {
        console.log(`Hand ${handIndex + 1} Landmarks:`);
        landmarks.forEach((landmark, index) => {
          console.log(
            `  Landmark ${index}: x=${landmark.x.toFixed(3)}, y=${landmark.y.toFixed(
              3
            )}, z=${landmark.z.toFixed(3)}`
          );
        });
      });

      // ตรวจจับท่านิ้วสำหรับมือซ้ายและมือขวา
      detectFingerGestures(detections);

      // วาดจุดสำคัญบน Canvas
      drawLandmarks(detections.landmarks);
    }
    requestAnimationFrame(detectHands);
  };

  // ฟังก์ชันตรวจจับท่านิ้ว
  const detectFingerGestures = (detections) => {
    // รีเซ็ตข้อมูลมือ
    setLeftHand({ count: 0, fingers: [] });
    setRightHand({ count: 0, fingers: [] });

    detections.handednesses.forEach((handedness, index) => {
      const landmarks = detections.landmarks[index];
      const handLabel = handedness[0].categoryName; // "Left" หรือ "Right"

      // ดึงจุดสำคัญของนิ้วต่างๆ
      const wrist = landmarks[0]; // ข้อมือ
      const thumbTip = landmarks[4]; // ปลายนิ้วโป้ง
      const indexTip = landmarks[8]; // ปลายนิ้วชี้
      const middleTip = landmarks[12]; // ปลายนิ้วกลาง
      const ringTip = landmarks[16]; // ปลายนิ้วนาง
      const pinkyTip = landmarks[20]; // ปลายนิ้วก้อย

      // ตรวจสอบว่านิ้วใดยกขึ้น
      const fingers = [];
      if (thumbTip.y < wrist.y - 0.1) fingers.push("นิ้วโป้ง");
      if (indexTip.y < wrist.y - 0.1) fingers.push("นิ้วชี้");
      if (middleTip.y < wrist.y - 0.1) fingers.push("นิ้วกลาง");
      if (ringTip.y < wrist.y - 0.1) fingers.push("นิ้วนาง");
      if (pinkyTip.y < wrist.y - 0.1) fingers.push("นิ้วก้อย");

      // นับจำนวนนิ้วที่ยกขึ้น
      const fingerCount = fingers.length;

      // อัปเดตข้อมูลมือ
      if (handLabel === "Left") {
        setLeftHand({ count: fingerCount, fingers });
      } else if (handLabel === "Right") {
        setRightHand({ count: fingerCount, fingers });
      }
    });
  };

  // ฟังก์ชันวาดจุดสำคัญของมือ
  const drawLandmarks = (landmarksArray) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    landmarksArray.forEach((landmarks) => {
      landmarks.forEach((landmark) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
      });

      const connections = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4], // นิ้วโป้ง
        [0, 5],
        [5, 6],
        [6, 7],
        [7, 8], // นิ้วชี้
        [0, 9],
        [9, 10],
        [10, 11],
        [11, 12], // นิ้วกลาง
        [0, 13],
        [13, 14],
        [14, 15],
        [15, 16], // นิ้วนาง
        [0, 17],
        [17, 18],
        [18, 19],
        [19, 20], // นิ้วก้อย
      ];

      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      connections.forEach(([start, end]) => {
        ctx.beginPath();
        ctx.moveTo(landmarks[start].x * canvas.width, landmarks[start].y * canvas.height);
        ctx.lineTo(landmarks[end].x * canvas.width, landmarks[end].y * canvas.height);
        ctx.stroke();
      });
    });
  };

  // เริ่มต้นเมื่อคอมโพเนนต์ถูกเมานต์
  useEffect(() => {
    initializeHandDetection();

    return () => {
      if (webcamRef.current && webcamRef.current.video.srcObject) {
        webcamRef.current.video.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Hand Detection for Sign Language
      </h1>
      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
        {/* มือซ้าย */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">มือซ้าย</h2>
          <p className="text-lg">
            จำนวนนิ้วที่ชู: <span className="font-bold text-blue-600">{leftHand.count}</span>
          </p>
          <p className="text-lg">
            นิ้วที่ตรวจจับได้:
          </p>
          <ul className="list-disc pl-5 mt-2">
            {leftHand.fingers.length > 0 ? (
              leftHand.fingers.map((finger, idx) => (
                <li key={idx} className="text-gray-600">
                  {finger}
                </li>
              ))
            ) : (
              <li className="text-gray-400">ไม่มีนิ้วที่ชู</li>
            )}
          </ul>
        </div>

        {/* มือขวา */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">มือขวา</h2>
          <p className="text-lg">
            จำนวนนิ้วที่ชู: <span className="font-bold text-blue-600">{rightHand.count}</span>
          </p>
          <p className="text-lg">
            นิ้วที่ตรวจจับได้:
          </p>
          <ul className="list-disc pl-5 mt-2">
            {rightHand.fingers.length > 0 ? (
              rightHand.fingers.map((finger, idx) => (
                <li key={idx} className="text-gray-600">
                  {finger}
                </li>
              ))
            ) : (
              <li className="text-gray-400">ไม่มีนิ้วที่ชู</li>
            )}
          </ul>
        </div>
      </div>

      {/* วิดีโอและ Canvas */}
      <div className="relative mt-6 max-w-3xl mx-auto">
        <Webcam
          ref={webcamRef}
          className="w-full rounded-lg shadow-lg"
          style={{ width: "640px", height: "480px" }}
          videoConstraints={{ facingMode: "user" }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0"
        />
      </div>
    </div>
  );
};

export default HandDetection;