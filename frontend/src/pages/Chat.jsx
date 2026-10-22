import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Connecting...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const selectedRef = useRef(userId);
  const meRef = useRef(null);
  const bottomRef = useRef(null);
  useEffect(() => {
    selectedRef.current = userId;
  }, [userId]);
  useEffect(() => {
    meRef.current = me?._id;
  }, [me]);
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");
    async function loadChat() {
      if (!token) {
        navigate("/login");
        return;
      }
      setLoading(true);
      setError("");
      setSelected(null);
      setMessages([]);
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const [usersResponse, messagesResponse] = await Promise.all([
          fetch(`${API}/api/chat/users`, { headers }),
          fetch(`${API}/api/chat/${userId}/messages`, { headers }),
        ]);
        const usersData = await usersResponse.json();
        const messagesData = await messagesResponse.json();
        if (
          usersResponse.status === 401 ||
          messagesResponse.status === 401
        ) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        if (!usersResponse.ok) {
          throw new Error(
            usersData.message || "Unable to load user details"
          );
        }
        if (!messagesResponse.ok) {
          throw new Error(
            messagesData.message || "Unable to load messages"
          );
        }
        const currentUser = usersData.me;
        const otherUser = (usersData.users || []).find(
          (user) => String(user._id) === String(userId)
        );
        if (!currentUser) {
          throw new Error("Logged-in user details not found");
        }
        if (!otherUser) {
          throw new Error("Selected user not found");
        }
        if (!active) return;
        setMe(currentUser);
        setSelected(otherUser);
        setMessages(
          Array.isArray(messagesData) ? messagesData : []
        );
      } catch (err) {
        if (active) {
          setError(err.message || "Chat load nahi hui.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadChat();
    return () => {
      active = false;
    };
  }, [userId, navigate]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const socket = io(API, {
      auth: { token },
      reconnection: true,
    });
    socketRef.current = socket;
    socket.on("connect", () => setStatus("Connected"));
    socket.on("disconnect", () => setStatus("Disconnected"));
    socket.on("connect_error", (err) => {
      setStatus("Connection failed");
      setError(err.message || "Socket connection failed");
    });
    socket.on("new_message", (message) => {
      const myId = meRef.current;
      const activeUserId = selectedRef.current;
      const belongsToOpenChat =
        (String(message.sender) === String(myId) &&
          String(message.receiver) === String(activeUserId)) ||
        (String(message.receiver) === String(myId) &&
          String(message.sender) === String(activeUserId));
      if (belongsToOpenChat) {
        setMessages((previous) =>
          previous.some(
            (item) => String(item._id) === String(message._id)
          )
            ? previous
            : [...previous, message]
        );
      }
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  function sendMessage(event) {
    event.preventDefault();
    const messageText = text.trim();
    const socket = socketRef.current;
    if (!messageText || !selected || !socket?.connected) return;
    setError("");
    socket.emit(
      "send_message",
      {
        receiverId: selected._id,
        text: messageText,
      },
      (result) => {
        if (!result?.success) {
          setError(result?.message || "Message could not be sent");
          return;
        }

        setMessages((previous) =>
          previous.some(
            (item) =>
              String(item._id) === String(result.message._id)
          )
            ? previous
            : [...previous, result.message]
        );
      }
    );

    setText("");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-4xl flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
        {/* Chat header */}
        <header className="flex items-center gap-3 border-b px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="rounded-lg border px-3 py-2 text-sm hover:cursor-pointer hover:bg-indigo-300"
          >
            Back
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold text-lime-800">
              {selected?.Fullname || "Loading chat..."}
            </h1>

            {selected?.Email && (
              <p className="truncate text-sm text-gray-500">
                {selected.Email}
              </p>
            )}
          </div>

          <span
            className={`text-xs ${
              status === "Connected"
                ? "text-lime-600"
                : "text-gray-500"
            }`}
          >
            {status}
          </span>
        </header>

        {/* Messages */}
        <main className="flex-1 space-y-3 overflow-y-auto bg-white p-4 sm:p-6">
          {loading && (
            <p className="text-center text-sm text-gray-500">
              Loading conversation...
            </p>
          )}

          {!loading && error && (
            <p className="mx-auto max-w-lg rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && messages.length === 0 && (
            <p className="pt-10 text-center text-sm text-gray-500">
              No messages yet. Say hello!
            </p>
          )}

          {!loading &&
            messages.map((message) => {
              const mine =
                String(message.sender) === String(me?._id);

              return (
                <div
                  key={message._id}
                  className={`flex ${
                    mine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] break-words rounded-2xl px-4 py-2 ${
                      mine
                        ? "rounded-br-sm bg-lime-700 text-white"
                        : "rounded-bl-sm bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>

                    <p className="mt-1 text-right text-xs opacity-70">
                      {message.createdAt
                        ? new Date(
                            message.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              );
            })}

          <div ref={bottomRef} />
        </main>

        {/* Message input */}
        <form
          onSubmit={sendMessage}
          className="flex gap-2 border-t bg-white p-3 sm:p-4"
        >
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type a message..."
            maxLength={5000}
            disabled={loading || !selected}
            className="min-w-0 flex-1 rounded-lg border px-4 py-3 outline-none focus:border-lime-700"
          />

          <button
            type="submit"
            disabled={
              !text.trim() ||
              !selected ||
              loading ||
              status !== "Connected"
            }
            className="rounded-lg bg-lime-700 px-5 py-3 font-medium text-white hover:bg-lime-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
