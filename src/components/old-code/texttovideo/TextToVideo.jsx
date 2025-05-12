import React, { useState } from "react";
import mockData from "../mock/Api.json"
import axios from "axios";

//api
const apiUrl = import.meta.env.VITE_API_URL

const TextToVideo = () => {
    const [text,setText] = useState("");
    const [result,setResult] = useState([]);
    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
          const res = await axios.get(`${apiUrl}translate?text=${text}`)
          console.log("map result",res.data.result)
          setResult(res.data.result)
        }catch(err){
          console.log("Error is ",err)
        }
    }

  return (
    <>
      <div className="w-full flex flex-col items-center">
        <form className="flex flex-col w-fit" onSubmit={handleSubmit}>
            <label htmlFor="text">Text</label>
            <input
            value={text}
            onChange={(e)=>{setText(e.target.value)}}
            type="text" id="name" className="border px-2 py-1 rounded-lg" />
            <button>search</button>
        </form>
        <div className="flex flex-row gap-[20px] flex-wrap justify-center">
          {result && result.map((item,index)=>(
            <div key={index} className={`flex-col ${item.video_url == null ? "hidden":"flex"}`}>
              <div className="text-center">{item.word}</div>
              <img src={item.video_url} alt={item.word} className="w-[300px]"/>
          </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TextToVideo;
