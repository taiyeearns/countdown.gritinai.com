/**
 * Main Application Controller for GritinAI Connect 2.0 Volunteer Flyer Generator
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const returnBanner = document.getElementById('returnBanner');
  const returnName = document.getElementById('returnName');
  const resetProfileBtn = document.getElementById('resetProfileBtn');

  // Form elements
  const dropzone = document.getElementById('dropzone');
  const dropzoneContent = document.getElementById('dropzoneContent');
  const dropzonePreviewImg = document.getElementById('dropzonePreviewImg');
  const dropzoneActiveOverlay = document.getElementById('dropzoneActiveOverlay');
  const adjustCropBtn = document.getElementById('adjustCropBtn');
  const changePhotoBtn = document.getElementById('changePhotoBtn');
  const photoFileInput = document.getElementById('photoFileInput');
  const photoZoomControl = document.getElementById('photoZoomControl');
  const photoZoomInput = document.getElementById('photoZoom');
  const resetZoomBtn = document.getElementById('resetZoomBtn');
  const nameInput = document.getElementById('nameInput');
  const roleInput = document.getElementById('roleInput');
  const nameError = document.getElementById('nameError');
  const roleError = document.getElementById('roleError');
  const generateBtn = document.getElementById('generateBtn');

  // Preview elements
  const emptyPlaceholder = document.getElementById('emptyPlaceholder');
  const liveFlyerMockup = document.getElementById('liveFlyerMockup');
  const mockPhotoImg = document.getElementById('mockPhotoImg');
  const mockName = document.getElementById('mockName');
  const mockRole = document.getElementById('mockRole');
  const mockCountdownBadgeText = document.getElementById('mockCountdownBadgeText');
  const downloadBtn = document.getElementById('downloadBtn');
  const shareBtn = document.getElementById('shareBtn');
  const clearBtn = document.getElementById('clearBtn');
  const dayOverrideSelect = document.getElementById('dayOverrideSelect');

  // WhatsApp-Style Crop Modal Elements
  const cropModal = document.getElementById('cropModal');
  const cropModalBackdrop = document.getElementById('cropModalBackdrop');
  const cropCloseBtn = document.getElementById('cropCloseBtn');
  const cropCancelBtn = document.getElementById('cropCancelBtn');
  const cropDefaultBtn = document.getElementById('cropDefaultBtn');
  const cropDoneBtn = document.getElementById('cropDoneBtn');
  const cropStage = document.getElementById('cropStage');
  const cropSourceImg = document.getElementById('cropSourceImg');
  const cropBox = document.getElementById('cropBox');

  // State
  let rawPhotoDataUrl = null;
  let currentProfile = {
    name: '',
    role: '',
    photoDataUrl: null,
    rawPhotoDataUrl: null,
    zoom: 1.0
  };

  // Validation function: checks both fields, displays inline error message, and focuses incomplete input
  function validateInputs() {
    let isValid = true;
    let firstInvalid = null;

    const nameVal = (nameInput.value || '').trim();
    const roleVal = (roleInput.value || '').trim();

    if (!nameVal) {
      nameInput.classList.add('input-error');
      if (nameError) {
        nameError.textContent = 'Please enter your name';
        nameError.classList.remove('hidden');
      }
      isValid = false;
      if (!firstInvalid) firstInvalid = nameInput;
    } else {
      nameInput.classList.remove('input-error');
      if (nameError) nameError.classList.add('hidden');
    }

    if (!roleVal) {
      roleInput.classList.add('input-error');
      if (roleError) {
        roleError.textContent = 'Please enter your volunteer role';
        roleError.classList.remove('hidden');
      }
      isValid = false;
      if (!firstInvalid) firstInvalid = roleInput;
    } else {
      roleInput.classList.remove('input-error');
      if (roleError) roleError.classList.add('hidden');
    }

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
  }

  // 1. Initial Countdown Sync
  function updateCountdownUI() {
    const status = window.countdownEngine.getStatus();

    if (status.isEventDay) {
      if (mockCountdownBadgeText) {
        mockCountdownBadgeText.textContent = "TODAY'S THE DAY!";
      }
    } else if (status.isPast) {
      if (mockCountdownBadgeText) {
        mockCountdownBadgeText.textContent = "GRITINAI CONNECT 2.0";
      }
    } else {
      if (mockCountdownBadgeText) {
        mockCountdownBadgeText.textContent = `${status.days} DAYS TO GO`;
      }
    }
  }

  // 2. Load Stored Profile
  async function loadInitialProfile() {
    window.countdownEngine.setOverrideDays(null);
    updateCountdownUI();

    try {
      const stored = await window.profileStorage.getProfile();
      if (stored && (stored.name || stored.photoDataUrl)) {
        currentProfile = { ...currentProfile, ...stored };

        nameInput.value = currentProfile.name || '';
        roleInput.value = currentProfile.role || '';
        photoZoomInput.value = currentProfile.zoom || 1.0;

        if (currentProfile.photoDataUrl) {
          dropzone.classList.add('has-photo');
          dropzonePreviewImg.src = currentProfile.photoDataUrl;
          dropzonePreviewImg.style.transform = `scale(${currentProfile.zoom || 1.0})`;
          dropzonePreviewImg.classList.remove('hidden');
          dropzoneContent.classList.add('hidden');
          if (dropzoneActiveOverlay) {
            dropzoneActiveOverlay.classList.remove('hidden');
          }
          photoZoomControl.classList.remove('hidden');
        }

        // Show return banner
        returnName.textContent = currentProfile.name ? currentProfile.name.split(' ')[0] : 'Volunteer';
        returnBanner.classList.remove('hidden');

        // Show live preview
        showLiveFlyer();
      }
    } catch (e) {
      console.warn('Could not read stored profile:', e);
    }
  }

  // 3. Show Live Flyer
  function showLiveFlyer() {
    emptyPlaceholder.classList.add('hidden');
    liveFlyerMockup.classList.remove('hidden');
    syncMockupPreview();
  }

  // 4. Synchronize Mockup Preview
  function syncMockupPreview() {
    const nameVal = (nameInput.value || currentProfile.name || 'GritinAI Volunteer').trim();
    mockName.textContent = nameVal;

    const roleVal = (roleInput.value || currentProfile.role || '').trim();
    mockRole.textContent = roleVal ? roleVal.toUpperCase() : '';

    if (currentProfile.photoDataUrl) {
      mockPhotoImg.src = currentProfile.photoDataUrl;
      const zoom = currentProfile.zoom || 1.0;
      mockPhotoImg.style.transform = `scale(${zoom})`;
    } else {
      mockPhotoImg.src = 'assets/placeholder.svg';
      mockPhotoImg.style.transform = 'scale(1)';
    }

    updateCountdownUI();
  }

  // Live input synchronization with automatic error clearing
  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim().length > 0) {
      nameInput.classList.remove('input-error');
      if (nameError) nameError.classList.add('hidden');
    }
    currentProfile.name = nameInput.value;
    if (nameInput.value.trim().length > 0 || currentProfile.photoDataUrl) {
      showLiveFlyer();
    }
    syncMockupPreview();
  });

  roleInput.addEventListener('input', () => {
    if (roleInput.value.trim().length > 0) {
      roleInput.classList.remove('input-error');
      if (roleError) roleError.classList.add('hidden');
    }
    currentProfile.role = roleInput.value;
    syncMockupPreview();
  });

  // Post-crop Photo Zoom Slider
  photoZoomInput.addEventListener('input', () => {
    currentProfile.zoom = parseFloat(photoZoomInput.value) || 1.0;
    if (dropzonePreviewImg) {
      dropzonePreviewImg.style.transform = `scale(${currentProfile.zoom})`;
    }
    if (mockPhotoImg && currentProfile.photoDataUrl) {
      mockPhotoImg.style.transform = `scale(${currentProfile.zoom})`;
    }
    syncMockupPreview();
  });

  // Default Zoom Reset Button
  if (resetZoomBtn) {
    resetZoomBtn.addEventListener('click', () => {
      photoZoomInput.value = 1.0;
      currentProfile.zoom = 1.0;
      if (dropzonePreviewImg) {
        dropzonePreviewImg.style.transform = 'scale(1)';
      }
      if (mockPhotoImg && currentProfile.photoDataUrl) {
        mockPhotoImg.style.transform = 'scale(1)';
      }
      syncMockupPreview();
    });
  }

  // =========================================================================
  // WhatsApp-Style Photo Cropper Logic
  // =========================================================================
  let cropState = {
    imgW: 0,
    imgH: 0,
    size: 0,
    x: 0,
    y: 0
  };

  function openCropModal(imageUrl) {
    if (!imageUrl) return;
    rawPhotoDataUrl = imageUrl;

    // Reset inline stage dimensions
    cropStage.style.width = '';
    cropStage.style.height = '';

    cropModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Preload image to ensure natural dimensions exist and image is cached
    const temp = new Image();
    temp.onload = () => {
      cropSourceImg.src = imageUrl;
      // Double rAF ensures modal display: flex has painted and image has layout dimensions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          initCropBox();
        });
      });
    };
    temp.src = imageUrl;
  }

  function closeCropModal() {
    cropModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function initCropBox(retry = 0) {
    const rect = cropSourceImg.getBoundingClientRect();
    const imgW = Math.round(rect.width);
    const imgH = Math.round(rect.height);

    if (imgW <= 10 || imgH <= 10) {
      if (retry < 25) {
        requestAnimationFrame(() => initCropBox(retry + 1));
      }
      return;
    }

    cropStage.style.width = `${imgW}px`;
    cropStage.style.height = `${imgH}px`;

    // WhatsApp-style square crop: fits the shorter side of the photo
    const size = Math.min(imgW, imgH);
    // Center the square by default
    const x = Math.max(0, (imgW - size) / 2);
    const y = Math.max(0, (imgH - size) / 2);

    cropState = { imgW, imgH, size, x, y };
    applyCropBoxStyle();
  }

  function applyCropBoxStyle() {
    cropBox.style.width = `${Math.round(cropState.size)}px`;
    cropBox.style.height = `${Math.round(cropState.size)}px`;
    cropBox.style.left = `${Math.round(cropState.x)}px`;
    cropBox.style.top = `${Math.round(cropState.y)}px`;
    cropBox.style.transform = 'none';
  }

  if (cropCloseBtn) cropCloseBtn.addEventListener('click', closeCropModal);
  if (cropCancelBtn) cropCancelBtn.addEventListener('click', closeCropModal);
  if (cropModalBackdrop) cropModalBackdrop.addEventListener('click', closeCropModal);

  // Default button in Cropper: reset square to center
  if (cropDefaultBtn) {
    cropDefaultBtn.addEventListener('click', () => {
      cropState.x = Math.max(0, (cropState.imgW - cropState.size) / 2);
      cropState.y = Math.max(0, (cropState.imgH - cropState.size) / 2);
      applyCropBoxStyle();
    });
  }

  // Pointer dragging for the square crop box
  let isDraggingCrop = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initCropBoxX = 0;
  let initCropBoxY = 0;

  cropBox.addEventListener('pointerdown', (e) => {
    isDraggingCrop = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    initCropBoxX = cropState.x;
    initCropBoxY = cropState.y;

    cropBox.classList.add('is-dragging');
    cropBox.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  cropBox.addEventListener('pointermove', (e) => {
    if (!isDraggingCrop) return;

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    const maxX = Math.max(0, cropState.imgW - cropState.size);
    const maxY = Math.max(0, cropState.imgH - cropState.size);

    cropState.x = Math.max(0, Math.min(maxX, initCropBoxX + dx));
    cropState.y = Math.max(0, Math.min(maxY, initCropBoxY + dy));

    applyCropBoxStyle();
  });

  function stopCropDrag(e) {
    if (!isDraggingCrop) return;
    isDraggingCrop = false;
    cropBox.classList.remove('is-dragging');
    if (e && e.pointerId && cropBox.hasPointerCapture(e.pointerId)) {
      try {
        cropBox.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  }

  cropBox.addEventListener('pointerup', stopCropDrag);
  cropBox.addEventListener('pointercancel', stopCropDrag);

  // Clicking on crop stage outside cropBox snaps square to that position
  cropStage.addEventListener('pointerdown', (e) => {
    if (e.target === cropBox || cropBox.contains(e.target)) return;
    const rect = cropStage.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const half = cropState.size / 2;
    const maxX = Math.max(0, cropState.imgW - cropState.size);
    const maxY = Math.max(0, cropState.imgH - cropState.size);

    cropState.x = Math.max(0, Math.min(maxX, clickX - half));
    cropState.y = Math.max(0, Math.min(maxY, clickY - half));
    applyCropBoxStyle();
  });

  // Re-adjust crop box if window resizes while modal is open
  window.addEventListener('resize', () => {
    if (!cropModal.classList.contains('hidden')) {
      initCropBox();
    }
  });

  // Done button in Crop Modal: extract square crop from original image via Canvas
  if (cropDoneBtn) {
    cropDoneBtn.addEventListener('click', () => {
      const natW = cropSourceImg.naturalWidth;
      const natH = cropSourceImg.naturalHeight;

      if (!natW || !natH) {
        closeCropModal();
        return;
      }

      const imgW = cropState.imgW || cropSourceImg.offsetWidth || natW;
      const scale = natW / imgW;

      const size = cropState.size || Math.min(cropState.imgW || imgW, cropState.imgH || cropSourceImg.offsetHeight || natH);
      const sx = Math.max(0, cropState.x * scale);
      const sy = Math.max(0, cropState.y * scale);
      const sSize = Math.min(size * scale, Math.min(natW, natH));

      // High-resolution square output
      const targetSize = Math.min(Math.round(sSize), 1200);
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(cropSourceImg, sx, sy, sSize, sSize, 0, 0, targetSize, targetSize);

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.94);

      currentProfile.photoDataUrl = croppedDataUrl;
      currentProfile.rawPhotoDataUrl = rawPhotoDataUrl;
      currentProfile.zoom = 1.0;
      currentProfile.offsetX = 0;
      currentProfile.offsetY = 0;
      photoZoomInput.value = 1.0;

      dropzone.classList.add('has-photo');
      dropzonePreviewImg.src = croppedDataUrl;
      dropzonePreviewImg.style.transform = 'scale(1)';
      dropzonePreviewImg.classList.remove('hidden');
      dropzoneContent.classList.add('hidden');
      if (dropzoneActiveOverlay) {
        dropzoneActiveOverlay.classList.remove('hidden');
      }
      photoZoomControl.classList.remove('hidden');

      mockPhotoImg.src = croppedDataUrl;
      mockPhotoImg.style.transform = 'scale(1)';

      closeCropModal();
      showLiveFlyer();
    });
  }

  // Dropzone button handlers
  if (adjustCropBtn) {
    adjustCropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const source = currentProfile.rawPhotoDataUrl || rawPhotoDataUrl || currentProfile.photoDataUrl;
      if (source) {
        openCropModal(source);
      }
    });
  }

  if (changePhotoBtn) {
    changePhotoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      photoFileInput.click();
    });
  }

  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('#adjustCropBtn') || e.target.closest('#changePhotoBtn')) return;
    if (!currentProfile.photoDataUrl) {
      photoFileInput.click();
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoFile(e.dataTransfer.files[0]);
    }
  });

  photoFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoFile(e.target.files[0]);
    }
  });

  function handlePhotoFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG or JPG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      openCropModal(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  // 6. Generate Button Action
  generateBtn.addEventListener('click', async () => {
    if (!validateInputs()) {
      return;
    }

    currentProfile.name = nameInput.value.trim();
    currentProfile.role = roleInput.value.trim();
    currentProfile.zoom = parseFloat(photoZoomInput.value) || 1.0;

    generateBtn.textContent = 'Saving...';
    await window.profileStorage.saveProfile(currentProfile);

    generateBtn.textContent = 'generate_flyer()';
    returnName.textContent = currentProfile.name.split(' ')[0];
    returnBanner.classList.remove('hidden');
    showLiveFlyer();
  });

  // 7. Download Action (1:1 DOM capture into high-DPI PNG)
  downloadBtn.addEventListener('click', async () => {
    if (!validateInputs()) {
      return;
    }

    currentProfile.name = nameInput.value.trim();
    currentProfile.role = roleInput.value.trim();
    currentProfile.zoom = parseFloat(photoZoomInput.value) || 1.0;

    downloadBtn.disabled = true;
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = 'Exporting PNG...';

    try {
      const status = window.countdownEngine.getStatus();
      const dataUrl = await window.flyerExporter.exportFlyer({
        profile: currentProfile,
        status: status
      });

      const sanitizedName = (currentProfile.name || 'volunteer')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const filename = `connect2-volunteer-day${status.days}-${sanitizedName}.png`;

      window.flyerExporter.downloadDataUrl(dataUrl, filename);
    } catch (err) {
      console.error('Export error:', err);
      alert('Could not generate image. Please try again.');
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = originalText;
    }
  });

  // 8. Share Button
  shareBtn.addEventListener('click', async () => {
    if (!validateInputs()) {
      return;
    }

    currentProfile.name = nameInput.value.trim();
    currentProfile.role = roleInput.value.trim();
    currentProfile.zoom = parseFloat(photoZoomInput.value) || 1.0;
    try {
      const status = window.countdownEngine.getStatus();
      const dataUrl = await window.flyerExporter.exportFlyer({
        profile: currentProfile,
        status: status
      });

      const sanitizedName = (currentProfile.name || 'volunteer')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const filename = `connect2-volunteer-day${status.days}-${sanitizedName}.png`;

      const shared = await window.flyerExporter.shareDataUrl(
        dataUrl,
        `GritinAI Connect 2.0 - ${status.headline}`,
        `Counting down to GritinAI Connect 2.0! ${status.headline} at Victor Uwaifo Hub, Benin City.`,
        filename
      );

      if (!shared) {
        window.flyerExporter.downloadDataUrl(dataUrl, filename);
        alert('Flyer saved! You can now share it directly on your WhatsApp Status.');
      }
    } catch (e) {
      console.warn('Share error:', e);
    }
  });

  // 9. Clear / Reset
  async function handleReset() {
    if (confirm('Clear your saved flyer details?')) {
      await window.profileStorage.clearProfile();
      currentProfile = { name: '', role: '', photoDataUrl: null, rawPhotoDataUrl: null, zoom: 1.0 };
      rawPhotoDataUrl = null;
      nameInput.value = '';
      roleInput.value = '';
      photoZoomInput.value = 1.0;
      dropzone.classList.remove('has-photo');
      dropzonePreviewImg.src = '';
      dropzonePreviewImg.classList.add('hidden');
      dropzonePreviewImg.style.transform = 'scale(1)';
      dropzoneContent.classList.remove('hidden');
      if (dropzoneActiveOverlay) {
        dropzoneActiveOverlay.classList.add('hidden');
      }
      photoZoomControl.classList.add('hidden');
      returnBanner.classList.add('hidden');
      emptyPlaceholder.classList.remove('hidden');
      liveFlyerMockup.classList.add('hidden');
      photoFileInput.value = '';
      mockPhotoImg.src = 'assets/placeholder.svg';
      mockPhotoImg.style.transform = 'scale(1)';
    }
  }

  clearBtn.addEventListener('click', handleReset);
  resetProfileBtn.addEventListener('click', handleReset);

  // 10. Day Override Selector
  dayOverrideSelect.addEventListener('change', () => {
    const val = dayOverrideSelect.value;
    if (val === 'auto') {
      window.countdownEngine.setOverrideDays(null);
    } else {
      window.countdownEngine.setOverrideDays(parseInt(val, 10));
    }
    updateCountdownUI();
  });

  // Init
  await loadInitialProfile();
});
