import React from 'react';

export const SkeletonTable: React.FC = () => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
      <div style={{ height: '35px', backgroundColor: '#e9ecef', borderRadius: '4px', width: '100%' }}></div>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '15px' }}>
          <div style={{ height: '25px', backgroundColor: '#f1f3f5', borderRadius: '4px', flex: 1 }}></div>
          <div style={{ height: '25px', backgroundColor: '#f1f3f5', borderRadius: '4px', flex: 2 }}></div>
          <div style={{ height: '25px', backgroundColor: '#f1f3f5', borderRadius: '4px', flex: 1 }}></div>
        </div>
      ))}
    </div>
  );
};
