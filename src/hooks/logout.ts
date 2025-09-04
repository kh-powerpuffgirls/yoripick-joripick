import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { api } from '../api/authApi';

export default function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    api.post('/auth/logout')
      .then(() => {
        dispatch(logout());
        navigate(-1);
      })
      .catch(() => {
        dispatch(logout());
        navigate(-1);
      });
  };

  return handleLogout;
}