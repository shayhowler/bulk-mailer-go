# Privacy and Data Handling

## Summary
- Bulk Mailer Go processes data locally on your device.
- The app does not send personal data to external servers without your explicit action and consent (e.g., configuring an SMTP account and sending emails).
- You are responsible for complying with applicable data protection and anti‑spam laws.

## Data Stored Locally
- Account configuration: SMTP host, port, email address, and (if used) app‑specific passwords/tokens.
- Contacts and templates: Imported contacts, fields, email templates, and attachments.
- Logs: Sending logs and basic statistics.

## Security Notes
- Prefer app passwords (e.g., Gmail App Passwords) instead of regular passwords when available.
- Keep OS and the app up to date; use encrypted disks/user profiles if possible.
- Ensure restrictive file permissions for the app’s data directory on your system.

## Third‑Party Services
- Email delivery is performed through the SMTP provider you configure (e.g., Gmail). Their terms and privacy policies apply.
- Remote images/links in emails may cause recipient clients to contact external servers; those parties’ policies apply.

## User Controls
- You can add/remove accounts, templates, contacts, and logs at any time.
- You can export/import or delete local data from within the app.
- Uninstalling the app:
  - The built‑in uninstaller removes the application binaries and (on supported OSes) performs cleanup of app data.
  - On macOS and Windows: full removal is performed by the uninstaller (binaries + app data).
  - On Linux: binaries are removed; some app data directories (e.g., ~/.bulkmailergo or cache locations) may remain due to OS conventions. You can remove them manually if desired.


## Contact
- Author: Burak Aksoy (@shayhowler)
- Project: Bulk Mailer Go
- GitHub: https://github.com/shayhowler/bulk-mailer-go
