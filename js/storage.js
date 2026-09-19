/**
 * Storage manager for GritinAI Countdown Flyer Generator.
 * Uses IndexedDB for reliable client-side photo storage (bypassing the 5MB localStorage limit)
 * and localStorage for quick metadata lookups.
 */

const DB_NAME = 'gritinai_volunteer_db';
const DB_VERSION = 1;
const STORE_NAME = 'profile_store';

class ProfileStorage {
  constructor() {
    this.db = null;
    this.initPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, falling back to localStorage');
        resolve(null);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB open error:', event.target.error);
        resolve(null);
      };
    });
  }

  async saveProfile(profile) {
    // profile: { name, role, photoDataUrl, zoom, offsetX, offsetY, updatedAt }
    await this.initPromise;

    // Save lightweight metadata to localStorage for instant sync
    const metadata = {
      name: profile.name || '',
      role: profile.role || '',
      zoom: profile.zoom || 1,
      offsetX: profile.offsetX || 0,
      offsetY: profile.offsetY || 0,
      updatedAt: Date.now()
    };
    try {
      localStorage.setItem('gritin_volunteer_meta', JSON.stringify(metadata));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // Save full profile (including high-res photo) into IndexedDB
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(profile, 'current_profile');
        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e);
      });
    } else {
      // Fallback to localStorage if IndexedDB failed
      try {
        localStorage.setItem('gritin_volunteer_profile', JSON.stringify(profile));
        return true;
      } catch (e) {
        console.warn('Failed to save to localStorage fallback:', e);
        return false;
      }
    }
  }

  async getProfile() {
    await this.initPromise;

    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get('current_profile');
        req.onsuccess = () => {
          if (req.result) {
            resolve(req.result);
          } else {
            // Check fallback
            resolve(this.getFallbackProfile());
          }
        };
        req.onerror = () => {
          resolve(this.getFallbackProfile());
        };
      });
    }

    return this.getFallbackProfile();
  }

  getFallbackProfile() {
    try {
      const stored = localStorage.getItem('gritin_volunteer_profile');
      if (stored) {
        return JSON.parse(stored);
      }
      const meta = localStorage.getItem('gritin_volunteer_meta');
      if (meta) {
        return JSON.parse(meta);
      }
    } catch (e) {
      console.warn('Error reading fallback profile:', e);
    }
    return null;
  }

  async clearProfile() {
    await this.initPromise;
    try {
      localStorage.removeItem('gritin_volunteer_meta');
      localStorage.removeItem('gritin_volunteer_profile');
    } catch (e) {}

    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete('current_profile');
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    }
    return true;
  }
}

window.profileStorage = new ProfileStorage();
