# GoogleDocsBackup
Automating backup of Google Docs [in Google Drive] using Google Apps Script.

The code here can backup all of Google Docs existing in a Google Drive. It also can be set so it does that every month. I had to use bach backup in order to circumvent Google App Script's policy about maximum 6 minute runtime.

## How to use
1. Clone the repository
2. Go to [script.google.com](https://script.google.com)
3. Create a new project.
4. Add GoogleDocsBatchedBackup.gs and mergeBatchedZipFiles.gs to your project.
5. run backupGoogleDocs() function from the top menu. Everything else is done automatically.

Alternatively, you can add trigger for backupGoogleDocs() to make it run automatically. The code structure is designed to have a backup each month, so set a specific day of month to have backups automatically.
