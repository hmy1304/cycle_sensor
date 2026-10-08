import { useState, useEffect, useRef } from 'react';

const WS_URL = 'ws://192.168.4.1:81';

export function useBikeData() {
  const [data, setData] = useState({ left: 999, right: 999, back: 999, buzzer: false });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);

  useEffect(() => {
    let reconnectTimeout = null;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setData(parsedData);
        } catch (err) {
          console.error('웹소켓 파싱 에러:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        setError('연결 실패');
        ws.close();
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);

  const toggleBuzzer = (turnOn) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(turnOn ? 'BUZZER_ON' : 'BUZZER_OFF');
      setData(prev => ({ ...prev, buzzer: turnOn }));
    }
  };

  return { data, isConnected, error, toggleBuzzer };
}
