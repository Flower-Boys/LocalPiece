import { useState } from "react";

function App() {
  const [num, setNum] = useState<number>(0)
  const handlerNum = (type:string) => {
    if(type === 'up') {
      setNum(num + 1)
    } else if(type === 'down') {
      if(num <= 0) {
        return
      } else {
        setNum(num - 1)
      }
    }
  }
  return (
    <>
      <div>
        <p>hello!</p>
        <p>{num}</p>
        <hr />
        <button onClick={() => handlerNum('up')}>
          증가
        </button>
        <button onClick={() => handlerNum('down')}>
          감소
        </button>
      </div>    
    </>
  );
}

export default App;
