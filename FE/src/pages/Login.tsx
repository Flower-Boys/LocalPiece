import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem("token", "test-token");
    navigate("/");
  };

  return (
    <div className="login-container flex items-center justify-center min-h-screen bg-gray-100">
      <div className="login-form bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">로그인</h2>
        <input type="email" placeholder="이메일" className="border p-2 w-full mb-2" />
        <input type="password" placeholder="비밀번호" className="border p-2 w-full mb-4" />
        <button onClick={handleLogin} className="w-full bg-blue-500 text-white py-2 rounded">
          로그인
        </button>
      </div>
    </div>
  );
};

export default Login;
