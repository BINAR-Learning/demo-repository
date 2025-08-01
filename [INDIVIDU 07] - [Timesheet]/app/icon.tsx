import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '50%',
          position: 'relative',
        }}
      >
        {/* Clock icon */}
        <div
          style={{
            width: '20px',
            height: '20px',
            border: '2px solid white',
            borderRadius: '50%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Hour hand */}
          <div
            style={{
              width: '2px',
              height: '6px',
              background: 'white',
              position: 'absolute',
              top: '2px',
              left: '50%',
              transform: 'translateX(-50%)',
              transformOrigin: 'bottom center',
            }}
          />
          {/* Minute hand */}
          <div
            style={{
              width: '2px',
              height: '8px',
              background: 'white',
              position: 'absolute',
              top: '0px',
              left: '50%',
              transform: 'translateX(-50%)',
              transformOrigin: 'bottom center',
            }}
          />
          {/* Center dot */}
          <div
            style={{
              width: '2px',
              height: '2px',
              background: 'white',
              borderRadius: '50%',
              position: 'absolute',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
} 