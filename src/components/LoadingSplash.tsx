import React from 'react';
import '../index.css'; // הוספת קובץ CSS

export default function LoadingSplash() {
  return (
    <div className="loading-container">
      <div className="loading-icon">Trim</div>
      <div className="loading-text">Loading, please wait...</div> {/* טקסט קטן בתחתית */}
    </div>
  );
}
