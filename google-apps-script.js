
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
      data.phone || '',
      data.email || '',
      data.company || '',
      data.experience || '',
      data.source || 'kafi-landing-page',
      data.device?.type || '',
      data.device?.os || '',
      data.device?.browser || '',
      data.userAgent || '',
      data.referrer || '',
      data.utm_source || '',
      data.utm_medium || '',
      data.utm_campaign || '',
      deviceInfo
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
    'Phone',
    'Email',
    'Company',
    'Experience',
    'Source',
    'Device Type',
    'OS',
    'Browser',
    'User Agent',
    'Referrer',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'Device Info'
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
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 200); // Full Name
  sheet.setColumnWidth(3, 150); // Phone
  sheet.setColumnWidth(4, 200); // Email
  sheet.setColumnWidth(5, 150); // Company
  sheet.setColumnWidth(6, 120); // Experience
  sheet.setColumnWidth(7, 120); // Source
  sheet.setColumnWidth(8, 100); // Device Type
  sheet.setColumnWidth(9, 80);  // OS
  sheet.setColumnWidth(10, 80); // Browser
  sheet.setColumnWidth(11, 300); // User Agent
  sheet.setColumnWidth(12, 150); // Referrer
  sheet.setColumnWidth(13, 100); // UTM Source
  sheet.setColumnWidth(14, 100); // UTM Medium
  sheet.setColumnWidth(15, 120); // UTM Campaign
  sheet.setColumnWidth(16, 200); // Device Info
  
  // Freeze header row
  sheet.setFrozenRows(1);
}

/**
 * Format new row
 */
function formatNewRow(sheet, rowNumber) {
  const range = sheet.getRange(rowNumber, 1, 1, 16);
  
  // Alternate row colors
  if (rowNumber % 2 === 0) {
    range.setBackground('#f8f9fa');
  }
  
  // Format timestamp
  const timestampCell = sheet.getRange(rowNumber, 1);
  timestampCell.setNumberFormat('dd/mm/yyyy hh:mm:ss');
  
  // No status cell formatting needed anymore
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
Email: ${data.email}
Company: ${data.company || 'Not provided'}
Experience: ${data.experience || 'Not provided'}

Device: ${data.device?.type || 'Unknown'} (${data.device?.os || 'Unknown'})
Source: ${data.source || 'Direct'}
UTM Campaign: ${data.utm_campaign || 'None'}

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
    phone: '0901234567',
    email: 'test@example.com',
    company: 'Test Company',
    experience: 'beginner',
    source: 'test',
    device: {
      type: 'desktop',
      os: 'windows',
      browser: 'chrome'
    },
    timestamp: new Date().toISOString()
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
    
    const range = sheet.getRange(startRow, 1, numRows, 17);
    const values = range.getValues();
    
    const leads = values.map(row => ({
      timestamp: row[0],
      fullName: row[1],
      phone: row[2],
      email: row[3],
      company: row[4],
      experience: row[5],
      source: row[6],
      deviceType: row[7],
      os: row[8],
      browser: row[9],
      userAgent: row[10],
      referrer: row[11],
      utmSource: row[12],
      utmMedium: row[13],
      utmCampaign: row[14],
      deviceInfo: row[15],
      status: row[16]
    }));
    
    return { success: true, data: leads };
    
  } catch (error) {
    console.error('Error getting leads:', error);
    return { success: false, error: error.toString() };
  }
}
