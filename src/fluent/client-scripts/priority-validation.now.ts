import { ClientScript } from '@servicenow/sdk/core'

export const priorityOnChange = ClientScript({
  $id: Now.ID['priority_onchange_cs'],
  name: 'Priority 1 — Mandatory Notes Warning',
  table: 'x_1996578_projec_0_regional_referral',
  type: 'onChange', field: 'priority', active: true, global: true, uiType: 'all',
  script: `
function onChange(control, oldValue, newValue, isLoading) {
  if (isLoading) return;
  if (newValue === '1') {
    g_form.setMandatory('u_clinical_notes', true);
    g_form.showErrorBox('u_clinical_notes', 'PRIORITY 1 — CRITICAL: Detailed clinical notes are required.');
  } else {
    g_form.setMandatory('u_clinical_notes', false);
    g_form.hideErrorBox('u_clinical_notes');
  }
}
  `,
})

export const prioritySubmitValidation = ClientScript({
  $id: Now.ID['priority_submit_validation_cs'],
  name: 'Priority 1 — Submit Validation',
  table: 'x_1996578_projec_0_regional_referral',
  type: 'onSubmit', active: true, global: true, uiType: 'all',
  script: `
function onSubmit() {
  var priority = g_form.getValue('priority');
  if (priority !== '1') return true;
  var notes = g_form.getValue('u_clinical_notes') || '';
  if (notes.trim().length < 20) {
    g_form.showErrorBox('u_clinical_notes', 'PRIORITY 1 — Clinical Notes must be at least 20 characters.');
    return false;
  }
  return true;
}
  `,
})
