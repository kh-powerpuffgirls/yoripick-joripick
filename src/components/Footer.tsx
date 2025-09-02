import { useDispatch } from "react-redux";
import { openChat } from "../features/chatSlice";

function Footer() {
  const dispatch = useDispatch();

  return (
    <footer>
      <button onClick={() => dispatch(openChat())}>채팅 열기</button>
    </footer>
  );
}

export default Footer;