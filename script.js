const menuData = [
  { id: 'truffle-pizza', title: 'White Truffle Pizza', price: 899 },
  { id: 'wagyu-burger', title: 'Wagyu Burger', price: 1099 },
  { id: 'lobster-pasta', title: 'Lobster Tagliatelle', price: 1299 },
  { id: 'molten-cake', title: 'Chocolate Molten Cake', price: 599 },
  { id: 'butter-chicken', title: 'Butter Chicken', price: 699 },
  { id: 'dal-makhani', title: 'Dal Makhani', price: 349 },
  { id: 'paneer-tikka-masala', title: 'Paneer Tikka Masala', price: 499 },
  { id: 'hyderabadi-biryani', title: 'Hyderabadi Biryani', price: 849 },
  { id: 'masala-dosa', title: 'Masala Dosa', price: 299 },
  { id: 'kerala-prawn-curry', title: 'Kerala Prawn Curry', price: 799 },
  { id: 'litti-chokha', title: 'Litti Chokha', price: 379 },
  { id: 'chole-bhature', title: 'Chole Bhature', price: 329 },
  { id: 'rajma-chawal', title: 'Rajma Chawal', price: 279 },
  { id: 'tandoori-chicken', title: 'Tandoori Chicken', price: 649 },
  { id: 'fish-amritsari', title: 'Fish Amritsari', price: 549 },
  { id: 'prawn-ghee-roast', title: 'Prawn Ghee Roast', price: 799 },
  { id: 'kadai-paneer', title: 'Kadai Paneer', price: 459 },
  { id: 'pav-bhaji', title: 'Pav Bhaji', price: 329 },
  { id: 'kathi-roll', title: 'Kolkata Kathi Roll', price: 279 },
  { id: 'goan-fish-curry', title: 'Goan Fish Curry', price: 799 },
  { id: 'malabar-parotta', title: 'Malabar Parotta', price: 249 },
  { id: 'samosa-chaat', title: 'Samosa Chaat', price: 219 },
  { id: 'galouti-kebab', title: 'Galouti Kebab', price: 499 },
  { id: 'thai-green-curry', title: 'Thai Green Curry', price: 649 },
  { id: 'ramen-bowl', title: 'Japanese Ramen Bowl', price: 799 },
  { id: 'mexican-tacos', title: 'Mexican Tacos Trio', price: 499 },
  { id: 'falafel-wrap', title: 'Mediterranean Falafel Wrap', price: 399 },
  { id: 'sushi-deluxe', title: 'Sushi Deluxe', price: 1199 },
  { id: 'tiramisu-cheesecake', title: 'Tiramisu Cheesecake', price: 649 }
];

const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const orderReceiptEl = document.getElementById('orderReceipt');
const reservationForm = document.getElementById('reservationForm');
const refreshAdmin = document.getElementById('refreshAdmin');
const adminContent = document.getElementById('adminContent');
const themeToggle = document.getElementById('themeToggle');
const testimonials = Array.from(document.querySelectorAll('.testimonial'));

let cart = JSON.parse(localStorage.getItem('royalCart') || '[]');
let testimonialIndex = 0;

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

// TODO: Replace this payment key with your own from your provider dashboard.
const RAZORPAY_KEY = 'rzp_test_XXXXXXXXXXXXXXXX';
const ORDERS_STORAGE_KEY = 'royalOrders';
const RESERVATIONS_STORAGE_KEY = 'royalReservations';

let db = null;
let firebaseEnabled = false;

async function initFirebase() {
  try {
    const [{ initializeApp }, { getFirestore, collection, addDoc, getDocs, query, orderBy }] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js')
    ]);

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseEnabled = true;
    console.log('Firebase initialized');
  } catch (error) {
    console.warn('Firebase not initialized:', error);
  }
}

function saveCart() {
  localStorage.setItem('royalCart', JSON.stringify(cart));
}

