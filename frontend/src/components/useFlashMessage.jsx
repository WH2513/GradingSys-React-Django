import { useState } from "react";
import '../styles/Global.css';


export function useFlashMessage() {
  const [msg, setMsg] = useState(null);

  const showMessage = (text, isError = false) => {
    setMsg({ text, isError });

    setTimeout(() => {
      setMsg(null);
    }, 3000 * 2);
  };

  const FlashMessage = () =>
    msg ? (
      <div className={`message ${msg.isError ? "error" : "success"}`}>
        {msg.text}
      </div>
    ) : null;

  return { showMessage, FlashMessage };
}