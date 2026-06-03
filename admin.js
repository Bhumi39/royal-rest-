const reservationList = document.getElementById('reservationList');
const orderList = document.getElementById('orderList');
const refreshAdmin = document.getElementById('refreshAdmin');
const logoutBtn = document.getElementById('logoutBtn');
const themeToggle = document.getElementById('themeToggle');
const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginForm = document.getElementById('loginForm');
const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');
const setPasswordForm = document.getElementById('setPasswordForm');
const currentAdminPassword = document.getElementById('currentAdminPassword');
const newAdminPassword = document.getElementById('newAdminPassword');
const confirmAdminPassword = document.getElementById('confirmAdminPassword');
const loginMessage = document.getElementById('loginMessage');
const passwordMessage = document.getElementById('passwordMessage');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_KEY = 'royalAdminPassword';
const ADMIN_AUTH_KEY = 'royalAdminAuth';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

// TODO: Replace these values with your real Firebase config from Firebase Console.
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Add a Web app and copy the config values.
// 3. Paste them below and enable Firestore in the Firebase console.
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_FIREBASE_PROJECT.firebaseapp.com',
  projectId: 'YOUR_FIREBASE_PROJECT',
  storageBucket: 'YOUR_FIREBASE_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_FIREBASE_SENDER_ID',
  appId: 'YOUR_FIREBASE_APP_ID'
};

let db = null;
let firebaseEnabled = false;

function getStoredAdminPassword() {
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
}

function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

function setAdminLoggedIn(value) {
  localStorage.setItem(ADMIN_AUTH_KEY, value ? 'true' : 'false');
}

function setStoredAdminPassword(password) {
  localStorage.setItem(ADMIN_PASSWORD_KEY, password);
}

function renderAdminView() {
  const loggedIn = isAdminLoggedIn();
  loginSection.style.display = loggedIn ? 'none' : 'block';
  adminSection.style.display = loggedIn ? 'block' : 'none';
  refreshAdmin.style.display = loggedIn ? 'inline-block' : 'none';
  logoutBtn.style.display = loggedIn ? 'inline-block' : 'none';

  if (!loggedIn) {
    reservationList.innerHTML = '<p>Login to view reservations.</p>';
    orderList.innerHTML = '<p>Login to view orders.</p>';
  }
}

function showMessage(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.style.color = isError ? '#ff6b6b' : 'var(--muted)';
}

function signOut() {
  setAdminLoggedIn(false);
  renderAdminView();
}

function handleLogin(event) {
  event.preventDefault();
  const username = adminUsername.value.trim();
  const password = adminPassword.value.trim();

  if (username !== ADMIN_USERNAME || password !== getStoredAdminPassword()) {
    showMessage(loginMessage, 'Invalid admin username or password.', true);
    return;
  }

  setAdminLoggedIn(true);
  showMessage(loginMessage, 'Login successful. Loading dashboard...');
  renderAdminView();
  initFirebase().then(loadAdminData);
  loginForm.reset();
}

function handlePasswordChange(event) {
  event.preventDefault();
  const current = currentAdminPassword.value.trim();
  const next = newAdminPassword.value.trim();
  const confirm = confirmAdminPassword.value.trim();

  if (current !== getStoredAdminPassword()) {
    showMessage(passwordMessage, 'Current password is incorrect.', true);
    return;
  }

  if (next.length < 6) {
    showMessage(passwordMessage, 'New password must be at least 6 characters.', true);
    return;
  }

  if (next !== confirm) {
    showMessage(passwordMessage, 'New passwords do not match.', true);
    return;
  }

  setStoredAdminPassword(next);
  showMessage(passwordMessage, 'Admin password updated successfully. Use the new password next time.');
  setPasswordForm.reset();
}

async function initFirebase() {
  try {
    const [{ initializeApp }, { getFirestore }] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js')
    ]);

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseEnabled = true;
  } catch (error) {
    reservationList.innerHTML = '<p>Firebase initialization failed. Check your config in admin.js.</p>';
    orderList.innerHTML = '<p>Firebase initialization failed. Check your config in admin.js.</p>';
    console.warn('Firebase not initialized:', error);
  }
}

async function loadAdminData() {
  if (!firebaseEnabled) {
    reservationList.innerHTML = '<p>Firebase is not connected. Update the config in <code>admin.js</code>.</p>';
    orderList.innerHTML = '<p>Firebase is not connected. Update the config in <code>admin.js</code>.</p>';
    return;
  }

  try {
    const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
    const reservationsSnap = await getDocs(query(collection(db, 'reservations'), orderBy('createdAt', 'desc')));
    const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));

    const reservations = reservationsSnap.docs.slice(0, 5).map(doc => doc.data());
    const orders = ordersSnap.docs.slice(0, 5).map(doc => doc.data());

    reservationList.innerHTML = reservations.length
      ? reservations.map(res => `<p><strong>${res.name}</strong> • ${res.guests} guests • ${res.date} ${res.time}</p>`).join('')
      : '<p>No reservations yet.</p>';

    orderList.innerHTML = orders.length
      ? orders.map(order => `<p><strong>${order.name}</strong> • ₹${order.total} • ${order.items.length} items</p>`).join('')
      : '<p>No orders yet.</p>';
  } catch (error) {
    reservationList.innerHTML = '<p>Unable to load admin data. Check the Firebase project permissions.</p>';
    orderList.innerHTML = '<p>Unable to load admin data. Check the Firebase project permissions.</p>';
    console.warn('Admin data load failed:', error);
  }
}

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  themeToggle.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('royalTheme', isLight ? 'light' : 'dark');
}

function restoreTheme() {
  const saved = localStorage.getItem('royalTheme');
  if (saved === 'light') {
    document.documentElement.classList.add('light');
    themeToggle.textContent = '☀️';
  }
}

async function init() {
  restoreTheme();
  themeToggle.addEventListener('click', toggleTheme);
  refreshAdmin.addEventListener('click', loadAdminData);
  logoutBtn.addEventListener('click', signOut);
  loginForm.addEventListener('submit', handleLogin);
  setPasswordForm.addEventListener('submit', handlePasswordChange);
  renderAdminView();

  if (isAdminLoggedIn()) {
    await initFirebase();
    loadAdminData();
  }
}

init();
