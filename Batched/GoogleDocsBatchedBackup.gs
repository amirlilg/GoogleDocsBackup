function backupGoogleDocs() {
  var backupFolderId = "FOLDER_ID_HERE";
  var batchSize = 100; // Set the batch size as needed

  // Get the current date
  var currentDate = new Date();
  // var formattedDate = Utilities.formatDate(currentDate, "GMT", "yyyy-MM-dd");
  var currentMonth = Utilities.formatDate(currentDate, "GMT", "yyyy-MM");
  var formattedDate = currentPersianDate();

  // Get the root folder of your Google Drive
  var rootFolder = DriveApp.getRootFolder();

  // Reset processed file IDs at the beginning of each month
  var scriptProperties = PropertiesService.getScriptProperties();
  var lastProcessedMonth = scriptProperties.getProperty("lastProcessedMonth");

  if (!lastProcessedMonth || lastProcessedMonth !== currentMonth) {
    // Reset the processed file IDs
    scriptProperties.deleteProperty("processedFileIds");

    // Reset the batch count
    scriptProperties.deleteProperty("batchCount");

    // Update the last processed month
    scriptProperties.setProperty("lastProcessedMonth", currentMonth);
  }

  // Create a backup folder with the current date
  var backupFolder = rootFolder.createFolder("GoogleDocsBackup_" + formattedDate);

  // Get all Google Docs files in your Drive
  var googleDocsFiles = DriveApp.getFilesByType(MimeType.GOOGLE_DOCS);

  // Load processed file IDs from properties
  var processedFileIds = scriptProperties.getProperty("processedFileIds");
  processedFileIds = processedFileIds ? JSON.parse(processedFileIds) : [];

  // Load the batch count from properties
  var batchCount = scriptProperties.getProperty("batchCount");
  batchCount = batchCount ? parseInt(batchCount) : 1;

  // Process files in batches
  var processedCount = 0;
  var blobs = []; // Array to store blobs for zipping
  while (googleDocsFiles.hasNext() && processedCount < batchSize) {
    var docFile = googleDocsFiles.next();

    // Check if the file has already been processed
    if (processedFileIds.indexOf(docFile.getId()) === -1) {
      // Get the export link
      var exportLink = "https://docs.google.com/feeds/download/documents/export/Export?id=" + docFile.getId() + "&exportFormat=docx";

      // Fetch the exported file content
      var response = UrlFetchApp.fetch(exportLink, {
        headers: {
          Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
        },
      });

      // Add the blob to the array for zipping
      blobs.push(response.getBlob().setName(docFile.getName() + ".docx"));

      // Add the file ID to the processed list
      processedFileIds.push(docFile.getId());

      processedCount++;
    }

    // Check if the batch size is reached or if there are no more files
    if (processedCount >= batchSize || !googleDocsFiles.hasNext()) {
      backupFolder.setTrashed(true);
      if (blobs.length == 0){
        Logger.log("No more files to backup! Merging Zips ...");
        mergeBatchedZipFiles();
        return;
      }

      // Create a zip file from the array of blobs
      var zipBlob = Utilities.zip(blobs);

      // Get the specific folder where you want to store the backups
      var destinationFolder = DriveApp.getFolderById(backupFolderId);

      // Create a blob from the zip data and upload it to the destination folder
      destinationFolder.createFile(zipBlob).setName("GoogleDocsBackup_" + formattedDate + "_batch" + batchCount + ".zip");

      // Increment the batch counter
      batchCount++;

      // Clear the array for the next batch
      blobs = [];
    }
  }

  // Save the updated processed file IDs and batch count to properties
  scriptProperties.setProperty("processedFileIds", JSON.stringify(processedFileIds));
  scriptProperties.setProperty("batchCount", batchCount.toString());

  Logger.log("Backup " + formattedDate + "_batch" + (batchCount-1).toString() + " completed successfully!");


  // trigger the function to backup remaining google docs files ...
  // ... or if none remain, run mergeBatchedZipFiles
  var trigger = ScriptApp.newTrigger('backupGoogleDocs')
    .timeBased()
    .after(15 * 1000)  // 15 seconds in milliseconds
    .create();
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