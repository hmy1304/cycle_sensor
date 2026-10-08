import { useBikeData } from './hooks/useBikeData';
import Radar from './components/Radar';
import './App.css';

function App() {
  const { data, isConnected, error, toggleBuzzer } = useBikeData();

  return (
    <div className="App" style={appContainerStyle}>
      <header style={headerStyle}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>🚲 후측방 레이더</h2>
        <div style={statusBadgeStyle(isConnected)}>
          {isConnected ? '🟢 연결됨' : `🔴 연결 끊김 ${error ? `(${error})` : ''}`}
        </div>
      </header>

      <div style={buzzerControlContainer}>
        <button 
          onClick={() => toggleBuzzer(!data.buzzer)}
          style={buzzerButtonStyle(data.buzzer, isConnected)}
          disabled={!isConnected}
        >
          {data.buzzer ? '🔊 부저 켜짐 (터치하여 끄기)' : '🔇 부저 꺼짐 (터치하여 켜기)'}
        </button>
      </div>

      <main style={mainStyle}>
        <Radar data={data} />
      </main>
      
      <footer style={footerStyle}>
        <p style={{ margin: 0 }}>AP: BikeRadar_AP | 접속 IP: 192.168.4.1</p>
        <p style={{ margin: '5px 0 0 0', opacity: 0.5, fontSize: '10px' }}>
          실시간 원본: L({data.left}) R({data.right}) B({data.back}) BUZZER({data.buzzer ? 'ON' : 'OFF'})
        </p>
      </footer>
    </div>
  );
}

const appContainerStyle = { display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#0f0f1a', color: 'white', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" };
const headerStyle = { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#16162a', borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 100 };
const statusBadgeStyle = (isConnected) => ({ padding: '6px 14px', borderRadius: '20px', backgroundColor: isConnected ? 'rgba(0, 255, 204, 0.1)' : 'rgba(255, 68, 68, 0.1)', color: isConnected ? '#00ffcc' : '#ff4444', fontSize: '13px', fontWeight: 'bold', border: `1px solid ${isConnected ? 'rgba(0, 255, 204, 0.5)' : 'rgba(255, 68, 68, 0.5)'}` });
const buzzerControlContainer = { padding: '20px 20px 0 20px', display: 'flex', justifyContent: 'center', zIndex: 10 };
const buzzerButtonStyle = (isBuzzerOn, isConnected) => ({ width: '100%', maxWidth: '350px', padding: '12px 20px', borderRadius: '12px', border: 'none', backgroundColor: isBuzzerOn ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: isBuzzerOn ? '#ff4444' : '#aaaaaa', fontSize: '16px', fontWeight: 'bold', cursor: isConnected ? 'pointer' : 'not-allowed', border: `1px solid ${isBuzzerOn ? '#ff4444' : 'rgba(255,255,255,0.2)'}`, transition: 'all 0.3s ease', boxShadow: isBuzzerOn ? '0 0 15px rgba(255, 68, 68, 0.3)' : 'none', opacity: isConnected ? 1 : 0.5 });
const mainStyle = { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', overflow: 'hidden' };
const footerStyle = { padding: '15px', textAlign: 'center', fontSize: '12px', color: '#888', backgroundColor: '#16162a', borderTop: '1px solid rgba(255,255,255,0.05)' };

export default App;
