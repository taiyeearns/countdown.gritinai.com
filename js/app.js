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
  const dropzoneChangeOverlay = document.getElementById('dropzoneChangeOverlay');
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

  // State
  let currentProfile = {
    name: '',
    role: '',
    photoDataUrl: null,
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
    // Default: live date calculation
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
          dropzonePreviewImg.src = currentProfile.photoDataUrl;
          dropzonePreviewImg.classList.remove('hidden');
          dropzoneContent.classList.add('hidden');
          dropzoneChangeOverlay.classList.remove('hidden');
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

    // Role only displays if entered; never shows dummy text or placeholder
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

  photoZoomInput.addEventListener('input', () => {
    currentProfile.zoom = parseFloat(photoZoomInput.value);
    if (dropzonePreviewImg) {
      dropzonePreviewImg.style.transform = `scale(${currentProfile.zoom})`;
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
      syncMockupPreview();
    });
  }

  // 5. Photo Upload Handling
  dropzone.addEventListener('click', () => photoFileInput.click());

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
      currentProfile.photoDataUrl = event.target.result;
      currentProfile.zoom = 1.0;
      photoZoomInput.value = 1.0;

      dropzonePreviewImg.src = currentProfile.photoDataUrl;
      dropzonePreviewImg.style.transform = 'scale(1)';
      dropzonePreviewImg.classList.remove('hidden');
      dropzoneContent.classList.add('hidden');
      dropzoneChangeOverlay.classList.remove('hidden');
      photoZoomControl.classList.remove('hidden');

      showLiveFlyer();
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
      currentProfile = { name: '', role: '', photoDataUrl: null, zoom: 1.0 };
      nameInput.value = '';
      roleInput.value = '';
      photoZoomInput.value = 1.0;
      dropzonePreviewImg.src = '';
      dropzonePreviewImg.classList.add('hidden');
      dropzoneContent.classList.remove('hidden');
      dropzoneChangeOverlay.classList.add('hidden');
      photoZoomControl.classList.add('hidden');
      returnBanner.classList.add('hidden');
      emptyPlaceholder.classList.remove('hidden');
      liveFlyerMockup.classList.add('hidden');
      photoFileInput.value = '';
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
