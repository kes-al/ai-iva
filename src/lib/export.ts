import JSZip from 'jszip';
import { IVA, SlideData, ExportManifest } from './types';
import { getTemplateById } from './templates';

export async function exportIVA(iva: IVA): Promise<Blob> {
  const zip = new JSZip();

  // Add manifest
  const manifest: ExportManifest = {
    name: iva.metadata.name || 'Untitled IVA',
    brand: iva.metadata.brand,
    version: '1.0',
    slideCount: iva.slides.length,
    createdAt: new Date().toISOString(),
    createdBy: 'IVA Builder',
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // Create slides folder and render each slide
  const slidesFolder = zip.folder('slides');
  for (let i = 0; i < iva.slides.length; i++) {
    const slideHtml = renderSlideToHTML(iva.slides[i], i + 1, iva.metadata.brand);
    slidesFolder?.file(`slide-${i + 1}.html`, slideHtml);
  }

  // Add CSS
  const cssFolder = zip.folder('assets/css');
  cssFolder?.file('styles.css', getBaseStyles(iva.metadata.brand));

  // Add JS
  const jsFolder = zip.folder('assets/js');
  jsFolder?.file('navigation.js', getNavigationJS(iva.slides.length));

  // Add index.html
  zip.file('index.html', renderIndexHTML(iva));

  // Add ISI if any slide has it
  const hasISI = iva.slides.some((slide) => slide.slots.isi);
  if (hasISI) {
    const sharedFolder = zip.folder('shared');
    sharedFolder?.file('isi.html', renderISI(iva.metadata.brand));
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function renderSlideToHTML(slide: SlideData, slideNumber: number, brand: string): string {
  const template = getTemplateById(slide.templateId);
  const templateName = template?.name || 'Slide';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slide ${slideNumber} - ${templateName}</title>
  <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
  <div class="slide" id="slide-${slideNumber}" data-template="${slide.templateId}">
    ${renderSlideContent(slide)}
  </div>
</body>
</html>`;
}

function renderSlideContent(slide: SlideData): string {
  const slots = slide.slots;

  switch (slide.templateId) {
    case 'title-slide':
      return `
    <div class="title-slide">
      <h1 class="headline">${escapeHtml(slots.headline || '')}</h1>
      ${slots.subhead ? `<h2 class="subhead">${escapeHtml(slots.subhead)}</h2>` : ''}
    </div>`;

    case 'content-image-split':
      return `
    <div class="content-image-split">
      <div class="content-side">
        <h2 class="headline">${escapeHtml(slots.headline || '')}</h2>
        <div class="body">${escapeHtml(slots.body || '')}</div>
      </div>
      <div class="image-side">
        ${slots.image ? `<img src="${escapeHtml(slots.image)}" alt="Slide content">` : '<div class="placeholder">Image</div>'}
      </div>
      ${slots.isi ? `<div class="isi">${escapeHtml(slots.isi)}</div>` : ''}
    </div>`;

    case 'full-image-overlay':
      return `
    <div class="full-image-overlay" ${slots.image ? `style="background-image: url('${escapeHtml(slots.image)}')"` : ''}>
      <div class="overlay-box">
        <h2 class="headline">${escapeHtml(slots.headline || '')}</h2>
        ${slots.body ? `<div class="body">${escapeHtml(slots.body)}</div>` : ''}
      </div>
      ${slots.isi ? `<div class="isi">${escapeHtml(slots.isi)}</div>` : ''}
    </div>`;

    case 'three-column':
      return `
    <div class="three-column">
      <h2 class="headline">${escapeHtml(slots.headline || '')}</h2>
      <div class="columns">
        <div class="column">
          <h3>${escapeHtml(slots['column1-title'] || '')}</h3>
          <p>${escapeHtml(slots['column1-body'] || '')}</p>
        </div>
        <div class="column">
          <h3>${escapeHtml(slots['column2-title'] || '')}</h3>
          <p>${escapeHtml(slots['column2-body'] || '')}</p>
        </div>
        <div class="column">
          <h3>${escapeHtml(slots['column3-title'] || '')}</h3>
          <p>${escapeHtml(slots['column3-body'] || '')}</p>
        </div>
      </div>
      ${slots.isi ? `<div class="isi">${escapeHtml(slots.isi)}</div>` : ''}
    </div>`;

    case 'data-chart-focus':
      return `
    <div class="data-chart-focus">
      <h2 class="headline">${escapeHtml(slots.headline || '')}</h2>
      <div class="chart-area">
        ${slots.chart ? `<img src="${escapeHtml(slots.chart)}" alt="Chart">` : '<div class="placeholder">Chart</div>'}
      </div>
      ${slots.caption ? `<p class="caption">${escapeHtml(slots.caption)}</p>` : ''}
      ${slots.isi ? `<div class="isi">${escapeHtml(slots.isi)}</div>` : ''}
    </div>`;

    case 'bullet-list':
      const bullets = (slots.bullets || '').split('\n').filter((b) => b.trim());
      return `
    <div class="bullet-list">
      <h2 class="headline">${escapeHtml(slots.headline || '')}</h2>
      <div class="content-area">
        <ul class="bullets">
          ${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('\n          ')}
        </ul>
        ${slots.image ? `<div class="image-area"><img src="${escapeHtml(slots.image)}" alt="Supporting image"></div>` : ''}
      </div>
      ${slots.isi ? `<div class="isi">${escapeHtml(slots.isi)}</div>` : ''}
    </div>`;

    default:
      return `<div class="default-slide">
      ${Object.entries(slots)
        .map(([key, value]) => `<div class="${key}">${escapeHtml(value || '')}</div>`)
        .join('\n      ')}
    </div>`;
  }
}

function renderIndexHTML(iva: IVA): string {
  const slideDivs = iva.slides
    .map(
      (slide, i) => `
    <div class="slide ${i === 0 ? 'active' : ''}" id="slide-${i + 1}">
      ${renderSlideContent(slide)}
    </div>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(iva.metadata.name || 'IVA Presentation')}</title>
  <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
  <div class="presentation" data-brand="${iva.metadata.brand}">
    ${slideDivs}
  </div>

  <div class="navigation">
    <button class="nav-btn prev" onclick="prevSlide()" aria-label="Previous slide">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
      </svg>
    </button>
    <span class="slide-counter">
      <span id="current-slide">1</span> / <span id="total-slides">${iva.slides.length}</span>
    </span>
    <button class="nav-btn next" onclick="nextSlide()" aria-label="Next slide">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
      </svg>
    </button>
  </div>

  <script src="assets/js/navigation.js"></script>
</body>
</html>`;
}

function getBaseStyles(brand: string): string {
  return `/* IVA Builder - Generated Styles */
:root {
  --bms-blue: #0033a0;
  --bms-light-blue: #0072ce;
  --bms-orange: #ff6600;
  --primary: var(--bms-blue);
  --secondary: var(--bms-light-blue);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #1a1a1a;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.presentation {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.slide {
  display: none;
  width: 100%;
  max-width: 1200px;
  aspect-ratio: 16 / 9;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  overflow: hidden;
}

.slide.active {
  display: block;
}

/* Title Slide */
.title-slide {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 2rem;
  text-align: center;
}

.title-slide .headline {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.title-slide .subhead {
  font-size: 1.5rem;
  font-weight: 400;
  opacity: 0.9;
}

/* Content + Image Split */
.content-image-split {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
}

.content-image-split .content-side {
  padding: 2rem;
}

.content-image-split .image-side {
  background: #f5f5f5;
}

.content-image-split .image-side img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content-image-split .headline {
  color: var(--primary);
  font-size: 1.75rem;
  margin-bottom: 1rem;
}

.content-image-split .body {
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
}

/* Full Image Overlay */
.full-image-overlay {
  height: 100%;
  background-size: cover;
  background-position: center;
  background-color: #333;
  position: relative;
}

.full-image-overlay .overlay-box {
  position: absolute;
  bottom: 4rem;
  left: 2rem;
  max-width: 50%;
  background: rgba(255,255,255,0.95);
  padding: 1.5rem;
  border-radius: 8px;
}

.full-image-overlay .headline {
  color: var(--primary);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

/* Three Column */
.three-column {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.three-column .headline {
  text-align: center;
  color: var(--primary);
  font-size: 2rem;
  margin-bottom: 2rem;
}

.three-column .columns {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.three-column .column {
  text-align: center;
}

.three-column .column h3 {
  color: var(--primary);
  margin-bottom: 0.5rem;
}

/* Data Chart Focus */
.data-chart-focus {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.data-chart-focus .headline {
  color: var(--primary);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.data-chart-focus .chart-area {
  flex: 1;
  background: #f9f9f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.data-chart-focus .chart-area img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.data-chart-focus .caption {
  font-size: 0.875rem;
  color: #666;
  font-style: italic;
  margin-top: 1rem;
}

/* Bullet List */
.bullet-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.bullet-list .headline {
  color: var(--primary);
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.bullet-list .content-area {
  flex: 1;
  display: flex;
  gap: 2rem;
}

.bullet-list .bullets {
  flex: 1;
  list-style: none;
}

.bullet-list .bullets li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  line-height: 1.5;
}

.bullet-list .bullets li::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  margin-top: 0.5rem;
  flex-shrink: 0;
}

.bullet-list .image-area {
  width: 33%;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.bullet-list .image-area img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ISI Section */
.isi {
  grid-column: 1 / -1;
  background: #f5f5f5;
  padding: 1rem;
  font-size: 0.75rem;
  color: #666;
  border-top: 1px solid #ddd;
  max-height: 100px;
  overflow-y: auto;
}

/* Navigation */
.navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  background: rgba(0,0,0,0.8);
}

.nav-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.nav-btn:hover {
  background: rgba(255,255,255,0.2);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.slide-counter {
  color: white;
  font-size: 1rem;
}

/* Placeholder */
.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  color: #999;
}
`;
}

function getNavigationJS(slideCount: number): string {
  return `// IVA Builder - Navigation Script
let currentSlide = 1;
const totalSlides = ${slideCount};

function goToSlide(n) {
  if (n < 1 || n > totalSlides) return;

  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  document.querySelector('#slide-' + n).classList.add('active');

  currentSlide = n;
  document.getElementById('current-slide').textContent = currentSlide;

  // Update button states
  document.querySelector('.nav-btn.prev').disabled = currentSlide === 1;
  document.querySelector('.nav-btn.next').disabled = currentSlide === totalSlides;
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSlide();
  }
});

// Touch/swipe support
let touchStartX = 0;
document.addEventListener('touchstart', function(e) {
  touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchend', function(e) {
  const diff = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      prevSlide();
    } else {
      nextSlide();
    }
  }
});

// Initialize
goToSlide(1);
`;
}

function renderISI(brand: string): string {
  // ISI content would typically come from a database or content management system
  // This is placeholder content
  return `<div class="isi-content">
  <h4>IMPORTANT SAFETY INFORMATION</h4>
  <p>Please see full Prescribing Information for ${brand}.</p>
  <p>This is placeholder ISI content. In production, this would contain the actual Important Safety Information for ${brand}.</p>
</div>`;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
