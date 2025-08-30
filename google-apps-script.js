
// Configuration
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your Google Sheet ID
const SHEET_NAME = 'Leads'; // Name of the sheet tab

/**
 * Main function to handle POST requests
 */
function doPost(e) {
  try {
    // Handle preflight OPTIONS request
    if (e.parameter.method === 'OPTIONS') {
      return createCORSResponse();
    }
    
    let data;
    
    // Handle different content types
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        // If JSON parsing fails, try to get data from parameters
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }
    
    // Parse device info if it's a string
    if (data.device && typeof data.device === 'string') {
      try {
        data.device = JSON.parse(data.device);
      } catch (parseError) {
        console.log('Could not parse device info:', data.device);
      }
    }
    
    // Validate required fields - only fullName and phone are mandatory
    if (!data.fullName || !data.phone) {
      return createResponse(false, 'Missing required fields: fullName and phone are mandatory');
    }
    
    // Add the lead to Google Sheets
    const result = addLeadToSheet(data);
    
    if (result.success) {
      // Optional: Send notification email
      sendNotificationEmail(data);
      
      return createResponse(true, 'Lead added successfully', { rowNumber: result.rowNumber });
    } else {
      return createResponse(false, result.error);
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    return createResponse(false, 'Internal server error: ' + error.toString());
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return createResponse(true, 'Kafi Trade Lead Collection API is running');
}

/**
 * Add lead data to Google Sheets
 */
function addLeadToSheet(data) {
  try {
    const sheet = getOrCreateSheet();
    
    // Prepare row data
    const timestamp = new Date();
    
    // Format device info properly
    let deviceInfo = '';
    if (data.device && typeof data.device === 'object') {
      const device = data.device;
      deviceInfo = `Type: ${device.type || 'unknown'}, OS: ${device.os || 'unknown'}, Browser: ${device.browser || 'unknown'}, Mobile: ${device.isMobile ? 'Yes' : 'No'}`;
    } else if (typeof data.device === 'string') {
      try {
        const parsedDevice = JSON.parse(data.device);
        deviceInfo = `Type: ${parsedDevice.type || 'unknown'}, OS: ${parsedDevice.os || 'unknown'}, Browser: ${parsedDevice.browser || 'unknown'}, Mobile: ${parsedDevice.isMobile ? 'Yes' : 'No'}`;
      } catch (e) {
        deviceInfo = data.device;
      }
    }
    
    const rowData = [
      timestamp,
      data.fullName || '',
      "'" + (data.phone || '') // Add single quote prefix to preserve leading zeros
    ];
    
    // Add the row
    const range = sheet.appendRow(rowData);
    const rowNumber = sheet.getLastRow();
    
    // Format the new row
    formatNewRow(sheet, rowNumber);
    
    return {
      success: true,
      rowNumber: rowNumber
    };
    
  } catch (error) {
    console.error('Error adding lead to sheet:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get or create the leads sheet
 */
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // Create new sheet with headers
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    setupSheetHeaders(sheet);
  }
  
  return sheet;
}

/**
 * Setup sheet headers
 */
function setupSheetHeaders(sheet) {
  const headers = [
    'Timestamp',
    'Full Name',
    'Phone'
  ];
  
  // Set headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  
  // Format headers
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // Set column widths
  sheet.setColumnWidth(1, 200); // Timestamp
  sheet.setColumnWidth(2, 250); // Full Name
  sheet.setColumnWidth(3, 150); // Phone
  
  // Set phone column format to text to preserve leading zeros
  const phoneColumn = sheet.getRange(2, 3, sheet.getMaxRows() - 1, 1);
  phoneColumn.setNumberFormat('@'); // @ format means text
  
  // Freeze header row
  sheet.setFrozenRows(1);
}

/**
 * Format new row
 */
function formatNewRow(sheet, rowNumber) {
  const range = sheet.getRange(rowNumber, 1, 1, 3);
  
  // Alternate row colors
  if (rowNumber % 2 === 0) {
    range.setBackground('#f8f9fa');
  }
  
  // Format timestamp
  const timestampCell = sheet.getRange(rowNumber, 1);
  timestampCell.setNumberFormat('dd/mm/yyyy hh:mm:ss');
  
  // Format phone column as text to preserve leading zeros
  const phoneCell = sheet.getRange(rowNumber, 3);
  phoneCell.setNumberFormat('@');
}

/**
 * Send notification email (optional)
 */
function sendNotificationEmail(data) {
  try {
    const emailAddress = 'your-email@example.com'; // Replace with your email
    const subject = 'New Lead: ' + data.fullName;
    
    const body = `
New lead submitted from Kafi Trade landing page:

Name: ${data.fullName}
Phone: ${data.phone}

Submitted at: ${new Date().toLocaleString('vi-VN')}
    `;
    
    MailApp.sendEmail(emailAddress, subject, body);
    
  } catch (error) {
    console.error('Error sending notification email:', error);
    // Don't fail the main process if email fails
  }
}

/**
 * Create standardized response
 */
function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
}

/**
 * Create CORS response for preflight requests
 */
function createCORSResponse() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
}

/**
 * Handle OPTIONS requests for CORS
 */
function doOptions(e) {
  return createCORSResponse();
}

/**
 * Test function to verify setup
 */
function testSetup() {
  const testData = {
    fullName: 'Test User',
    phone: '0901234567'
  };
  
  const result = addLeadToSheet(testData);
  console.log('Test result:', result);
  
  return result;
}

/**
 * Get leads data (for dashboard/analytics)
 */
function getLeads(limit = 100) {
  try {
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: true, data: [] };
    }
    
    const startRow = Math.max(2, lastRow - limit + 1);
    const numRows = lastRow - startRow + 1;
    
    const range = sheet.getRange(startRow, 1, numRows, 3);
    const values = range.getValues();
    
    const leads = values.map(row => ({
      timestamp: row[0],
      fullName: row[1],
      phone: row[2]
    }));
    
    return { success: true, data: leads };
    
  } catch (error) {
    console.error('Error getting leads:', error);
    return { success: false, error: error.toString() };
  }
}
