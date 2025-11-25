import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function useTokenSync() {
  const updateFromEvent = useAuthStore((s) => s.updateFromEvent);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4001");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === "token.refreshed") {
        console.log(" Token reçu depuis RabbitMQ via WebSocket :", data);

        updateFromEvent(data.access_token, data.refresh_token);
      }
    };

    return () => ws.close();
  }, [updateFromEvent]);
}
