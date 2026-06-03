# Royal Restaurant Website

A refined restaurant landing page with an online ordering cart, reservation system, and a protected admin dashboard.

## Project overview

This project includes:

- `index.html` — public site with menu browsing, cart management, and reservation booking.
- `style.css` — polished page styling for the customer site and admin dashboard.
- `script.js` — client-side logic for cart actions, checkout, order receipts, and reservation handling.
- `admin.html` — admin dashboard with login protection.
- `admin.js` — admin controls, password management, and Firebase sync placeholders.

## New features

- Add to cart with live cart summary
- Remove items directly from the cart
- Styled order invoice with itemized billing
- Reservation form requires billing contact details
- Admin login gated behind credentials
- Local order and reservation storage when Firebase is not configured

## Admin login

Use the admin dashboard at `admin.html`.

- Default username: `admin`
- Default password: `admin123`

Once logged in, you can change the admin password from the dashboard.

### Security notes

- Admin credentials are stored locally in browser `localStorage` for convenience.
- This is a lightweight local guard, not a secure production authentication system.
- To reset access, clear the browser storage for this site or open the page in a new browser/profile.

## Setup and usage

1. Open `index.html` in your browser.
2. Add dishes to the cart and remove items as needed.
3. Enter name, email, and phone to generate the bill.
4. Click `Scan and Pay` to proceed with payment.
5. Open `admin.html` and login with the default admin account.
6. Change the password after the first login.

## Firebase configuration

Live sync is optional. To enable Firebase:

1. Create a Firebase project at https://console.firebase.google.com/
2. Add a Web app and enable Firestore.
3. Copy the Web app config values.
4. Replace the placeholders in `script.js` and `admin.js`.

## Notes

- The order invoice now uses a cleaner table layout with itemized totals.
- Cart items include a `Remove` action for better usability.
- For production-grade security, use a backend authentication system instead of local storage.
