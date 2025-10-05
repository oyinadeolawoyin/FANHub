import { useLocation } from "react-router-dom";

export default function Errorpage() {
  const location = useLocation();
  const { message } = location.state || { message: "An unexpected error occurred." };

  return (
    <div>
      <p>{message}</p>
    </div>
  );
}