import React from 'react'
import HandDetector from './components/HandDetector'

const App = () => {
  return (
    <div className=''>
      <h1>กล้องทำนายภาพด้วย TensorFlow.js</h1>
      <HandDetector/>
    </div>
  )
}

export default App