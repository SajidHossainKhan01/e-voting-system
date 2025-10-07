import { useCallback, useState, type FormEvent } from "react";
import Container from "../components/ui/Container";
import Flex from "../components/ui/Flex";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router";

type TUserLoginCredentials = { username?: string; password?: string };

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [userLoginCredentials, setUserLoginCredentials] =
    useState<TUserLoginCredentials>({ username: "", password: "" });

  const [inputErrors, setInputError] = useState<{ [str: string]: string }>();

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
    (e: FormEvent) => {
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
      } else {
        // TODO: Handle login api
        navigate("/");
      }
    },
    [navigate, userLoginCredentials.password, userLoginCredentials.username]
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
                required
                value={userLoginCredentials.username}
                onChange={(e) => onChangeFormInput(e)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Enter your username"
              />
              {inputErrors && (
                <h3 className="mt-3 text-red-500 font-semibold">
                  {inputErrors["username"]}
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
                  required
                  value={userLoginCredentials.password}
                  onChange={(e) => onChangeFormInput(e)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-0 -translate-1/2 text-gray-400 hover:text-indigo-500"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {inputErrors && (
                <h3 className="mt-3 text-red-500 font-semibold">
                  {inputErrors["password"]}
                </h3>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition cursor-pointer"
              onClick={handleSubmit}
            >
              Sign In
            </button>
          </form>
        </div>
      </Flex>
    </Container>
  );
};

export default Login;
