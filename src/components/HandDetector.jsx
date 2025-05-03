import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker, PoseLandmarker } from "@mediapipe/tasks-vision";
import Webcam from "react-webcam";
import VideoToText from "./resultvideo/VideoToText";

const HandDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [leftHand, setLeftHand] = useState({ count: 0, fingers: [], arm: {} });
  const [rightHand, setRightHand] = useState({ count: 0, fingers: [], arm: {} });
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const handLandmarkerRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const lastDetectionTimeRef = useRef(0);
  const animationFrameRef = useRef(null);

  const [result,setResult] = useState("")

  // โหลดโมเดล HandLandmarker และ PoseLandmarker (ถ้าเลือก)
  const initializeDetectors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      // โหลด HandLandmarker
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        numHands: 2,
        runningMode: "video",
      });
      handLandmarkerRef.current = handLandmarker;

      // โหลด PoseLandmarker ถ้าเปิดใช้งาน
      if (true) {
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          },
          runningMode: "video",
        });
        poseLandmarkerRef.current = poseLandmarker;
      }

      if (isCameraOn) {
        detectHandsAndPose();
      }
      setIsLoading(false);
    } catch (err) {
      setError(`ไม่สามารถโหลดโมเดลได้: ${err.message}`);
      setIsLoading(false);
      console.error("Error initializing detectors:", err);
    }
  };

  // ฟังก์ชันตรวจจับมือและท่าทางร่างกาย
  const detectHandsAndPose = () => {
    if (!isCameraOn) return;

    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      handLandmarkerRef.current
    ) {
      const video = webcamRef.current.video;
      const timestamp = performance.now();

      if (timestamp - lastDetectionTimeRef.current >= 200) {
        const handDetections = handLandmarkerRef.current.detectForVideo(video, timestamp);
        let poseDetections = {};
        if (poseLandmarkerRef.current) {
          poseDetections = poseLandmarkerRef.current.detectForVideo(video, timestamp);
        }

        const handData = handDetections.handednesses.map((handedness, index) => {
          const handLabel = handedness[0].categoryName;
          const landmarks = handDetections.landmarks[index].map((landmark, idx) => ({
            point: idx,
            num:idx+1,
            x: landmark.x.toFixed(3),
            y: landmark.y.toFixed(3),
            z: landmark.z.toFixed(3),
          }));

          // ดึงข้อมูลแขนจาก Pose หรือใช้ค่าเริ่มต้น
          let arm = {};
          if (poseDetections.landmarks && poseDetections.landmarks[0]) {
            const poseLandmarks = poseDetections.landmarks[0];
            arm = {
              shoulder: handLabel === "Left" ? poseLandmarks[12] : poseLandmarks[11],
              elbow: handLabel === "Left" ? poseLandmarks[14] : poseLandmarks[13],
              wrist: handLabel === "Left" ? poseLandmarks[16] : poseLandmarks[15],
            };
            arm = {
              shoulder: { x: arm.shoulder.x.toFixed(3), y: arm.shoulder.y.toFixed(3) },
              elbow: { x: arm.elbow.x.toFixed(3), y: arm.elbow.y.toFixed(3) },
              wrist: { x: arm.wrist.x.toFixed(3), y: arm.wrist.y.toFixed(3) },
            };
          }

          return {
            hand: handLabel,
            landmarks,
            arm,
          };
        });

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

        detectFingerGestures(handDetections);
        drawLandmarks(handDetections.landmarks, handData, poseDetections.landmarks);
        lastDetectionTimeRef.current = timestamp;
      }
    }
    animationFrameRef.current = requestAnimationFrame(detectHandsAndPose);
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
  const drawLandmarks = (handLandmarksArray, handData, poseLandmarksArray) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // วาดจุดและเส้นของมือ
    handLandmarksArray.forEach((landmarks) => {
      landmarks.forEach((landmark) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
      });

      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
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

    // วาดแขนจาก handData
    handData.forEach(({ arm, hand }) => {
      // console.log("This is arm",arm)
      // console.log("This is hand",hand)
      const shoulderY = parseFloat(arm.shoulder.y)
      const wristY = parseFloat(arm.wrist.y)
      const elbowY = parseFloat(arm.elbow.y)
      if( wristY < shoulderY  < elbowY){
        setResult("สวัสดี")
      }else{
        setResult("")
      }
      if (arm.shoulder && arm.elbow && arm.wrist) {
        const shoulder = { x: parseFloat(arm.shoulder.x) * canvas.width, y: parseFloat(arm.shoulder.y) * canvas.height };
        const elbow = { x: parseFloat(arm.elbow.x) * canvas.width, y: parseFloat(arm.elbow.y) * canvas.height };
        const wrist = { x: parseFloat(arm.wrist.x) * canvas.width, y: parseFloat(arm.wrist.y) * canvas.height };
        
        ctx.beginPath();
        ctx.arc(shoulder.x, shoulder.y, 7, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(elbow.x, elbow.y, 7, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(wrist.x, wrist.y, 7, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(shoulder.x, shoulder.y);
        ctx.lineTo(elbow.x, elbow.y);
        ctx.strokeStyle = hand === "Left" ? "purple" : "orange";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(elbow.x, elbow.y);
        ctx.lineTo(wrist.x, wrist.y);
        ctx.strokeStyle = hand === "Left" ? "purple" : "orange";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
  };

  // ฟังก์ชันสลับสถานะกล้อง
  const toggleCamera = () => {
    setIsCameraOn((prev) => {
      const newState = !prev;
      if (!newState && webcamRef.current && webcamRef.current.video.srcObject) {
        webcamRef.current.video.srcObject.getTracks().forEach((track) => track.stop());
      }
      return newState;
    });
  };

 

  // เริ่มต้นและจัดการการตรวจจับ
  useEffect(() => {
    initializeDetectors();

    if (isCameraOn) {
      detectHandsAndPose();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (webcamRef.current && webcamRef.current.video.srcObject) {
        webcamRef.current.video.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraOn]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Hand Detection for Sign Language <span className="text-blue-500">(Version 2.0.0)</span>
      </h1>
      <div className="flex justify-center mb-4 space-x-4">
        <button
          onClick={()=>{
            if(!isLoading){
              toggleCamera()
            }
          }}
          className={`px-4 py-2 rounded cursor-pointer text-white ${
            isLoading ? "bg-gray-500":isCameraOn ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isCameraOn ? "ปิดกล้อง" : "เปิดกล้อง"}
        </button>
      </div>
      {isLoading && (
        <div className="text-center mb-4">
          <p className="text-gray-600">กำลังโหลดโมเดล...</p>
        </div>
      )}
      {error && (
        <div className="text-center mb-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={initializeDetectors}
            className="px-4 py-2 mt-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ลองโหลดใหม่
          </button>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto h-[450px]">
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
                <li key={idx} className="text-gray-600">{finger}</li>
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
                <li key={idx} className="text-gray-600">{finger}</li>
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

<div className="text-center my-4 h-[50px]">result: {result}</div>
      {/* วิดีโอและ Canvas */}
      <div className="relative mt-6 max-w-3xl mx-auto">
        {isCameraOn ? (
          <Webcam
            ref={webcamRef}
            className="w-full rounded-lg shadow-lg"
            style={{ width: "640px", height: "480px" }}
            videoConstraints={{ facingMode: "user" }}
            onUserMediaError={() => setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการตั้งค่า")}
          />
        ) : (
          <div
            className="w-full bg-gray-300 rounded-lg flex items-center justify-center"
            style={{ width: "640px", height: "480px" }}
          >
            <p className="text-gray-600 text-lg">กล้องถูกปิดอยู่</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0"
        />
        {/* <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-[500px] left-0"
        /> */}
      </div>
      <VideoToText text={result}/>
    </div>
  );
};

export default HandDetection;