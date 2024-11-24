import { useEffect, useState } from "react";

const useWideScreen = () => {
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth >= 1536);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth >= 1536);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isWideScreen;
};

export default useWideScreen;
