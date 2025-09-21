import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../../api/adminApi";

interface UserInfo {
    userNo: number;
    userName: string;
    status: string;
    banDays: number;
    reportNo: number;
    officialRcp: number;
    chRequest: number;
};

export const UserManagement = () => {
    const {data:users, isLoading, isError, error} = useQuery<UserInfo[]>({
        queryKey : ['users'],
        queryFn : () => getUsers(),
        staleTime : 1000 * 60,
        gcTime : 1000 * 60 * 5,
        enabled : true
    });
    console.log(users);
    if (isLoading) return <div>Loading중...</div>
    if (isError) return <div>{error.message}</div>
    return (
        <>
        <table>
            <thead>
                <tr>
                    <th>회원 번호</th>
                    <th>닉네임</th>
                    <th>활성화 상태</th>
                    <th>정지 일수</th>
                    <th>신고 건수</th>
                    <th>공식 레시피</th>
                    <th>챌린지 요청</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {users?.map(u => (
                    <tr>
                        <td>USER {u.userNo}</td>
                        <td>{u.userName}</td>
                        <td>{u.status}</td>
                        <td>{u.banDays}</td>
                        <td>{u.reportNo}</td>
                        <td>{u.officialRcp}</td>
                        <td>{u.chRequest}</td>
                        <td>
                            <button>마이페이지</button>
                            <button>정지</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </>
    );
};