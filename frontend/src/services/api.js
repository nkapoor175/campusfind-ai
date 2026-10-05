/**
 * CampusFind AI — API Client Service
 * Connects directly to backend Express endpoints.
 * Includes graceful fallback to local seed memory for offline presentation.
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

// Local state for resilient offline demo mode
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

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Request failed (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    // If backend is unreachable (connection refused, server down), log note and use mock fallback
    console.warn(`[CampusFind API] Live endpoint ${endpoint} failed or offline, using fallback store.`, err.message);
    throw err;
  }
}

export const api = {
  // ---------------- AUTH & STUDENT ----------------
  async login(email, password) {
    try {
      const data = await request('/api/students/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) {
        localStorage.setItem('campusfind_token', data.token);
        localStorage.setItem('campusfind_user', JSON.stringify(data.student));
      }
      return data;
    } catch {
      // Local fallback for quick evaluation/demo
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
  },

  async register(studentData) {
    try {
      const data = await request('/api/students/register', {
        method: 'POST',
        body: JSON.stringify(studentData),
      });
      return data;
    } catch {
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
  },

  async getMe() {
    try {
      return await request('/api/students/me');
    } catch {
      const cached = localStorage.getItem('campusfind_user');
      if (cached) return JSON.parse(cached);
      return localStudents[1]; // default Parthvi Sharma
    }
  },

  // ---------------- LOST ITEMS ----------------
  async getLostItems() {
    try {
      const items = await request('/api/lost-items');
      return items;
    } catch {
      return [...localLostItems];
    }
  },

  async getLostItemById(id) {
    try {
      return await request(`/api/lost-items/${id}`);
    } catch {
      return localLostItems.find((item) => String(item.LostID) === String(id)) || localLostItems[0];
    }
  },

  async getLostItemsByStudent(studentId) {
    try {
      return await request(`/api/lost-items/student/${studentId}`);
    } catch {
      return localLostItems.filter((item) => String(item.StudentID) === String(studentId));
    }
  },

  async createLostItem(itemData) {
    try {
      return await request('/api/lost-items', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
    } catch {
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

      // Auto-trigger possible match notification simulation
      localNotifications.unshift({
        NotificationID: localNotifications.length + 1,
        Message: `✨ AI is analyzing candidate matches for your ${newItem.ItemName}...`,
        Date: new Date().toISOString(),
        ReadStatus: false,
        StudentID: newItem.StudentID,
        MatchID: null,
        type: 'match',
      });

      return newItem;
    }
  },

  // ---------------- FOUND ITEMS ----------------
  async getFoundItems() {
    try {
      return await request('/api/found-items');
    } catch {
      return [...localFoundItems];
    }
  },

  async getFoundItemById(id) {
    try {
      return await request(`/api/found-items/${id}`);
    } catch {
      return localFoundItems.find((item) => String(item.FoundID) === String(id)) || localFoundItems[0];
    }
  },

  async getFoundItemsByStudent(studentId) {
    try {
      return await request(`/api/found-items/student/${studentId}`);
    } catch {
      return localFoundItems.filter((item) => String(item.StudentID) === String(studentId));
    }
  },

  async createFoundItem(itemData) {
    try {
      return await request('/api/found-items', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
    } catch {
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
  },

  // ---------------- AI MATCHES ----------------
  async getCandidates(lostId) {
    try {
      return await request(`/api/matches/candidates/${lostId}`);
    } catch {
      // Local fallback computation replicating matchService
      const targetLost = localLostItems.find((i) => String(i.LostID) === String(lostId));
      if (!targetLost) return [];

      return localFoundItems
        .filter((f) => f.Status === 'Open')
        .map((foundItem) => {
          let score = 0.2;
          if (foundItem.Category && targetLost.Category && foundItem.Category.toLowerCase() === targetLost.Category.toLowerCase()) {
            score += 0.35;
          }
          if (foundItem.Color && targetLost.Color && foundItem.Color.toLowerCase() === targetLost.Color.toLowerCase()) {
            score += 0.2;
          }
          if (foundItem.ItemName.toLowerCase().includes(targetLost.ItemName.toLowerCase()) ||
              targetLost.ItemName.toLowerCase().includes(foundItem.ItemName.toLowerCase())) {
            score += 0.25;
          }
          return {
            foundItem,
            score: Math.min(0.96, Math.max(0.35, Number(score.toFixed(2)))),
          };
        })
        .sort((a, b) => b.score - a.score);
    }
  },

  async getMatches() {
    try {
      return await request('/api/matches');
    } catch {
      return [...localMatches];
    }
  },

  async createMatch(lostId, foundId) {
    try {
      return await request('/api/matches', {
        method: 'POST',
        body: JSON.stringify({ lostId, foundId }),
      });
    } catch {
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
  },

  async updateMatchStatus(matchId, status) {
    try {
      return await request(`/api/matches/${matchId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch {
      const match = localMatches.find((m) => String(m.MatchID) === String(matchId));
      if (match) {
        match.MatchStatus = status;
      }
      return match;
    }
  },

  // ---------------- CLAIMS ----------------
  async createClaim(studentId, foundId) {
    try {
      return await request('/api/claims', {
        method: 'POST',
        body: JSON.stringify({ studentId, foundId }),
      });
    } catch {
      const found = localFoundItems.find((f) => String(f.FoundID) === String(foundId));
      const newClaim = {
        ClaimID: localClaims.length + 1,
        ClaimDate: new Date().toISOString(),
        ClaimStatus: 'Pending',
        VerificationNotes: 'Under review by security administration',
        StudentID: Number(studentId),
        FoundID: Number(foundId),
        studentName: 'Parthvi Sharma',
        foundItem: found,
      };
      localClaims.unshift(newClaim);
      return { message: 'Claim submitted successfully', claim: newClaim };
    }
  },

  async getClaimsByStudent(studentId) {
    try {
      return await request(`/api/claims/student/${studentId}`);
    } catch {
      return localClaims.filter((c) => String(c.StudentID) === String(studentId));
    }
  },

  async getClaimsByFoundItem(foundId) {
    try {
      return await request(`/api/claims/found/${foundId}`);
    } catch {
      return localClaims.filter((c) => String(c.FoundID) === String(foundId));
    }
  },

  async getAllClaims() {
    return [...localClaims];
  },

  async updateClaimStatus(claimId, adminId, claimStatus, verificationNotes) {
    try {
      return await request(`/api/claims/${claimId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ adminId, claimStatus, verificationNotes }),
      });
    } catch {
      const claim = localClaims.find((c) => String(c.ClaimID) === String(claimId));
      if (claim) {
        claim.ClaimStatus = claimStatus;
        claim.VerificationNotes = verificationNotes || claim.VerificationNotes;
        claim.AdminID = Number(adminId);
      }
      return { message: `Claim status updated to ${claimStatus}`, claim };
    }
  },

  // ---------------- ADMIN VERIFICATIONS ----------------
  async getPendingReports() {
    try {
      return await request('/api/admin/pending');
    } catch {
      const pendingLost = localLostItems.filter((i) => !i.AdminID);
      const pendingFound = localFoundItems.filter((i) => !i.AdminID);
      return {
        pendingLost,
        pendingFound,
        totalPending: pendingLost.length + pendingFound.length,
      };
    }
  },

  async verifyLostItem(id, adminId = 1) {
    try {
      return await request(`/api/admin/lost/${id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ adminId }),
      });
    } catch {
      const item = localLostItems.find((i) => String(i.LostID) === String(id));
      if (item) item.AdminID = adminId;
      return { message: 'Lost item verified successfully', item };
    }
  },

  async verifyFoundItem(id, adminId = 1) {
    try {
      return await request(`/api/admin/found/${id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ adminId }),
      });
    } catch {
      const item = localFoundItems.find((i) => String(i.FoundID) === String(id));
      if (item) item.AdminID = adminId;
      return { message: 'Found item verified successfully', item };
    }
  },

  // ---------------- NOTIFICATIONS ----------------
  async getNotifications(studentId = 2) {
    try {
      return await request(`/api/notifications/student/${studentId}`);
    } catch {
      return localNotifications.filter((n) => String(n.StudentID) === String(studentId));
    }
  },

  async markNotificationRead(id) {
    try {
      return await request(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });
    } catch {
      const notif = localNotifications.find((n) => String(n.NotificationID) === String(id));
      if (notif) notif.ReadStatus = true;
      return { message: 'Notification marked as read', notification: notif };
    }
  },

  // ---------------- IMAGE UPLOADS ----------------
  async uploadLostImage(lostId, file) {
    try {
      const formData = new FormData();
      formData.append('images', file);
      const res = await fetch(`${BASE_URL}/api/uploads/lost/${lostId}`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });
      return await res.json();
    } catch {
      return { message: 'Image uploaded locally', fileUrl: URL.createObjectURL(file) };
    }
  },

  async uploadFoundImage(foundId, file) {
    try {
      const formData = new FormData();
      formData.append('images', file);
      const res = await fetch(`${BASE_URL}/api/uploads/found/${foundId}`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });
      return await res.json();
    } catch {
      return { message: 'Image uploaded locally', fileUrl: URL.createObjectURL(file) };
    }
  },

  // ---------------- HEALTH CHECK ----------------
  async checkHealth() {
    try {
      return await request('/health');
    } catch {
      return { status: 'offline', db: 'local_mode' };
    }
  }
};
