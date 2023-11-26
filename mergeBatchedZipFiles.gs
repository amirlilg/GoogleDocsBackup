function mergeBatchedZipFiles() {
  var destinationFolderId = "FOLDER_ID_HERE"; // Replace with the destination folder ID
  var formattedDate = currentPersianDate();

  // Get the specific folder where batched zip files are stored
  var sourceFolderId = "FOLDER_ID_HERE"; // Replace with the source folder ID
  var sourceFolder = DriveApp.getFolderById(sourceFolderId);

  // Get all files in the source folder
  var files = sourceFolder.getFiles();

  // Create an array to store blobs for zipping
  var blobs = [];
  while (files.hasNext()) {
    var file = files.next();
  
    // Check if the file name matches the expected pattern
    if (file.getName().match("GoogleDocsBackup_" + formattedDate + "_batch\\d+\\.zip")) {
    // Fetch the content of the batched zip file
      var contentBlobs = Utilities.unzip(file.getBlob());

    // Append all blobs to the array
      Array.prototype.push.apply(blobs, contentBlobs);

      file.setTrashed(true); // Delete the batched zip file after merging
  }
}

  // Get the specific folder where you want to store the merged backup
  var destinationFolder = DriveApp.getFolderById(destinationFolderId);


  if(blobs.length == 0){
    Logger.log("no batch zip files with matching description found!");
    return;
  }

  // Create a zip file from the array of blobs
  var mergedZipBlob = Utilities.zip(blobs);

  // Upload the merged zip file to the destination folder
  destinationFolder.createFile(mergedZipBlob).setName("GoogleDocsBackup_" + formattedDate + ".zip");

  Logger.log("Merged batched zip files into one.");
}
