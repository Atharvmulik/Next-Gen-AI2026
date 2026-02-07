import { useState } from "react";

export default function CounsellorChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/counselor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const botMessage = {
        role: "bot",
        text: data.reply || "No response from AI",
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "bot", text: "⚠️ Backend not reachable" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>AI Counselor</h2>

      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? "#ff7a18" : "#f1f1f1",
              color: msg.role === "user" ? "#fff" : "#000",
              boxShadow: msg.role === "user" 
                ? "0 4px 12px rgba(255, 122, 24, 0.3)" 
                : "0 4px 12px rgba(0, 0, 0, 0.08)",
              border: msg.role === "user" 
                ? "1px solid #ff7a18" 
                : "1px solid #ddd",
            }}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div style={{ 
            ...styles.message, 
            background: "#f5f5f5", 
            alignSelf: "flex-start",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)"
          }}>
            AI is thinking...
          </div>
        )}
      </div>

      <div style={styles.inputBox}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask your career question..."
          style={styles.input}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "90%",
    maxWidth: "900px",
    minWidth: "800px",
    margin: "0 auto",
    padding: "30px",
    borderRadius: "20px",
    background: "#fff",
    boxShadow: `
      0 20px 60px rgba(0, 0, 0, 0.15),
      0 5px 15px rgba(0, 0, 0, 0.07),
      inset 0 1px 0 rgba(255, 255, 255, 0.8)
    `,
    border: "1px solid #e8e8e8",
    borderTop: "3px solid #ff7a18",
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100vh - 200px)",
    marginTop: "80px",
    marginBottom: "40px",
    position: "relative",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "32px",
    fontWeight: "600",
    color: "#333",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    paddingBottom: "15px",
    borderBottom: "2px solid #f0f0f0",
  },
  chatBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    padding: "25px",
    border: "2px solid #eaeaea",
    borderRadius: "16px",
    overflowY: "auto",
    minHeight: "400px",
    maxHeight: "500px",
    backgroundColor: "#f9f9f9",
    boxShadow: `
      inset 0 2px 8px rgba(0, 0, 0, 0.04),
      0 2px 4px rgba(0, 0, 0, 0.05)
    `,
    backgroundImage: "linear-gradient(to bottom, #f9f9f9, #f5f5f5)",
  },
  message: {
    maxWidth: "70%",
    padding: "14px 20px",
    borderRadius: "20px",
    fontSize: "16px",
    wordBreak: "break-word",
    lineHeight: "1.5",
    transition: "all 0.2s ease",
    borderTopLeftRadius: "4px",
    borderBottomRightRadius: "20px",
  },
  inputBox: {
    display: "flex",
    gap: "12px",
    marginTop: "25px",
    padding: "20px",
    backgroundColor: "#f8f8f8",
    borderRadius: "16px",
    border: "2px solid #eee",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  },
  input: {
    flex: 1,
    padding: "16px 20px",
    borderRadius: "12px",
    border: "2px solid #ddd",
    fontSize: "16px",
    backgroundColor: "#fff",
    boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.03)",
    transition: "all 0.3s ease",
    outline: "none",
  },
  button: {
    padding: "16px 30px",
    borderRadius: "12px",
    border: "none",
    background: "#ff7a18",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: `
      0 4px 15px rgba(255, 122, 24, 0.3),
      0 2px 4px rgba(255, 122, 24, 0.2)
    `,
    transition: "all 0.2s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};