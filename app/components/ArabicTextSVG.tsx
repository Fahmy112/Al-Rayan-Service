import React from 'react';

interface ArabicTextSVGProps {
  text: string;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
}

const ArabicTextSVG: React.FC<ArabicTextSVGProps> = ({ text, fontSize = 15, color = "#222", fontWeight = "500" }) => {
  // SVG for text display
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${fontSize * 1.5}">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700&display=swap');
    </style>
    <text
      x="100%"
      y="${fontSize * 1.2}"
      text-anchor="end"
      direction="rtl"
      font-family="Cairo, Tahoma, Arial, sans-serif"
      font-size="${fontSize}"
      font-weight="${fontWeight}"
      fill="${color}"
    >
      ${text}
    </text>
  </svg>`;

  const encodedSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return <img src={encodedSvg} alt={text} style={{ width: "100%", height: "auto", display: "block" }} />;
};

export default ArabicTextSVG;