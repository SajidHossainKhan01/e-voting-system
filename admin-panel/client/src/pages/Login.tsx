import { useCallback, useState, type FormEvent } from "react";
import Container from "../components/ui/Container";
import Flex from "../components/ui/Flex";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore"; // import your auth store

type TUserLoginCredentials = { username?: string; password?: string };

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore(); // get login action and state from store

  const [userLoginCredentials, setUserLoginCredentials] =
    useState<TUserLoginCredentials>({ username: "", password: "" });

  const [inputErrors, setInputError] = useState<{ [str: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const onChangeFormInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserLoginCredentials((state) => ({
        ...state,
        [e.target.name]: e.target.value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const errors: { [key: string]: string } = {};

      if (!userLoginCredentials.username) {
        errors.username = "Username cannot be empty";
      }

      if (!userLoginCredentials.password) {
        errors.password = "Password cannot be empty";
      }

      if (Object.keys(errors).length > 0) {
        setInputError(errors);
        return;
      }

      try {
        // Call login from auth store
        await login(
          userLoginCredentials.username!,
          userLoginCredentials.password!
        );
        // Navigate to home after successful login
        navigate("/");
      } catch (err) {
        console.error("Login failed:", err);
      }
    },
    [
      login,
      navigate,
      userLoginCredentials.username,
      userLoginCredentials.password,
    ]
  );

  return (
    <Container className="h-screen">
      <Flex className="h-full px-4 py-20 items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-indigo-700">
            Election Commission
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-lg font-semibold text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={userLoginCredentials.username}
                onChange={onChangeFormInput}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Enter your username"
              />
              {inputErrors.username && (
                <h3 className="mt-3 text-red-500 font-semibold">
                  {inputErrors.username}
                </h3>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-lg font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={userLoginCredentials.password}
                  onChange={onChangeFormInput}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-0 -translate-y-1/2 text-gray-400 hover:text-indigo-500"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {inputErrors.password && (
                <h3 className="mt-3 text-red-500 font-semibold">
                  {inputErrors.password}
                </h3>
              )}
            </div>
            {error && (
              <h3 className="mt-2 text-red-500 font-semibold text-center">
                {error}
              </h3>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </Flex>
    </Container>
  );
};

export default Login;
