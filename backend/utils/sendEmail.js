/**
 * utils/sendEmail.js
 *
 * This was the EMPTY file. It is now a thin wrapper that calls emails.js.
 * authController.js imports from HERE — so this file must exist and work.
 *
 * Why two files?
 *   emails.js  → full nodemailer setup + all HTML templates
 *   sendEmail.js → simple named export that authController.js uses
 *
 * This file re-exports from emails.js so both names work everywhere.
 */

const { sendEmail, emailTemplates } = require('./emails');

module.exports = { sendEmail, emailTemplates };