# Ticlapay Cross-Border Transfer System - Setup Instructions

## 🚀 Quick Start

### Step 1: Database Setup

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Open the `database-setup.sql` file in the project root
3. Copy all the SQL and paste it into the SQL Editor
4. Click **RUN** to execute the migration

This will create all necessary tables:
- `user_roles` - Admin role management (separate for security)
- `recipients` - Recipient management for senders
- `exchange_rates` - Currency exchange rate tracking
- `settings` - App-wide settings
- Storage bucket for payment proofs
- All required RLS policies

### Step 2: Create Your First Admin User

After running the SQL, you need to make yourself an admin:

1. Register a new account in the app
2. Go to Supabase Dashboard → **SQL Editor**
3. Run this SQL (replace with your user ID):

```sql
-- Get your user ID first
SELECT id, email FROM auth.users;

-- Then insert your admin role (replace YOUR_USER_ID)
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');
```

### Step 3: Test the System

1. **As a regular user:**
   - Register/Login
   - Go to Recipients page - Add recipients in Zambia
   - Go to Send Money - Select recipient and send money
   - Upload proof of payment

2. **As an admin:**
   - Login with your admin account
   - Go to `/admin` route
   - View all pending transactions
   - Update exchange rates
   - Approve/reject transactions

## 📋 Features Implemented

### For Senders (Zimbabwe Users)
✅ User registration and login
✅ Dashboard with balance and transaction history
✅ Recipient management (add, edit, delete recipients)
✅ Send money flow with real-time exchange rates
✅ Payment proof upload
✅ Multiple payment methods (Airtel, MTN, Manual)

### For Admins
✅ Admin panel with statistics
✅ View all pending transactions
✅ Approve/reject transactions with notes
✅ Manage exchange rates
✅ View payment proofs
✅ Transaction management

### Security Features
✅ Row Level Security (RLS) policies
✅ Separate user_roles table for admin privileges
✅ Secure file uploads
✅ Authentication required for all operations

## 🎨 Design System

The app uses a **green and blue** color scheme:
- **Green** (Primary): Represents Zambia
- **Blue** (Secondary): Represents Zimbabwe

All colors use semantic tokens from the design system for consistency.

## 🔐 Security Notes

**IMPORTANT:**
- Admin roles are stored in a separate `user_roles` table (not in profiles)
- This prevents privilege escalation attacks
- Never check admin status from client-side storage
- Always use server-side validation with the `has_role()` function

## 📱 Key Routes

- `/` - Landing page
- `/auth` - Login/Register
- `/dashboard` - User dashboard
- `/recipients` - Manage recipients
- `/send` - Send money
- `/upload-proof` - Upload payment proof
- `/admin` - Admin panel (requires admin role)

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Lovable Cloud)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (Supabase)
- **File Storage**: Supabase Storage
- **Real-time**: Live exchange rates

## 📝 Next Steps (Optional Enhancements)

1. **SMS/Email Notifications**: Add edge functions for notifications
2. **API Integration**: Integrate with actual mobile money APIs (EcoCash, Airtel, MTN)
3. **Phone Verification**: Add OTP verification for phone numbers
4. **KYC/Verification**: Enhanced user verification with ID documents
5. **Transaction Reports**: Generate PDF reports for transactions
6. **Multi-currency**: Support more currency pairs

## 🐛 Troubleshooting

### "Access denied" error
- Make sure you've assigned the admin role correctly
- Check that the user_roles table exists
- Verify RLS policies are active

### Can't see transactions
- Check that sender_id matches your user ID
- Verify RLS policies are correctly set up

### File upload fails
- Make sure the storage bucket `payment-proofs` exists
- Check storage policies are configured
- Verify file size is under 5MB

## 💡 Tips

- Use the Supabase Table Editor to view and manage data
- Check the Supabase Auth logs for authentication issues
- Use the SQL Editor for quick database queries
- Monitor the Logs tab for edge function errors
