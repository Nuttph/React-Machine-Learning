import React from "react";
import Title from "./Title";
import ChoiceDemo from "./ChoiceDemo";

const FirstPage = () => {
  return (
    <>
      <div>
        <Title />
      </div>
      <div className="pb-[100px] mt-[70px]">
        <ChoiceDemo />
      </div>
    </>
  );
};

export default FirstPage;
