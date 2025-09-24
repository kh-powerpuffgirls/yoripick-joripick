import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { api } from '../api/authApi';
import { setRooms } from '../features/chatSlice';

export default function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    api.post('/auth/logout')
      .then(() => {
        dispatch(setRooms([]));
        dispatch(logout());
        navigate("/home");
      })
      .catch(() => {
        dispatch(setRooms([]));
        dispatch(logout());
        navigate("/home");
      });
  };

  return handleLogout;
}