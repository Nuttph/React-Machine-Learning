import React, { useState } from "react";
import mockData from "../mock/Api.json"

const TextToVideo = () => {
    const [text,setText] = useState("");
    const [result,setResult] = useState([]);
    const handleSubmit = (e)=>{
        e.preventDefault();
        console.log(text)
        const result = mockData.filter(item=>item.word_thai == text || item.word_english == text);
        if(result){
            console.log(result)
            setResult(result)
        }
    }

  return (
    <>
      <div>
        <form className="flex flex-col w-fit" onSubmit={handleSubmit}>
            <label htmlFor="text">Text</label>
            <input
            value={text}
            onChange={(e)=>{setText(e.target.value)}}
            type="text" id="name" className="border px-2 py-1 rounded-lg" />
            <button>search</button>
        </form>
        {result && (
            <div>
                {result.map((item,index)=>(
                    <div key={index}>
                        <h1 className="text-[40px] font-medium">{item.word_thai} | {item.word_english}</h1>
                        <h1 className="text-[20px]">{item.description}</h1>
                        <img src={item.video_url} alt={item.video_url} className="w-[500px]"/>
                    </div>
                ))}
            </div>
        )}
      </div>
    </>
  );
};

export default TextToVideo;
