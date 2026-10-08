import React from 'react';
import './Radar.css';

const Radar = ({ data }) => {
  // 거리에 따라 클래스(안전/경고/위험)를 반환하는 함수
  const getZoneClass = (dist) => {
    if (dist <= 20) return 'danger';
    if (dist <= 100) return 'warning';
    return 'safe'; // 100 초과 또는 999 (측정 불가)
  };

  return (
    <div className="radar-container">
      {/* 장식용 레이더 파동(링) */}
      <div className="radar-ring ring-1"></div>
      <div className="radar-ring ring-2"></div>
      <div className="radar-ring ring-3"></div>

      {/* 좌측 센서 감지 영역 */}
      <div className={`sensor-zone zone-left ${getZoneClass(data.left)}`}>
        <span className="dist-text">
          {data.left === 999 ? '안전' : `${data.left}cm`}
        </span>
      </div>
      
      {/* 우측 센서 감지 영역 */}
      <div className={`sensor-zone zone-right ${getZoneClass(data.right)}`}>
        <span className="dist-text">
          {data.right === 999 ? '안전' : `${data.right}cm`}
        </span>
      </div>
      
      {/* 후방 센서 감지 영역 */}
      <div className={`sensor-zone zone-back ${getZoneClass(data.back)}`}>
        <span className="dist-text">
          {data.back === 999 ? '안전' : `${data.back}cm`}
        </span>
      </div>

      {/* 중앙 자전거 아이콘 (탑뷰) */}
      <div className="bike-icon">
        <div className="wheel front-wheel"></div>
        <div className="frame"></div>
        <div className="wheel back-wheel"></div>
      </div>
    </div>
  );
};

export default Radar;
