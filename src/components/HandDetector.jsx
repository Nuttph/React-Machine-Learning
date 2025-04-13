import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import Webcam from "react-webcam";

const HandDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [handPresence, setHandPresence] = useState(false);
  const [leftHand, setLeftHand] = useState({ count: 0, fingers: [], arm: {} });
  const [rightHand, setRightHand] = useState({ count: 0, fingers: [], arm: {} });
  const handLandmarkerRef = useRef(null);
  const lastDetectionTimeRef = useRef(0);

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

  // ฟังก์ชันคำนวณตำแหน่งแขน
  const calculateArmPositions = (landmarks, handLabel) => {
    const wrist = landmarks[0]; // ข้อมือ
    const indexMCP = landmarks[5]; // โคนนิ้วชี้
    const pinkyMCP = landmarks[17]; // โคนนิ้วก้อย

    // คำนวณทิศทางของมือโดยใช้จุดโคนนิ้วชี้และนิ้วก้อย
    const handDirection = {
      x: indexMCP.x - pinkyMCP.x,
      y: indexMCP.y - pinkyMCP.y,
    };
    const magnitude = Math.sqrt(handDirection.x ** 2 + handDirection.y ** 2);
    const normalizedDirection = {
      x: handDirection.x / (magnitude || 1),
      y: handDirection.y / (magnitude || 1),
    };

    // ประมาณตำแหน่งข้อศอก (ปลายแขน) โดยสมมติว่าแขนยื่นออกจากข้อมือในทิศทางตรงข้ามมือ
    const elbowDistance = 0.3; // ระยะห่างจากข้อมือถึงข้อศอก (ปรับได้)
    const elbow = {
      x: wrist.x - normalizedDirection.x * elbowDistance,
      y: wrist.y - normalizedDirection.y * elbowDistance,
    };

    // ประมาณตำแหน่งไหล่ (ต้นแขน) โดยสมมติว่าไหล่อยู่ห่างจากข้อศอก
    const shoulderDistance = 0.4; // ระยะห่างจากข้อศอกถึงไหล่ (ปรับได้)
    const shoulder = {
      x: elbow.x - normalizedDirection.x * shoulderDistance,
      y: elbow.y - normalizedDirection.y * shoulderDistance,
    };

    return {
      wrist: { x: wrist.x.toFixed(3), y: wrist.y.toFixed(3) },
      elbow: { x: elbow.x.toFixed(3), y: elbow.y.toFixed(3) },
      shoulder: { x: shoulder.x.toFixed(3), y: shoulder.y.toFixed(3) },
    };
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

      if (timestamp - lastDetectionTimeRef.current >= 100) {
        const detections = handLandmarkerRef.current.detectForVideo(video, timestamp);

        // สร้าง array สำหรับเก็บข้อมูลมือ
        const handData = detections.handednesses.map((handedness, index) => {
          const handLabel = handedness[0].categoryName;
          const landmarks = detections.landmarks[index].map((landmark, idx) => ({
            point: idx + 1,
            x: landmark.x.toFixed(3),
            y: landmark.y.toFixed(3),
            z: landmark.z.toFixed(3),
          }));
          const arm = calculateArmPositions(detections.landmarks[index], handLabel);

          return {
            hand: handLabel,
            landmarks,
            arm,
          };
        });

        // อัปเดต state สำหรับแขน
        handData.forEach(({ hand, arm }) => {
          if (hand === "Left") {
            setLeftHand((prev) => ({ ...prev, arm }));
          } else if (hand === "Right") {
            setRightHand((prev) => ({ ...prev, arm }));
          }
        });

        if (handData.length > 0) {
          console.log(handData);
        }
        
        // if (handData.length === 0) {
        //   console.log("No hands detected.");
        // }

        detectFingerGestures(detections);
        drawLandmarks(detections.landmarks, handData);
        lastDetectionTimeRef.current = timestamp;
      }
    }
    requestAnimationFrame(detectHands);
  };

  // ฟังก์ชันตรวจจับท่านิ้ว
  const detectFingerGestures = (detections) => {
    setLeftHand((prev) => ({ ...prev, count: 0, fingers: [] }));
    setRightHand((prev) => ({ ...prev, count: 0, fingers: [] }));

    detections.handednesses.forEach((handedness, index) => {
      const landmarks = detections.landmarks[index];
      const handLabel = handedness[0].categoryName;

      const wrist = landmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];

      const fingers = [];
      if (thumbTip.y < wrist.y - 0.1) fingers.push("นิ้วโป้ง");
      if (indexTip.y < wrist.y - 0.1) fingers.push("นิ้วชี้");
      if (middleTip.y < wrist.y - 0.1) fingers.push("นิ้วกลาง");
      if (ringTip.y < wrist.y - 0.1) fingers.push("นิ้วนาง");
      if (pinkyTip.y < wrist.y - 0.1) fingers.push("นิ้วก้อย");

      const fingerCount = fingers.length;

      if (handLabel === "Left") {
        setLeftHand((prev) => ({ ...prev, count: fingerCount, fingers }));
      } else if (handLabel === "Right") {
        setRightHand((prev) => ({ ...prev, count: fingerCount, fingers }));
      }
    });
  };

  // ฟังก์ชันวาดจุดสำคัญของมือและแขน
  const drawLandmarks = (landmarksArray, handData) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    landmarksArray.forEach((landmarks, index) => {
      // วาดจุดของมือ
      landmarks.forEach((landmark) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
      });

      // วาดเส้นเชื่อมของมือ
      const connections = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [0, 5],
        [5, 6],
        [6, 7],
        [7, 8],
        [0, 9],
        [9, 10],
        [10, 11],
        [11, 12],
        [0, 13],
        [13, 14],
        [14, 15],
        [15, 16],
        [0, 17],
        [17, 18],
        [18, 19],
        [19, 20],
      ];

      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      connections.forEach(([start, end]) => {
        ctx.beginPath();
        ctx.moveTo(landmarks[start].x * canvas.width, landmarks[start].y * canvas.height);
        ctx.lineTo(landmarks[end].x * canvas.width, landmarks[end].y * canvas.height);
        ctx.stroke();
      });

      // วาดแขน
      const arm = handData[index]?.arm;
      if (arm) {
        const wrist = { x: parseFloat(arm.wrist.x) * canvas.width, y: parseFloat(arm.wrist.y) * canvas.height };
        const elbow = { x: parseFloat(arm.elbow.x) * canvas.width, y: parseFloat(arm.elbow.y) * canvas.height };
        const shoulder = { x: parseFloat(arm.shoulder.x) * canvas.width, y: parseFloat(arm.shoulder.y) * canvas.height };

        // วาดจุดข้อศอกและไหล่
        ctx.beginPath();
        ctx.arc(elbow.x, elbow.y, 7, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(shoulder.x, shoulder.y, 7, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();

        // วาดเส้นปลายแขน (ข้อมือ → ข้อศอก)
        ctx.beginPath();
        ctx.moveTo(wrist.x, wrist.y);
        ctx.lineTo(elbow.x, elbow.y);
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 3;
        ctx.stroke();

        // วาดเส้นต้นแขน (ข้อศอก → ไหล่)
        ctx.beginPath();
        ctx.moveTo(elbow.x, elbow.y);
        ctx.lineTo(shoulder.x, shoulder.y);
        ctx.strokeStyle = "purple";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
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
          <p className="text-lg">นิ้วที่ตรวจจับได้:</p>
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
          <p className="text-lg mt-4">ตำแหน่งแขน:</p>
          {leftHand.arm.wrist ? (
            <ul className="list-disc pl-5 mt-2">
              <li>ข้อมือ: x={leftHand.arm.wrist.x}, y={leftHand.arm.wrist.y}</li>
              <li>ข้อศอก: x={leftHand.arm.elbow.x}, y={leftHand.arm.elbow.y}</li>
              <li>ไหล่: x={leftHand.arm.shoulder.x}, y={leftHand.arm.shoulder.y}</li>
            </ul>
          ) : (
            <p className="text-gray-400 mt-2">ไม่มีข้อมูลแขน</p>
          )}
        </div>

        {/* มือขวา */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">มือขวา</h2>
          <p className="text-lg">
            จำนวนนิ้วที่ชู: <span className="font-bold text-blue-600">{rightHand.count}</span>
          </p>
          <p className="text-lg">นิ้วที่ตรวจจับได้:</p>
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
          <p className="text-lg mt-4">ตำแหน่งแขน:</p>
          {rightHand.arm.wrist ? (
            <ul className="list-disc pl-5 mt-2">
              <li>ข้อมือ: x={rightHand.arm.wrist.x}, y={rightHand.arm.wrist.y}</li>
              <li>ข้อศอก: x={rightHand.arm.elbow.x}, y={rightHand.arm.elbow.y}</li>
              <li>ไหล่: x={rightHand.arm.shoulder.x}, y={rightHand.arm.shoulder.y}</li>
            </ul>
          ) : (
            <p className="text-gray-400 mt-2">ไม่มีข้อมูลแขน</p>
          )}
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