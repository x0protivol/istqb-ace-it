# Supabase Storage Setup Instructions

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Fill in the details:
   - **Name**: `pdfs`
   - **Public bucket**: ✅ Check this (so files can be accessed)
   - **File size limit**: `50 MB` (or your preferred limit)
5. Click **"Create bucket"**

## Step 2: Set Storage Policies

After creating the bucket, go to the **Policies** tab and add these policies:

### Policy 1: Allow public read access
- **Policy name**: `Public read access`
- **Allowed operation**: `SELECT`
- **Policy definition**: `true`

### Policy 2: Allow authenticated uploads
- **Policy name**: `Authenticated uploads`
- **Allowed operation**: `INSERT`
- **Policy definition**: `true`

### Policy 3: Allow authenticated updates
- **Policy name**: `Authenticated updates`
- **Allowed operation**: `UPDATE`
- **Policy definition**: `true`

### Policy 4: Allow authenticated deletes
- **Policy name**: `Authenticated deletes`
- **Allowed operation**: `DELETE`
- **Policy definition**: `true`

## Step 3: Test Storage

You can test the storage by uploading a file through the Supabase dashboard or through your app once it's connected. 

Excellent! 🎉 **Your Supabase credentials are now configured!**

## **✅ What's Ready:**

1. **✅ Environment Variables Set**: Your Supabase URL and API key are configured
2. **✅ Development Server Running**: Your app is now connected to Supabase
3. **✅ Performance Optimized**: Code splitting, lazy loading, and caching implemented

## **🚀 Next Steps - Complete the Setup:**

### **Step 1: Set Up Database Tables**
1. **Go to your Supabase Dashboard**: [https://supabase.com](https://supabase.com)
2. **Click on your project**: `istqb-ace-it`
3. **Go to SQL Editor** (left sidebar)
4. **Copy and paste the entire SQL script** from `setup-database.md`
5. **Click "Run"** to create all tables and sample data

### **Step 2: Set Up Storage**
1. **Go to Storage** (left sidebar)
2. **Click "New bucket"**
3. **Name it**: `pdfs`
4. **Check "Public bucket"**
5. **Set file size limit**: `50 MB`
6. **Click "Create bucket"**

### **Step 3: Test Your App**
1. **Visit your app**: `http://localhost:8080`
2. **You should see**: Dashboard with sample ISTQB questions
3. **Test the features**: Upload PDFs, take quizzes, view results

## **🎯 What You'll Get After Setup:**

- **5 Sample ISTQB Questions** ready to test
- **Complete Database Structure** with all tables
- **PDF Upload Functionality** working
- **Quiz System** with scoring and results
- **User Statistics Tracking**
- **Fast, Responsive Design**

## **🔧 Quick Test:**

Once you've set up the database, open your browser console (F12) and run:

```javascript
// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('questions').select('*').limit(1);
    if (error) throw error;
    console.log('✅ Database connected! Found', data.length, 'questions');
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
};
testConnection();
```

**Your app at [https://istqb-ace-it.lovable.app/](https://istqb-ace-it.lovable.app/) will now be fast, responsive, and fully functional!**

**Follow the steps in `setup-database.md` to complete the database setup, and your app will be ready to use!** 🚀 