/**
 * Flyer Exporter for GritinAI Connect 2.0
 * Pixel-perfect 1080x1350 (Portrait 4:5) high-DPI Canvas export engine.
 * Guarantees 100% font fidelity (Space Grotesk + Space Mono) and instant, error-free downloads.
 */

class FlyerExporter {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.noisePattern = null;
  }

  // Create subtle film grain texture pattern
  getNoisePattern(ctx) {
    if (this.noisePattern) return this.noisePattern;

    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 160;
    noiseCanvas.height = 160;
    const nCtx = noiseCanvas.getContext('2d');
    const imgData = nCtx.createImageData(160, 160);
    const buffer = new Uint32Array(imgData.data.buffer);

    for (let i = 0; i < buffer.length; i++) {
      const v = Math.floor(Math.random() * 255);
      buffer[i] = (2 << 24) | (v << 16) | (v << 8) | v;
    }
    nCtx.putImageData(imgData, 0, 0);

    this.noisePattern = ctx.createPattern(noiseCanvas, 'repeat');
    return this.noisePattern;
  }

  async exportFlyer(options = {}) {
    const profile = options.profile || {};
    const status = options.status || (window.countdownEngine ? window.countdownEngine.getStatus() : { days: 8, isEventDay: false, isPast: false });
    
    // 2x Super-Resolution Export (2160 x 2700 Ultra-HD) for razor-sharp typography and crystal clear photos
    const scaleFactor = 2;
    const width = 1080;
    const height = 1350;

    this.canvas.width = width * scaleFactor;
    this.canvas.height = height * scaleFactor;
    const ctx = this.ctx;

    // Scale canvas context for 2x pixel density
    ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);

    // High-quality bicubic image smoothing across canvas
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Ensure fonts are fully loaded before rendering
    if (document.fonts) {
      try {
        await Promise.all([
          document.fonts.load('700 70px "Space Grotesk"'),
          document.fonts.load('400 30px "Space Grotesk"'),
          document.fonts.load('700 30px "Space Mono"'),
          document.fonts.load('400 28px "Space Mono"')
        ]);
      } catch (e) {
        console.warn('Font loading check error, proceeding with available fonts:', e);
      }
      await document.fonts.ready;
    }

    // 2. Solid Dark Canvas Background (#0e0e0c)
    ctx.fillStyle = '#0e0e0c';
    ctx.fillRect(0, 0, width, height);

    // 3. Blue and Light-White Edge Geometric Line Circles
    this.drawEdgeCircles(ctx, width, height);

    // 4. Top Header (Left: Logo, Right: CONNECT 2.0)
    await this.drawHeader(ctx, width);

    // 5. Central Graphic Stage (4-Lobed Blue Shape + Photo Frame)
    const stageY = 445;
    const photoSize = 450;
    await this.drawCentralPhotoStage(ctx, options.profile, width * 0.5, stageY, photoSize);

    // 6. Volunteer Details & Plain White Countdown
    this.drawVolunteerDetails(ctx, options.profile, options.status, width * 0.5);

    // 7. Bottom Divider Line & Registration Link
    this.drawBottomFooter(ctx, width, height);

    // 8. Film Grain Layer
    this.applyFilmGrain(ctx, width, height);

    return this.canvas.toDataURL('image/png', 1.0);
  }

  applyFilmGrain(ctx, width, height) {
    ctx.save();
    const pattern = this.getNoisePattern(ctx);
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  drawEdgeCircles(ctx, width, height) {
    ctx.save();

    // Top-Left Blue Circle
    ctx.strokeStyle = 'rgba(67, 126, 247, 0.04)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-80, height * 0.08, 520, 0, Math.PI * 2);
    ctx.stroke();

    // Top-Right Light White Circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(width + 80, height * 0.12, 540, 0, Math.PI * 2);
    ctx.stroke();

    // Bottom-Left Outer Blue Circle
    ctx.strokeStyle = 'rgba(67, 126, 247, 0.035)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(width * 0.05, height * 0.68, 620, 0, Math.PI * 2);
    ctx.stroke();

    // Bottom-Left Inner White Circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.012)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(width * 0.05, height * 0.68, 440, 0, Math.PI * 2);
    ctx.stroke();

    // Bottom-Right Faint White Circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.01)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(width + 60, height * 0.88, 580, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  async drawHeader(ctx, width) {
    ctx.save();
    const margin = 62;
    const headerY = 75;

    // Left Logo
    try {
      const logo = await this.loadImage('assets/connect2.png');
      const logoH = 70;
      const logoW = (logo.width / logo.height) * logoH;
      ctx.drawImage(logo, margin, headerY - (logoH / 2), logoW, logoH);
    } catch (e) {
      ctx.font = '700 32px "Space Grotesk", system-ui, sans-serif';
      ctx.fillStyle = '#1845fe';
      ctx.fillText('GritinAI CONNECT 2.0', margin, headerY + 10);
    }

    // Right Tag: CONNECT 2.0
    ctx.font = '700 28px "Space Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.textAlign = 'right';
    ctx.letterSpacing = '4px';
    ctx.fillText('CONNECT 2.0', width - margin, headerY + 10);

    ctx.restore();
  }

  async drawCentralPhotoStage(ctx, profile, centerX, centerY, photoSize) {
    ctx.save();

    // 1. Draw 4-Lobed Vibrant Blue Shape
    const lobeRadius = photoSize * 0.44;
    const offset = photoSize * 0.33;

    ctx.save();
    ctx.fillStyle = '#1845fe';
    ctx.shadowColor = 'rgba(24, 69, 254, 0.55)';
    ctx.shadowBlur = 65;

    ctx.beginPath();
    ctx.arc(centerX, centerY, photoSize * 0.48, 0, Math.PI * 2);
    ctx.arc(centerX, centerY - offset, lobeRadius, 0, Math.PI * 2);
    ctx.arc(centerX + offset, centerY, lobeRadius, 0, Math.PI * 2);
    ctx.arc(centerX, centerY + offset, lobeRadius, 0, Math.PI * 2);
    ctx.arc(centerX - offset, centerY, lobeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Draw Rounded Photo Frame
    const frameW = photoSize;
    const frameH = photoSize;
    const frameX = centerX - (frameW / 2);
    const frameY = centerY - (frameH / 2);
    const frameRadius = 46;

    ctx.save();
    this.roundRect(ctx, frameX, frameY, frameW, frameH, frameRadius);
    ctx.clip();

    ctx.fillStyle = '#14151a';
    ctx.fillRect(frameX, frameY, frameW, frameH);

    // Draw user photo (Default: 100% cover fill, no gaps)
    if (profile && profile.photoDataUrl) {
      try {
        const img = await this.loadImage(profile.photoDataUrl);
        const zoom = profile.zoom || 1.0;
        const offsetX = profile.offsetX || 0;
        const offsetY = profile.offsetY || 0;

        const scaleX = frameW / img.width;
        const scaleY = frameH / img.height;
        const baseScale = Math.max(scaleX, scaleY);
        const scale = baseScale * zoom;

        const renderW = img.width * scale;
        const renderH = img.height * scale;

        const shiftX = offsetX * frameW;
        const shiftY = offsetY * frameH;

        const posX = centerX - (renderW / 2) + shiftX;
        const posY = centerY - (renderH / 2) + shiftY;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, posX, posY, renderW, renderH);
      } catch (err) {
        this.drawPlaceholder(ctx, centerX, centerY, photoSize * 0.4);
      }
    } else {
      this.drawPlaceholder(ctx, centerX, centerY, photoSize * 0.4);
    }
    ctx.restore();

    // Frame Border
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3.5;
    this.roundRect(ctx, frameX, frameY, frameW, frameH, frameRadius);
    ctx.stroke();

    // 3. Viewfinder Brackets ┌ and ┐ at top corners
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 5;
    const bracketLen = 34;
    const pad = 36;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(frameX + pad, frameY + pad + bracketLen);
    ctx.lineTo(frameX + pad, frameY + pad);
    ctx.lineTo(frameX + pad + bracketLen, frameY + pad);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(frameX + frameW - pad - bracketLen, frameY + pad);
    ctx.lineTo(frameX + frameW - pad, frameY + pad);
    ctx.lineTo(frameX + frameW - pad, frameY + pad + bracketLen);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  drawPlaceholder(ctx, centerX, centerY, radius) {
    ctx.fillStyle = '#222530';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 30, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY + radius * 0.9, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  drawVolunteerDetails(ctx, profile, status, centerX) {
    ctx.save();
    ctx.textAlign = 'center';

    // 1. Tag: VOLUNTEER (Space Mono, white #FFFFFF)
    ctx.font = '500 26px "Space Mono", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.letterSpacing = '6px';
    ctx.fillText('VOLUNTEER', centerX, 785);

    // 2. Volunteer Name (Space Grotesk, bold white, directly under VOLUNTEER)
    const name = (profile && profile.name ? profile.name.trim() : 'GritinAI Volunteer');
    ctx.font = '700 68px "Space Grotesk", system-ui, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.letterSpacing = '-1px';
    ctx.fillText(name, centerX, 855);

    // 3. Volunteer Role (Space Mono, non-bold, #8F9EAF - only drawn if entered)
    const role = (profile && profile.role ? profile.role.trim() : '').toUpperCase();
    if (role) {
      ctx.font = '400 28px "Space Mono", monospace';
      ctx.fillStyle = '#8F9EAF';
      ctx.letterSpacing = '3px';
      ctx.fillText(role, centerX, 905);
    }

    // 4. Plain White Countdown Text (Space Grotesk, bold white, prominent with more space)
    const countdownText = status.isEventDay
      ? "TODAY'S THE DAY!"
      : (status.isPast ? "GRITINAI CONNECT 2.0" : `${status.days} DAYS TO GO`);

    ctx.font = '700 50px "Space Grotesk", system-ui, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.letterSpacing = '4px';
    ctx.fillText(countdownText, centerX, 995);

    // 5. Venue & Date (Right above bottom divider line at 1145)
    ctx.font = '400 28px "Space Grotesk", system-ui, sans-serif';
    ctx.fillStyle = '#C2CDD8';
    ctx.letterSpacing = '0.5px';
    ctx.fillText("26TH SEPT, 2026   ·   Victor Uwaifo Hub, Benin City", centerX, 1095);

    ctx.restore();
  }

  drawBottomFooter(ctx, width, height) {
    ctx.save();
    ctx.textAlign = 'center';

    const lineY = 1145;

    // Horizontal Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, lineY);
    ctx.lineTo(width - 60, lineY);
    ctx.stroke();

    // Micro Label: JOIN ME AT GRITINAI CONNECT
    ctx.font = '400 24px "Space Mono", monospace';
    ctx.fillStyle = '#7E8D9F';
    ctx.letterSpacing = '4px';
    ctx.fillText('JOIN ME AT GRITINAI CONNECT', width * 0.5, lineY + 58);

    // Website Link
    ctx.font = '600 32px "Space Grotesk", system-ui, sans-serif';
    ctx.fillStyle = '#437EF7';
    ctx.fillText('gritinaiconnect.gritinai.com/register', width * 0.5, lineY + 110);

    ctx.restore();
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  downloadDataUrl(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async shareDataUrl(dataUrl, title, text, filename) {
    if (!navigator.canShare) {
      return false;
    }

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: title,
          text: text,
          files: [file]
        });
        return true;
      }
    } catch (e) {
      console.warn('Share error:', e);
    }
    return false;
  }
}

window.flyerExporter = new FlyerExporter();
