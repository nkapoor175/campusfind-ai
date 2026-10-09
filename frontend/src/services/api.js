/**
 * CampusFind AI — API Client Service
 * Connects directly to backend Express endpoints.
 * Includes explicit, safe demo fallback system with visible mode indicators.
 */

import {
  INITIAL_STUDENTS,
  INITIAL_ADMIN,
  INITIAL_LOST_ITEMS,
  INITIAL_FOUND_ITEMS,
  INITIAL_MATCH_RECORDS,
  INITIAL_CLAIMS,
  INITIAL_NOTIFICATIONS
} from './seedData';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export function isDemoFallbackEnabled() {
  return String(import.meta.env.VITE_DEMO_FALLBACK).toLowerCase() === 'true';
}

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isHttpError = true;
  }
}

export class NetworkError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'NetworkError';
    this.isNetworkError = true;
    this.originalError = originalError;
  }
}

const fallbackListeners = new Set();
let fallbackActive = false;

export function isDemoFallbackActive() {
  return fallbackActive;
}

export function subscribeToDemoFallback(callback) {
  fallbackListeners.add(callback);
  return () => fallbackListeners.delete(callback);
}

export function notifyFallbackUsed() {
  if (!fallbackActive) {
    fallbackActive = true;
    fallbackListeners.forEach((fn) => {
      try {
        fn(true);
      } catch (err) {
        console.error('Error notifying fallback listener:', err);
      }
    });
  }
}

export function resetDemoFallbackState() {
  fallbackActive = false;
  fallbackListeners.forEach((fn) => {
    try {
      fn(false);
    } catch (err) {
      console.error('Error notifying fallback listener:', err);
    }
  });
}

let localLostItems = [...INITIAL_LOST_ITEMS];
let localFoundItems = [...INITIAL_FOUND_ITEMS];
let localMatches = [...INITIAL_MATCH_RECORDS];
let localClaims = [...INITIAL_CLAIMS];
let localNotifications = [...INITIAL_NOTIFICATIONS];
let localStudents = [...INITIAL_STUDENTS];

function getAuthHeader() {
  const token = localStorage.getItem('campusfind_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new NetworkError(
      `Unable to reach campus server (${endpoint}). Please verify your connection.`,
      err
    );
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message =
      errorData.error ||
      errorData.message ||
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, errorData);
  }

  return await res.json();
}

async function withFallback(apiCall, fallbackFn) {
  try {
    return await apiCall();
  } catch (err) {
    if (!isDemoFallbackEnabled()) {
      throw err;
    }

    if (err.isHttpError && err.status >= 400 && err.status < 500) {
      throw err;
    }

    if (typeof fallbackFn === 'function') {
      console.warn(
        '[CampusFind API] Live server unreachable; serving fallback data because VITE_DEMO_FALLBACK=true.',
        err.message
      );
      notifyFallbackUsed();
      return fallbackFn(err);
    }

    throw err;
  }
}

