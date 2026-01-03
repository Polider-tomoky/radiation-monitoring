const maxRandomValue = 1.5;
let targetValue = 0.1;    
let displayValue = 0.1;   
let historicalData = [];

for (let i = 0; i < 60; i++) {
  historicalData.push(0.08 + Math.random() * 0.08);
}

function getLevel(value) {
  if (value < 0.3) return 'NORMAL';
  if (value < 1) return 'ELEVATED';
  return 'DANGER';
}

function getColor(value) {
  if (value < 0.3) return '#3b82f6';
  if (value < 1) return '#eab308';
  return '#ef4444';
}

function drawNowDoseChart(value = displayValue) {
    const canvas = document.getElementById('nowDoseChar');
    const ctx = canvas.getContext('2d');

    const centerX = canvas.width / 2;
    const radius = 120; 
    const lineWidth = 30;

    const parentRect = canvas.parentElement.getBoundingClientRect();

    // Адаптивное смещение по Y относительно родителя
    const parentWidth = canvas.parentElement.getBoundingClientRect().width;

    let offsetY;

    if (parentWidth < 400) {       // маленькие экраны (телефон)
        offsetY = canvas.height * 0.7; 
    } else {                       // большие экраны (ПК)
        offsetY = canvas.height * 0.37;
    }

    const centerY = canvas.height - radius - lineWidth / 2 + offsetY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Фон
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.stroke();

    const maxValue = 1.0;
    const percentage = Math.min(value / maxValue, 1);
    const endAngle = Math.PI + (Math.PI * percentage);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, endAngle);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = getColor(value);
    ctx.globalAlpha = 0.9;
    ctx.stroke();
    ctx.globalAlpha = 1;
}


function drawLastMinChart() {
  const canvas = document.getElementById('lastMinChart');
  const ctx = canvas.getContext('2d');
  
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = 160 * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const width = rect.width;
  const height = 160;
  const padding = { top: 10, right: 10, bottom: 30, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
  }

  const maxValue = Math.max(...historicalData, 0.5);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
      const value = maxValue - (maxValue / 4) * i;
      const y = padding.top + (chartHeight / 4) * i;
      ctx.fillText(value.toFixed(2), padding.left - 5, y + 4);
  }

  ctx.textAlign = 'center';
  for (let i = 0; i <= 4; i++) {
      const x = padding.left + (chartWidth / 4) * i;
      const seconds = Math.floor((60 / 4) * i);
      ctx.fillText(`${seconds}s`, x, height - 10);
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();

  if (historicalData.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.8;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      for (let i = 0; i < historicalData.length; i++) {
          const x = padding.left + (chartWidth / (historicalData.length - 1)) * i;
          const normalizedValue = 1 - (historicalData[i] / maxValue);
          const y = padding.top + chartHeight * normalizedValue;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
  }
}

function updateDisplay() {
  document.getElementById('currentValue').textContent = displayValue.toFixed(3);
  document.getElementById('currentValue').style.color = getColor(displayValue);

  const status = getLevel(displayValue);
  document.getElementById('status').textContent = status;
  document.getElementById('status').style.color = getColor(displayValue);

  const glow = document.getElementById('glow');
  glow.style.background = `radial-gradient(circle, ${getColor(displayValue)} 0%, transparent 70%)`;

  document.getElementById('segment-normal').style.opacity = displayValue < 0.3 ? '1' : '0.3';
  document.getElementById('segment-elevated').style.opacity = 
      (displayValue >= 0.3 && displayValue < 1) ? '1' : '0.3';
  document.getElementById('segment-danger').style.opacity = displayValue >= 1 ? '1' : '0.3';

  const now = new Date();
  document.getElementById('time').textContent = now.toLocaleTimeString('en-US', { hour12: false });

  drawNowDoseChart();
  drawLastMinChart();
}

function animate() {
  const speed = 0.06; 
  displayValue += (targetValue - displayValue) * speed;
  updateDisplay();
  requestAnimationFrame(animate);
}

function simulateReading() {
  targetValue = Math.random() * maxRandomValue; 

  historicalData.push(targetValue);
  if (historicalData.length > 60) historicalData.shift();
}

function resizeGaugeCanvas() {
    const canvas = document.getElementById('nowDoseChar');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.width / 2; 
    drawNowDoseChart();
}

window.addEventListener('resize', resizeGaugeCanvas);
window.addEventListener('load', resizeGaugeCanvas);


updateDisplay();
setInterval(simulateReading, 1000);
animate();

window.addEventListener('resize', () => {
  drawLastMinChart();
  drawNowDoseChart();
});
