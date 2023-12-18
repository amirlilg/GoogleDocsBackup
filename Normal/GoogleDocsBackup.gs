function backupGoogleDocs() {

  var backupFolderId = "FOLDER_ID_HERE";
  var backupFolder = DriveApp.getFolderById(backupFolderId);
  var formattedDate = currentPersianDate();

  var googleDocsFiles = DriveApp.getFilesByType(MimeType.GOOGLE_DOCS);

  // Create an array to store blobs for zipping
  var blobs = [];

  // Iterate through Google Docs files
  while (googleDocsFiles.hasNext()) {
    var docFile = googleDocsFiles.next();

    // Export the Google Docs file as a DOCX
    var exportLink = "https://docs.google.com/feeds/download/documents/export/Export?id=" + docFile.getId() + "&exportFormat=docx";
    var docxBlob = UrlFetchApp.fetch(exportLink, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } }).getBlob();

    // Add the DOCX blob to the array
    blobs.push(docxBlob);

    Logger.log("Exported: " + docFile.getName());
  }

  // Create a zip file from the array of blobs
  var zipBlob = Utilities.zip(blobs);

  // Create a copy in the backup folder
  backupFolder.createFile(zipBlob).setName("GoogleDocsBackup_" + formattedDate + ".zip");

  Logger.log("Backup completed successfully!");
}

// Funcrtion to get the current date in persian calendar
function currentPersianDate() {
  var currentDate = new Date().toLocaleDateString('fa-IR-u-nu-latn');
  // console.log(currentDate);
  // Format the date to YYYY-MM-DD
  var fields = currentDate.split('/');
  var year = fields[0];
  var month = fields[1].padStart(2,'0');
  var day = fields[2].padStart(2,'0');

  // console.log(year + "-" + month + "-" + day);
  return year + "-" + month + "-" + day;
}