function saveOrderLocally(order) {
  const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
  orders.unshift(order);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders.slice(0, 20)));
}

function getLocalOrders() {
  return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
}

function saveReservationLocally(reservation) {
  const reservations = JSON.parse(localStorage.getItem(RESERVATIONS_STORAGE_KEY) || '[]');
  reservations.unshift(reservation);
  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations.slice(0, 20)));
}

function getLocalReservations() {
  return JSON.parse(localStorage.getItem(RESERVATIONS_STORAGE_KEY) || '[]');
}

function renderOrderReceipt(order, paymentId = null) {
  if (!orderReceiptEl) return;

  const itemRows = order.items.map(item => `
      <tr>
        <td>${item.title}</td>
        <td>${item.quantity}</td>
        <td>₹${item.price}</td>
        <td>₹${item.quantity * item.price}</td>
      </tr>
    `).join('');

  orderReceiptEl.innerHTML = `
    <div class="receipt-header">
      <div>
        <h4>Order Invoice</h4>
        <p><strong>${order.name}</strong></p>
        <p>${order.email} • ${order.phone}</p>
      </div>
      <div class="receipt-meta">
        <p>${new Date(order.createdAt).toLocaleString()}</p>
        ${paymentId ? `<p>Payment ID: ${paymentId}</p>` : '<p>Pending payment</p>'}
      </div>
    </div>
    <table class="receipt-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">Total</td>
          <td>₹${order.total}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

function updateCartUI() {
  cartItemsEl.innerHTML = '';

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty">Add a dish from the menu to begin.</p>';
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Scan and Pay';
    cartTotalEl.textContent = '₹0';
    orderReceiptEl.innerHTML = '';
    return;
  }

  cart.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div>
        <strong>${item.title}</strong>
        <p>${item.quantity} × ₹${item.price}</p>
      </div>
      <div class="cart-item-actions">
        <span>₹${item.quantity * item.price}</span>
        <button type="button" class="btn-text remove-item">Remove</button>
      </div>
    `;

    itemEl.querySelector('.remove-item').addEventListener('click', () => {
      removeFromCart(item.id);
    });

    cartItemsEl.appendChild(itemEl);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalEl.textContent = `₹${total}`;
  checkoutBtn.disabled = false;
  checkoutBtn.textContent = `Scan and Pay ₹${total}`;
}

function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  saveCart();
  updateCartUI();
}

