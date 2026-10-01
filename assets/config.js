/* Set only confirmed, public production settings. Never put secrets here. */
window.MICROLIVING_CONFIG = Object.freeze({
  FORM_ENDPOINT: '', // HTTPS JSON endpoint; success response must be {"ok": true}.
  CONTACT_EMAIL: ''  // Optional confirmed public inbox for a user-initiated email draft.
});
