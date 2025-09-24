import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { Navigate } from "react-router-dom";

interface Props {
    children : ReactNode; // 자식 컴포넌트
    requiredRoles?: string[];
    redirectTo?:string;
}

export default function ProtectedRoute({
    children, 
    requiredRoles=[], 
    redirectTo="/login"}:Props){
    
    const {isAuthenticated, user} = useSelector( (state:RootState) => state.auth);
    if(!isAuthenticated){
        alert("로그인 후 이용해주세요");
        return <Navigate to={redirectTo} replace />
    }

    if(requiredRoles.length > 0 && user){
        const hasRequiredRole = requiredRoles.some( role => user.roles.includes(role));

        if(!hasRequiredRole){
            return <Navigate to="/unauthorized" replace />;
        }
    }
    
    return <>{children}</>
}