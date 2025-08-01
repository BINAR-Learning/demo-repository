import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
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
            width: '120px',
            height: '120px',
            border: '8px solid white',
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
              width: '8px',
              height: '36px',
              background: 'white',
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              transformOrigin: 'bottom center',
              borderRadius: '4px',
            }}
          />
          {/* Minute hand */}
          <div
            style={{
              width: '8px',
              height: '48px',
              background: 'white',
              position: 'absolute',
              top: '0px',
              left: '50%',
              transform: 'translateX(-50%)',
              transformOrigin: 'bottom center',
              borderRadius: '4px',
            }}
          />
          {/* Center dot */}
          <div
            style={{
              width: '12px',
              height: '12px',
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