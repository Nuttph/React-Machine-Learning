import React, { useEffect, useState } from 'react'
import mockData from "../../mock/Api.json"
const VideoToText = (param) => {
    const [data,setData] = useState([]);
    const {text} = param;
    useEffect(()=>{
        const mapResult = mockData.filter((item)=>item.word_thai == text);
        console.log("Map Result",mapResult)
        setData(mapResult)
    },[text])
    return (
    <div className=''>
        <div>
            result : {text}
        </div>
        {data && (
            <div>
                {data.map((item,index)=>(
                    <div>
                        <h1>{item.word_thai}</h1>
                        <p>{item.description}</p>
                        <img src={item.video_url}></img>
                    </div>
                ))}
            </div>
        )}
    </div>
  )
}

export default VideoToText