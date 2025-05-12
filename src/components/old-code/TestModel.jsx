// src/components/TestModel.jsx
import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

export default function TestModel() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // โหลดโมเดลจาก public/model/
        const model = await tf.loadLayersModel('/model/model.json');
        
        // เก็บข้อมูลพื้นฐานของโมเดลเพื่อแสดงผล
        setModelInfo({
          inputs: model.inputs.map(input => ({
            name: input.name,
            shape: input.shape,
            dtype: input.dtype
          })),
          outputs: model.outputs.map(output => ({
            name: output.name,
            shape: output.shape,
            dtype: output.dtype
          })),
          layers: model.layers.map(layer => layer.name),
          modelConfig: model.getConfig()
        });
        
        console.log('Model loaded successfully:', model);
      } catch (err) {
        console.error('Failed to load model:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadModel();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>โมเดลทดสอบ</h2>
      <p>ขั้นตอนแรก: ทดสอบการโหลดโมเดล</p>
      
      {loading && <p>กำลังโหลดโมเดล...</p>}
      
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          <strong>เกิดข้อผิดพลาด:</strong> {error}
          <p>ตรวจสอบว่า:</p>
          <ul>
            <li>ไฟล์โมเดลอยู่ใน <code>public/model/</code></li>
            <li>มีไฟล์ <code>model.json</code> และไฟล์ <code>.bin</code></li>
            <li>โครงสร้างโมเดลถูกต้อง</li>
          </ul>
        </div>
      )}
      
      {modelInfo && (
        <div style={{ marginTop: '20px' }}>
          <h3>ข้อมูลโมเดล</h3>
          <div style={{ display: 'flex', gap: '30px' }}>
            <div>
              <h4>Inputs</h4>
              <pre>{JSON.stringify(modelInfo.inputs, null, 2)}</pre>
            </div>
            <div>
              <h4>Outputs</h4>
              <pre>{JSON.stringify(modelInfo.outputs, null, 2)}</pre>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <h4>Layers ({modelInfo.layers.length})</h4>
            <ul>
              {modelInfo.layers.map((layer, index) => (
                <li key={index}>{layer}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}