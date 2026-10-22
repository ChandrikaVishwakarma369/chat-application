import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`${API_URL}/api/chat/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const loggedInUser = response.data.me;
        const allUsers = Array.isArray(response.data.users)
          ? response.data.users
          : [];
        if (!loggedInUser) {
          throw new Error("Logged-in user details nahi mile.");
        }
        if (isMounted) {
          setCurrentUser(loggedInUser);
          setUsers(
            allUsers.filter(
              (user) => String(user._id) !== String(loggedInUser._id),
            ),
          );
        }
      } catch (err) {
        console.error(
          "Home page API error:",
          err.response?.status,
          err.response?.data || err.message,
        );
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Users load nahi hue. Backend API check karo.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [navigate]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const handleOpenChat = (userId) => {
    navigate(`/chat/${userId}`);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-4 py-3 sm:px-8">
        <h1 className="text-xl font-semibold text-lime-800 bg-indigo-300 p-3">
          Real Time Chat Application
        </h1>

        <div className="flex items-center gap-3">
          <span className="max-w-40 text-sm font-medium sm:max-w-none text-lime-900 underline">
            {currentUser?.Fullname || "Loading..."}
          </span>

          <button
            onClick={handleLogout}
            className="rounded border px-3 py-1.5 text-sm cursor-pointer hover:bg-indigo-300"
          >
            Logout
          </button>
        </div>
      </header>
      {/* Users list */}
      <main className="mx-auto max-w-2xl p-4 sm:p-8">
        <h2 className="mb-4 text-lg font-semibold">All Users</h2>

        {loading && <p className="text-sm text-gray-500">Loading users...</p>}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && users.length === 0 && (
          <p className="rounded-lg border bg-white p-4 text-sm text-gray-500">
            Here is not another user registered!
          </p>
        )}
        {!loading && !error && users.length > 0 && (
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user._id}
                onClick={() => handleOpenChat(user._id)}
                className="flex w-full items-center justify-between rounded-lg border bg-white p-4 text-left hover:cursor-pointer hover:bg-indigo-300"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {user.Fullname || "User"}
                  </p>

                  <p className="mt-1 truncate text-sm text-gray-500">
                    {user.Email}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium ">Chat →</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;