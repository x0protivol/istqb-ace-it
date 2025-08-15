# Complete Setup Guide for ISTQB Exam Mastery App

## 🚀 Quick Start (Follow these steps in order)

### Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with your account
3. **Click "New Project"**
4. **Fill in the details:**
   - **Organization**: Select your org
   - **Project Name**: `istqb-ace-it`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. **Click "Create new project"** and wait 2-3 minutes

### Step 2: Get Your Credentials

Once your project is ready:

1. **Go to Settings → API** in your Supabase dashboard
2. **Copy these values:**
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 3: Set Up Database

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy and paste the entire content** from `supabase-setup.sql`
3. **Click "Run"** to create all tables and sample data

### Step 4: Set Up Storage

1. **Go to Storage** in your Supabase dashboard
2. **Click "New bucket"**
3. **Name it**: `pdfs`
4. **Check "Public bucket"**
5. **Set file size limit**: `50 MB`
6. **Click "Create bucket"**
7. **Go to Policies tab** and add the policies from `supabase-storage-setup.md`

### Step 5: Update Environment Variables

1. **Open the `.env` file** in your project
2. **Replace the placeholder values** with your real credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 6: Test Your Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Visit your app** at `http://localhost:8080`

3. **You should see:**
   - ✅ Dashboard loads without errors
   - ✅ Sample questions are displayed
   - ✅ Upload functionality works
   - ✅ Quiz functionality works

### Step 7: Deploy to Production

Once everything works locally, your app will automatically deploy to:
**https://istqb-ace-it.lovable.app/**

## 🔧 Troubleshooting

### If you see "Supabase not configured" warnings:
- Check that your `.env` file has the correct credentials
- Restart your development server
- Make sure there are no extra spaces in the `.env` file

### If database queries fail:
- Check that you ran the SQL setup script
- Verify your database password is correct
- Check that Row Level Security policies are set up

### If file uploads don't work:
- Verify the storage bucket is created
- Check that storage policies are set to allow public access
- Make sure the bucket name is exactly `pdfs`

## 📊 What You'll Get

After setup, your app will have:
- ✅ **5 sample ISTQB questions** ready to test
- ✅ **User statistics tracking**
- ✅ **PDF upload functionality**
- ✅ **Quiz system with scoring**
- ✅ **Results analysis**
- ✅ **Responsive design**

## 🎯 Next Steps

1. **Add more questions** through the PDF upload feature
2. **Customize the design** if needed
3. **Share your app** with others
4. **Monitor usage** in your Supabase dashboard

---

**Need help?** Check the console for any error messages and make sure all steps are completed in order. 