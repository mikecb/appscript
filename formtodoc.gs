function Initialize() {

    try {

        var triggers = ScriptApp.getProjectTriggers();

        for (var i in triggers)
            ScriptApp.deleteTrigger(triggers[i]);

        ScriptApp.newTrigger("EmailGoogleFormData")
            .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
            .onFormSubmit().create();

    }
    catch (error) {
        throw new Error("Please add this code in the Google Spreadsheet");
    }
}

function EmailGoogleFormData(e) {

    if (!e) {
        throw new Error(
            "Select Initialize from the Run menu, then accept oauth permissions."
        );
    }

    try {

        if (MailApp.getRemainingDailyQuota() > 0) {
            //Human readable date string is nice.
            var d = new Date();
            var local = d.toLocaleDateString();
            var year = d.getFullYear();

            //Create your document

            var name = "Document Name"; //Name your document

            var doc = DocumentApp.create(name + " on " + local);
            var body = doc.getBody();
            var key, entry,
                ss = SpreadsheetApp.getActiveSheet(),
                cols = ss.getRange(1, 1, 1, ss.getLastColumn()).getValues()[0];

            var title = body.appendParagraph(name);
            title.setHeading(DocumentApp.ParagraphHeading.TITLE);
            title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

            // Iterates through the Form Fields, formats question names, and then prints response.
            for (var keys in cols) {
                key = cols[keys];
                entry = e.namedValues[key];
                body.appendParagraph(key).setHeading(DocumentApp.ParagraphHeading
                    .HEADING5);
                body.appendParagraph(entry);
            }

            //Save document, add to specified folder, remove from root folder.
            doc.saveAndClose();
            var consfolder = DriveApp.getFolderById(''); //Insert folder key here.
            var fileId = doc.getId();
            var file = DriveApp.getFileById(fileId);
            consfolder.addFile(file);
            DriveApp.getRootFolder().removeFile(file);

            var email = ""; //Comma separated list of email addresses who will receive an email with the document generated above attached. Can make sure they can access it my modifying the folder permissions above. Best practice for notification emails is a group.

            var subject = ""; //Add subject here
            MailApp.sendEmail({
                to: email,
                subject: subject,
                body: ' ' + doc.getUrl(),
                noReply: true,
            });
        }
    }
    catch (error) {
        Logger.log(error.toString());
        admin = ""; //email address for error logs to be sent to.
        MailApp.sendEmail({
            to: admin,
            subject: "Error in script ____",
            body: error.toString() + "\n" + Logger.getLog(),
            noReply: true,
        });
    }
}
