# Admin Login Credentials

## Default Login Credentials

**Username:** `admin`  
**Password:** `mickey2024`

## Security Features

### Session Management
- Sessions expire after **8 hours** of inactivity
- Session data stored in browser's sessionStorage
- Automatic logout on session expiration

### Access Control
- Admin dashboard (`admin.html`) is protected and requires authentication
- Unauthenticated users are automatically redirected to login page
- Direct access to admin.html without login is blocked

### Login Page
- URL: `admin-login.html`
- Professional, responsive design
- Error handling for invalid credentials
- Link back to main website

## Changing the Password

To change the admin password, edit the `admin-login.html` file:

1. Open `admin-login.html`
2. Find the `ADMIN_CREDENTIALS` object (around line 212):
   ```javascript
   const ADMIN_CREDENTIALS = {
       username: 'admin',
       password: 'mickey2024' // Change this to a secure password
   };
   ```
3. Change the password to your desired value
4. Save the file

## Security Recommendations

### For Production Use:
1. **Use Backend Authentication**: The current system uses client-side authentication which is suitable for basic protection but not for production environments with sensitive data.

2. **Implement Server-Side Authentication**: 
   - Create an API endpoint for login (e.g., `/api/admin-login`)
   - Store credentials securely in environment variables
   - Use JWT tokens or session cookies
   - Hash passwords using bcrypt or similar

3. **Add HTTPS**: Always use HTTPS in production to encrypt data transmission

4. **Enable Two-Factor Authentication (2FA)**: Add an extra layer of security

5. **Implement Rate Limiting**: Prevent brute force attacks by limiting login attempts

6. **Add Password Strength Requirements**: Enforce strong password policies

7. **Log Authentication Attempts**: Track login attempts for security monitoring

## Session Expiration

The session automatically expires after 8 hours. To change this duration, edit `admin.html`:

```javascript
// Session expires after 8 hours
const SESSION_DURATION = 8 * 60 * 60 * 1000; // Change this value
```

## Logout

Users can logout by:
1. Clicking the "Logout" button in the sidebar
2. Confirming the logout action
3. Session data is cleared and user is redirected to login page

## Real-Time Data

The admin dashboard now loads real-time data:
- Data is fetched from `/api/orders` endpoint
- Auto-refreshes every **10 seconds**
- Console logs show data loading status
- No mock data - all data comes from actual orders

## Troubleshooting

### "API not available" in console
This is normal if:
- You're viewing the site locally without a server running
- The `/api/orders` endpoint is not accessible
- Once you deploy to Vercel or run a local server, real data will load

### Session expired message
- This happens after 8 hours of inactivity
- Simply login again to continue

### Can't login
- Verify you're using the correct credentials
- Check browser console for any errors
- Clear browser cache and try again
