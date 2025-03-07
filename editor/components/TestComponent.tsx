import React, { useState, useEffect, useCallback } from "react";
import { Button } from "react-bootstrap"; // This import is unused on purpose

interface TestProps {
  externalValue: number;
}

export default function TestComponent({ externalValue }: TestProps) {
  const [count, setCount] = useState(0);
  
  // Missing dependency: externalValue should be in the deps array
  useEffect(() => {
    console.log("External value is:", externalValue);
  }, []);
  
  // Missing dependency: setCount should be in the deps array
  const incrementLater = useCallback(() => {
    setTimeout(() => {
      setCount(count + 1);
    }, 1000);
  }, [count]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={incrementLater}>Increment Later</button>
    </div>
  );
}
