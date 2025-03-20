class ApiService {
    static async login(email, password) {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        return response.ok ? response.json() : null;
    }

    static async getPreviousMessages(room) {
        const response = await fetch(`http://localhost:8080/api/messages/${room}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        return response.ok ? response.json() : [];
    }
}

export default ApiService;