function addToCart(itemId) {
  const item = menuData.find(menu => menu.id === itemId);
  if (!item) return;

  const existing = cart.find(entry => entry.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  saveCart();
  updateCartUI();
}

function commitOrder(order) {
  saveOrderLocally(order);

  if (!firebaseEnabled) {
    return;
  }

  import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js')
    .then(({ collection, addDoc }) => addDoc(collection(db, 'orders'), order))
    .catch(error => console.warn('Firebase order save failed:', error));
}

function launchRazorpay(order) {
  const options = {
    key: RAZORPAY_KEY,
    amount: Math.round(order.total * 100),
    currency: 'INR',
    name: 'Royal Restaurant',
    description: 'Premium dining order',
    prefill: {
      name: order.name,
      email: order.email,
      contact: order.phone
    },
    handler(response) {
      order.paymentId = response.razorpay_payment_id;
      commitOrder(order);
      renderOrderReceipt(order, response.razorpay_payment_id);
      alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
      cart = [];
      saveCart();
      updateCartUI();
    },
    theme: { color: '#ff9f1c' }
  };

  renderOrderReceipt(order);
  const rzp = new Razorpay(options);
  rzp.open();
}

async function handleCheckout() {
  if (cart.length === 0) return;

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (!name || !email || !phone) {
    alert('Please enter your name, email, and phone number for the bill before paying.');
    document.getElementById('name').focus();
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = { name, email, phone, total, items: cart, createdAt: new Date().toISOString() };

  launchRazorpay(order);
}

async function bookTable(event) {
  event.preventDefault();
  const reservation = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    guests: document.getElementById('guests').value,
    occasion: document.getElementById('occasion').value,
    createdAt: new Date().toISOString()
  };

  saveReservationLocally(reservation);

  if (firebaseEnabled) {
    try {
      const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
      await addDoc(collection(db, 'reservations'), reservation);
      alert('Reservation received — check admin for live updates.');
      reservationForm.reset();
    } catch (error) {
      alert('Unable to save reservation to Firebase. Saved locally instead.');
      console.warn(error);
      reservationForm.reset();
    }
  } else {
    alert('Reservation saved locally. Connect Firebase config in script.js for live sync.');
    reservationForm.reset();
  }
}

async function loadAdminData() {
  if (!firebaseEnabled) {
    const reservations = getLocalReservations().slice(0, 3);
    const orders = getLocalOrders().slice(0, 3);

    adminContent.innerHTML = `
      <h4>Recent reservations</h4>
      ${reservations.length ? reservations.map(res => `<p><strong>${res.name}</strong> • ${res.guests} guests • ${res.date} ${res.time}</p>`).join('') : '<p>No reservations yet.</p>'}
      <h4>Recent orders</h4>
      ${orders.length ? orders.map(order => `<p><strong>${order.name}</strong> • ₹${order.total} • ${order.items.length} items</p>`).join('') : '<p>No orders yet.</p>'}
    `;
    return;
  }

  try {
    const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
    const reservationsSnap = await getDocs(query(collection(db, 'reservations'), orderBy('createdAt', 'desc')));
    const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));

    const reservations = reservationsSnap.docs.slice(0, 3).map(doc => doc.data());
    const orders = ordersSnap.docs.slice(0, 3).map(doc => doc.data());

    adminContent.innerHTML = `
      <h4>Recent reservations</h4>
      ${reservations.length ? reservations.map(res => `<p><strong>${res.name}</strong> • ${res.guests} guests • ${res.date} ${res.time}</p>`).join('') : '<p>No reservations yet.</p>'}
      <h4>Recent orders</h4>
      ${orders.length ? orders.map(order => `<p><strong>${order.name}</strong> • ₹${order.total} • ${order.items.length} items</p>`).join('') : '<p>No orders yet.</p>'}
    `;
  } catch (error) {
    const localReservations = getLocalReservations().slice(0, 3);
    const localOrders = getLocalOrders().slice(0, 3);
    adminContent.innerHTML = `
      <h4>Recent reservations</h4>
      ${localReservations.length ? localReservations.map(res => `<p><strong>${res.name}</strong> • ${res.guests} guests • ${res.date} ${res.time}</p>`).join('') : '<p>No reservations yet.</p>'}
      <h4>Recent orders</h4>
      ${localOrders.length ? localOrders.map(order => `<p><strong>${order.name}</strong> • ₹${order.total} • ${order.items.length} items</p>`).join('') : '<p>No orders yet.</p>'}
      <p>Loaded local data because Firebase failed.</p>
    `;
    console.warn(error);
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

function rotateTestimonials() {
  testimonials[testimonialIndex].classList.remove('active');
  testimonialIndex = (testimonialIndex + 1) % testimonials.length;
  testimonials[testimonialIndex].classList.add('active');
}

function initButtons() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    const itemId = btn.closest('.menu-card')?.dataset.id;
    if (!itemId) return;
    btn.addEventListener('click', () => addToCart(itemId));
  });

  checkoutBtn.addEventListener('click', handleCheckout);
  reservationForm.addEventListener('submit', bookTable);
  refreshAdmin.addEventListener('click', loadAdminData);
  themeToggle.addEventListener('click', toggleTheme);
}

async function init() {
  restoreTheme();
  updateCartUI();
  initButtons();
  initFirebase();
  loadAdminData();
  testimonials[testimonialIndex].classList.add('active');
  setInterval(rotateTestimonials, 7000);
}

init();
