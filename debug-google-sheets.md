# Google Sheets Debug Guide

## 🔍 **Troubleshooting Steps:**

### **Step 1: Check Your Google Apps Script**
1. Go to your Google Apps Script project
2. Make sure the code looks like this:

```javascript
function doGet(e) {
  try {
    // Get the data from the URL parameters
    const name = e.parameter.name || '';
    const email = e.parameter.email || '';
    const timestamp = e.parameter.timestamp || new Date().toISOString();
    const source = e.parameter.source || 'DateGenie App';
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Add the data to the next available row
    sheet.appendRow([
      name,
      email,
      timestamp,
      source
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'success',
        message: 'Data added successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'error', 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  // Also handle POST requests for compatibility
  return doGet(e);
}
```

### **Step 2: Check Your Google Sheet**
1. Make sure you have a Google Sheet open
2. Add these headers in row 1:
   - A1: Name
   - B1: Email
   - C1: Timestamp
   - D1: Source

### **Step 3: Test the Script Manually**
1. Copy this URL and paste it in your browser:
```
https://script.google.com/macros/s/AKfycbyF8OnaKqoUXIkYR7nylWd6G6MxbvLTwKkG0ou4ZkWTNTmGb3-eG4K54nmO9FI6oVi-/exec?name=TestUser&email=test@email.com&timestamp=2024-01-15T10:30:00Z&source=DateGenie%20App
```

2. You should see a JSON response like:
```json
{"status":"success","message":"Data added successfully"}
```

3. Check your Google Sheet - a new row should appear!

### **Step 4: Check Script Permissions**
1. In your Google Apps Script, go to "Deployments"
2. Click on your deployment
3. Make sure:
   - Execute as: "Me" (your email)
   - Who has access: "Anyone"

### **Step 5: Check Spreadsheet Connection**
1. In your Google Apps Script, make sure you're editing the script that's connected to your spreadsheet
2. The script should be created from within your Google Sheet (Extensions > Apps Script)

### **Step 6: Common Issues**
- **Wrong spreadsheet**: Make sure the script is connected to the right sheet
- **Permissions**: Script needs access to write to the sheet
- **Headers missing**: Add the column headers first
- **Script not saved**: Make sure to save after editing

### **Step 7: Alternative Test**
If the manual test doesn't work, try this simpler version:

```javascript
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow(['Test', 'test@email.com', new Date(), 'Manual Test']);
    
    return ContentService
      .createTextOutput('Success!')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService
      .createTextOutput('Error: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
```

Try the manual test first and let me know what happens! 