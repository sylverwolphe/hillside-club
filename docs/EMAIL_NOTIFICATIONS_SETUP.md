# Email Notifications Setup

Get email notifications when someone submits a contact form.

## How It Works

1. User submits form on your website
2. Data goes to Google Forms (via hidden iframe)
3. Google Apps Script triggers and sends you an email
4. You receive the form data in your inbox

## Setup Instructions

### Step 1: Open Script Editor

1. Go to your Google Form
2. Click the **3-dot menu** (top right)
3. Select **"Script editor"**

### Step 2: Add the Script

Delete any existing code and paste:

```javascript
function onFormSubmit(e) {
  var recipient = "YOUR_EMAIL@example.com";  // <-- Change this

  var responses = e.namedValues;
  var formTitle = e.source.getTitle();

  var subject = "New Submission: " + formTitle;

  var body = "New form submission:\n\n";
  for (var field in responses) {
    var value = responses[field].join(", ");
    if (value) {
      body += field + ": " + value + "\n";
    }
  }
  body += "\n---\nReceived: " + new Date().toLocaleString();

  MailApp.sendEmail(recipient, subject, body);
}
```

Replace `YOUR_EMAIL@example.com` with your actual email.

### Step 3: Create the Trigger

1. Click the **clock icon** (Triggers) in the left sidebar
2. Click **"+ Add Trigger"**
3. Set these options:
   - Function: `onFormSubmit`
   - Event source: `From form`
   - Event type: `On form submit`
4. Click **Save**
5. Authorize when prompted (click through any warnings)

### Step 4: Test

1. Submit a test entry to your Google Form
2. Check your email within a few seconds

### Step 5: Repeat

Add this script to each Google Form you want notifications for.

## Multiple Recipients

To send to multiple people:

```javascript
var recipient = "you@example.com, partner@example.com";
```

## Troubleshooting

**No email received:**
- Check spam folder
- Verify trigger is set up (Triggers → should show your trigger)
- Check Executions log for errors (left sidebar → Executions)

**Authorization errors:**
- Re-authorize: Triggers → click trigger → Re-authorize

**Script errors:**
- Check Executions log for error details
