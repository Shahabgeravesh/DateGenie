# Google Sheets Integration Setup

## Current Issue: Data Not Appearing in Sheet

The Google Apps Script is currently redirecting to a login page, which means it's not properly accessible. Here's how to fix it:

## 🔧 **Quick Fix Steps:**

### **1. Test the Current Setup**
Open `test-google-sheets.html` in your browser to test the current script URL.

### **2. Redeploy the Google Apps Script**
The script needs to be redeployed with proper permissions:

1. **Go to Google Apps Script**: https://script.google.com/
2. **Open your project** (or create a new one)
3. **Replace the code** with this updated version:

```javascript
function doGet(e) {
  try {
    // Get the active spreadsheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getActiveSheet();
    
    // Get parameters from the request
    var name = e.parameter.name || 'Unknown';
    var email = e.parameter.email || 'No email';
    var timestamp = e.parameter.timestamp || new Date().toISOString();
    var source = e.parameter.source || 'DateGenie App';
    
    // Add data to the sheet
    sheet.appendRow([name, email, timestamp, source]);
    
    // Return success response
    return ContentService
      .createTextOutput('Success')
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput('Error: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function doPost(e) {
  // Handle POST requests by calling doGet
  return doGet(e);
}
```

### **3. Deploy the Script**
1. **Click "Deploy"** → "New deployment"
2. **Choose type**: "Web app"
3. **Execute as**: "Me" (your Google account)
4. **Who has access**: "Anyone" (for testing)
5. **Click "Deploy"**

### **4. Update the App URL**
Replace the URL in `App.js` with your new deployment URL.

## 🧪 **Testing Steps:**

### **Step 1: Manual Test**
1. Open `test-google-sheets.html` in your browser
2. Click "Test Direct URL" - should show "Working"
3. Enter test data and click "Submit Test Data"
4. Check your Google Sheet for new data

### **Step 2: App Test**
1. Run the app: `npx expo start`
2. Go to Settings → Subscribe
3. Enter test data and submit
4. Check console logs for detailed response
5. Check Google Sheet for data

## 🔍 **Debugging:**

### **Check Console Logs**
The app now logs detailed information:
- Request parameters being sent
- Response status and content
- Any errors that occur

### **Common Issues:**
1. **"Moved Temporarily"** → Script needs redeployment
2. **"Google hasn't verified"** → Click "Advanced" → "Go to [Project] (unsafe)"
3. **CORS errors** → Use GET requests (already implemented)
4. **Permission denied** → Check script deployment settings

## 📊 **Expected Data Format:**

Your Google Sheet should have these columns:
- **A**: Name
- **B**: Email  
- **C**: Timestamp
- **D**: Source

## ✅ **Success Indicators:**
- Console shows "Successfully sent to Google Sheets"
- Response status is 200
- Data appears in your Google Sheet
- No freezing or errors in the app

## 🚨 **If Still Not Working:**
1. **Check the test HTML file** for detailed error messages
2. **Verify Google Sheet permissions** - make sure it's editable
3. **Try a new Google Apps Script project** from scratch
4. **Check if you're logged into the correct Google account**

---

**Last Updated**: Current troubleshooting for redirect issue 