export const api = {
  // ---------------- AUTH & STUDENT ----------------
  async login(email, password) {
    return withFallback(
      async () => {
        const data = await request('/api/students/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        if (data.token) {
          localStorage.setItem('campusfind_token', data.token);
          localStorage.setItem('campusfind_user', JSON.stringify(data.student));
        }
        return data;
      },
      () => {
        const student = localStudents.find((s) => s.Email.toLowerCase() === email.toLowerCase());
        if (student || email.includes('@')) {
          const demoStudent = student || {
            StudentID: 2,
            Name: 'Parthvi Sharma',
            Email: email,
            Phone: '9876543211',
            Department: 'Computer Science',
            Year: 3,
            Hostel: 'Hostel B',
          };
          const token = 'demo_jwt_token_' + Date.now();
          localStorage.setItem('campusfind_token', token);
          localStorage.setItem('campusfind_user', JSON.stringify(demoStudent));
          return { token, student: demoStudent, isDemo: true };
        }
        throw new Error('Invalid email or password');
      }
    );
  },

  async adminLogin(email, password) {
    return withFallback(
      async () => {
        const data = await request('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        if (data.token) {
          localStorage.setItem('campusfind_token', data.token);
          localStorage.setItem('campusfind_user', JSON.stringify(data.admin));
        }
        return data;
      },
      () => {
        if (email.toLowerCase() === 'admin@campus.edu' && password === 'Admin@12345') {
          const token = 'demo_admin_jwt_token_' + Date.now();
          localStorage.setItem('campusfind_token', token);
          localStorage.setItem('campusfind_user', JSON.stringify(INITIAL_ADMIN));
          return { token, admin: INITIAL_ADMIN, isDemo: true };
        }
        throw new Error('Invalid admin credentials');
      }
    );
  },

  async register(studentData) {
    return withFallback(
      async () => {
        const data = await request('/api/students/register', {
          method: 'POST',
          body: JSON.stringify(studentData),
        });
        return data;
      },
      () => {
        const newStudent = {
          StudentID: localStudents.length + 1,
          Name: studentData.name,
          Email: studentData.email,
          Phone: studentData.phone || '',
          Department: studentData.department || 'Computer Science',
          Year: studentData.year || 1,
          Hostel: studentData.hostel || 'Hostel A',
        };
        localStudents.push(newStudent);
        return newStudent;
      }
    );
  },

  async getMe() {
    return withFallback(
      () => request('/api/students/me'),
      () => {
        const cached = localStorage.getItem('campusfind_user');
        if (cached) return JSON.parse(cached);
        return localStudents[1];
      }
    );
  },

  // ---------------- LOST ITEMS ----------------
  async getLostItems() {
    return withFallback(
      async () => {
        const items = await request('/api/lost-items');
        return Array.isArray(items) ? items : [];
      },
      () => [...localLostItems]
    );
  },

  async getLostItemById(id) {
    return withFallback(
      () => request(`/api/lost-items/${id}`),
      () => localLostItems.find((item) => String(item.LostID) === String(id)) || localLostItems[0]
    );
  },

  async getLostItemsByStudent(studentId) {
    return withFallback(
      async () => {
        const items = await request(`/api/lost-items/student/${studentId}`);
        return Array.isArray(items) ? items : [];
      },
      () => localLostItems.filter((item) => String(item.StudentID) === String(studentId))
    );
  },

  async createLostItem(itemData) {
    return withFallback(
      async () => {
        const created = await request('/api/lost-items', {
          method: 'POST',
          body: JSON.stringify(itemData),
        });
        if (itemData.imagePreview) {
          created.imageUrl = itemData.imagePreview;
        }
        return created;
      },
      () => {
        const newId = localLostItems.length + 1;
        const newItem = {
          LostID: newId,
          ItemName: itemData.itemName,
          Category: itemData.category,
          Brand: itemData.brand,
          Color: itemData.color,
          Description: itemData.description,
          DateLost: itemData.dateLost || new Date().toISOString().split('T')[0],
          LostLocation: itemData.lostLocation,
          Status: 'Open',
          StudentID: itemData.studentId || 2,
          AdminID: null,
          imageUrl: itemData.imagePreview || null,
          studentName: 'Current Student',
        };
        localLostItems.unshift(newItem);
        return newItem;
      }
    );
  },

  // ---------------- FOUND ITEMS ----------------
  async getFoundItems() {
    return withFallback(
      async () => {
        const items = await request('/api/found-items');
        return Array.isArray(items) ? items : [];
      },
      () => [...localFoundItems]
    );
  },

  async getFoundItemById(id) {
    return withFallback(
      () => request(`/api/found-items/${id}`),
      () => localFoundItems.find((item) => String(item.FoundID) === String(id)) || localFoundItems[0]
    );
  },

  async getFoundItemsByStudent(studentId) {
    return withFallback(
      async () => {
        const items = await request(`/api/found-items/student/${studentId}`);
        return Array.isArray(items) ? items : [];
      },
      () => localFoundItems.filter((item) => String(item.StudentID) === String(studentId))
    );
  },

  async createFoundItem(itemData) {
    return withFallback(
      async () => {
        const created = await request('/api/found-items', {
          method: 'POST',
          body: JSON.stringify(itemData),
        });
        if (itemData.imagePreview) {
          created.imageUrl = itemData.imagePreview;
        }
        return created;
      },
      () => {
        const newId = localFoundItems.length + 1;
        const newItem = {
          FoundID: newId,
          ItemName: itemData.itemName,
          Category: itemData.category,
          Brand: itemData.brand,
          Color: itemData.color,
          Description: itemData.description,
          DateFound: itemData.dateFound || new Date().toISOString().split('T')[0],
          FoundLocation: itemData.foundLocation,
          Status: 'Open',
          StudentID: itemData.studentId || 2,
          AdminID: null,
          imageUrl: itemData.imagePreview || null,
          studentName: 'Current Student',
        };
        localFoundItems.unshift(newItem);
        return newItem;
      }
    );
  },

  // ---------------- AI MATCHES ----------------
  async getCandidates(lostId) {
    return withFallback(
      () => request(`/api/matches/candidates/${lostId}`),
      () => {
        const targetLost = localLostItems.find((i) => String(i.LostID) === String(lostId));
        if (!targetLost) return [];
        return localFoundItems
          .filter((f) => f.Status === 'Open')
          .map((foundItem) => {
            let score = 0.2;
            if (foundItem.Category === targetLost.Category) score += 0.35;
            if (foundItem.Color === targetLost.Color) score += 0.2;
            if (foundItem.ItemName.includes(targetLost.ItemName)) score += 0.25;
            return { foundItem, score: Math.min(0.96, Math.max(0.35, Number(score.toFixed(2)))) };
          })
          .sort((a, b) => b.score - a.score);
      }
    );
  },

  async getMatches() {
    return withFallback(
      () => request('/api/matches'),
      () => [...localMatches]
    );
  },

  async createMatch(lostId, foundId) {
    return withFallback(
      () => request('/api/matches', {
        method: 'POST',
        body: JSON.stringify({ lostId, foundId }),
      }),
      () => {
        const lost = localLostItems.find((l) => String(l.LostID) === String(lostId));
        const found = localFoundItems.find((f) => String(f.FoundID) === String(foundId));
        const newMatch = {
          MatchID: localMatches.length + 1,
          LostID: Number(lostId),
          FoundID: Number(foundId),
          MatchDate: new Date().toISOString(),
          MatchStatus: 'Pending',
          score: 0.92,
          lostItem: lost,
          foundItem: found,
        };
        localMatches.unshift(newMatch);
        return newMatch;
      }
    );
  },

  async updateMatchStatus(matchId, status) {
    return withFallback(
      () => request(`/api/matches/${matchId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
      () => {
        const match = localMatches.find((m) => String(m.MatchID) === String(matchId));
        if (match) match.MatchStatus = status;
        return match;
      }
    );
  },

  // ---------------- CLAIMS ----------------
  async createClaim(foundId) {
    return withFallback(
      () => request('/api/claims', {
        method: 'POST',
        body: JSON.stringify({ foundId }),
      }),
      () => {
        const found = localFoundItems.find((f) => String(f.FoundID) === String(foundId));
        const newClaim = {
          ClaimID: localClaims.length + 1,
          ClaimDate: new Date().toISOString(),
          ClaimStatus: 'Pending',
          VerificationNotes: 'Under review by security administration',
          StudentID: 2, 
          FoundID: Number(foundId),
          studentName: 'Parthvi Sharma',
          foundItem: found,
        };
        localClaims.unshift(newClaim);
        return { message: 'Claim submitted successfully', claim: newClaim };
      }
    );
  },

  async getClaimsByStudent(studentId) {
    return withFallback(
      () => request(`/api/claims/student/${studentId}`),
      () => localClaims.filter((c) => String(c.StudentID) === String(studentId))
    );
  },

  async getClaimsByFoundItem(foundId) {
    return withFallback(
      () => request(`/api/claims/found/${foundId}`),
      () => localClaims.filter((c) => String(c.FoundID) === String(foundId))
    );
  },

  async getAllClaims() {
    return withFallback(
      async () => {
        const claims = await request('/api/claims');
        return Array.isArray(claims) ? claims : [];
      },
      () => [...localClaims]
    );
  },

  async updateClaimStatus(claimId, claimStatus, verificationNotes) {
    return withFallback(
      () => request(`/api/claims/${claimId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ claimStatus, verificationNotes }),
      }),
      () => {
        const claim = localClaims.find((c) => String(c.ClaimID) === String(claimId));
        if (claim) {
          claim.ClaimStatus = claimStatus;
          claim.VerificationNotes = verificationNotes || claim.VerificationNotes;
          claim.AdminID = 1;
        }
        return { message: `Claim status updated to ${claimStatus}`, claim };
      }
    );
  },

  // ---------------- ADMIN VERIFICATIONS ----------------
  async getPendingReports() {
    return withFallback(
      async () => {
        const data = await request('/api/admin/pending');
        const pendingLost = Array.isArray(data?.lostItems) ? data.lostItems : (data?.pendingLost || []);
        const pendingFound = Array.isArray(data?.foundItems) ? data.foundItems : (data?.pendingFound || []);
        return {
          pendingLost,
          pendingFound,
          totalPending: pendingLost.length + pendingFound.length,
        };
      },
      () => {
        const pendingLost = localLostItems.filter((i) => !i.AdminID);
        const pendingFound = localFoundItems.filter((i) => !i.AdminID);
        return {
          pendingLost: pendingLost || [],
          pendingFound: pendingFound || [],
          totalPending: pendingLost.length + pendingFound.length,
        };
      }
    );
  },

  async verifyLostItem(id) {
    return withFallback(
      () => request(`/api/admin/lost/${id}/verify`, {
        method: 'PUT',
      }),
      () => {
        const item = localLostItems.find((i) => String(i.LostID) === String(id));
        if (item) item.AdminID = 1;
        return { message: 'Lost item verified successfully', item };
      }
    );
  },

  async verifyFoundItem(id) {
    return withFallback(
      () => request(`/api/admin/found/${id}/verify`, {
        method: 'PUT',
      }),
      () => {
        const item = localFoundItems.find((i) => String(i.FoundID) === String(id));
        if (item) item.AdminID = 1;
        return { message: 'Found item verified successfully', item };
      }
    );
  },

  // ---------------- NOTIFICATIONS ----------------
  async getNotifications(studentId) {
    return withFallback(
      async () => {
        const notifs = await request(`/api/notifications/student/${studentId}`);
        return Array.isArray(notifs) ? notifs : [];
      },
      () => localNotifications.filter((n) => String(n.StudentID) === String(studentId))
    );
  },

  async markNotificationRead(id) {
    return withFallback(
      () => request(`/api/notifications/${id}/read`, {
        method: 'PUT',
      }),
      () => {
        const notif = localNotifications.find((n) => String(n.NotificationID) === String(id));
        if (notif) notif.ReadStatus = true;
        return { message: 'Notification marked as read', notification: notif };
      }
    );
  },

  // ---------------- IMAGE UPLOADS ----------------
  async uploadLostImage(lostId, file) {
    return withFallback(
      async () => {
        const formData = new FormData();
        formData.append('images', file);
        const res = await fetch(`${BASE_URL}/api/uploads/lost/${lostId}`, {
          method: 'POST',
          headers: getAuthHeader(),
          body: formData,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new ApiError(errData.error || errData.message || 'Image upload failed', res.status);
        }
        return await res.json();
      },
      () => {
        const localUrl = URL.createObjectURL(file);
        return { message: 'Image uploaded locally', fileUrl: localUrl };
      }
    );
  },

  async uploadFoundImage(foundId, file) {
    return withFallback(
      async () => {
        const formData = new FormData();
        formData.append('images', file);
        const res = await fetch(`${BASE_URL}/api/uploads/found/${foundId}`, {
          method: 'POST',
          headers: getAuthHeader(),
          body: formData,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new ApiError(errData.error || errData.message || 'Image upload failed', res.status);
        }
        return await res.json();
      },
      () => {
        const localUrl = URL.createObjectURL(file);
        return { message: 'Image uploaded locally', fileUrl: localUrl };
      }
    );
  },

  async getLostItemImages(lostId) {
    return withFallback(
      () => request(`/api/uploads/lost/${lostId}`),
      () => {
        const item = localLostItems.find((i) => String(i.LostID) === String(lostId));
        return item?.imageUrl ? [{ ImageURL: item.imageUrl }] : [];
      }
    );
  },

  async getFoundItemImages(foundId) {
    return withFallback(
      () => request(`/api/uploads/found/${foundId}`),
      () => {
        const item = localFoundItems.find((i) => String(i.FoundID) === String(foundId));
        return item?.imageUrl ? [{ ImageURL: item.imageUrl }] : [];
      }
    );
  },

  // ---------------- ML IMAGE SIMILARITY SERVICE ----------------
  async checkMlHealth() {
    try {
      const res = await fetch('/ml/health');
      if (res.ok) {
        return await res.json();
      }
      return { status: 'offline' };
    } catch {
      return { status: 'offline' };
    }
  },

  async compareImages(img1, img2) {
    try {
      if (!img1 || !img2) return { available: false, reason: 'Both items must have photos' };
      const isHttp1 = typeof img1 === 'string' && (img1.startsWith('http://') || img1.startsWith('https://'));
      const isHttp2 = typeof img2 === 'string' && (img2.startsWith('http://') || img2.startsWith('https://'));

      if (isHttp1 && isHttp2) {
        const res = await fetch('/ml/compare-image-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image1_url: img1, image2_url: img2 }),
        });
        if (res.ok) {
          const data = await res.json();
          return { available: true, similarityScore: data.similarityScore, confidence: data.confidence };
        }
      }

      const toBlob = async (src) => {
        if (src instanceof Blob || src instanceof File) return src;
        if (typeof src === 'string' && (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('/'))) {
          const fetched = await fetch(src);
          return await fetched.blob();
        }
        return null;
      };

      const [blob1, blob2] = await Promise.all([toBlob(img1), toBlob(img2)]);
      if (blob1 && blob2) {
        const formData = new FormData();
        formData.append('image1', blob1, 'lost_item.jpg');
        formData.append('image2', blob2, 'found_item.jpg');

        const res = await fetch('/ml/compare-images', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          return { available: true, similarityScore: data.similarityScore, confidence: data.confidence };
        }
      }
      return { available: false, reason: 'Image similarity service offline' };
    } catch (err) {
      return { available: false, reason: err.message };
    }
  },

  async checkHealth() {
    return withFallback(
      () => request('/health'),
      () => ({ status: 'offline', db: 'local_mode' })
    );
  }
};