import '@servicenow/sdk/global'
import { UiAction } from '@servicenow/sdk/core'

export const confirmReadiness = UiAction({
  $id: Now.ID['confirm_readiness_ui_action'],
  name: 'Confirm Readiness',
  table: 'x_1996578_projec_0_regional_referral',
  actionName: 'confirm_readiness',
  active: true, showInsert: false, showUpdate: true,
  condition: `current.status == 'selected' && (gs.hasRole('sn_hcls.doctor') || gs.hasRole('sn_hcls.manager'))`,
  roles: ['sn_hcls.doctor', 'sn_hcls.manager'],
  form: { showButton: true, style: 'primary' },
  script: `
(function() {
  current.status = 'approved';
  current.update();
  gs.eventQueue('lever.dispatch.triggered', current, current.u_destination_facility + '', gs.getUserName());
  action.setRedirectURL(current);
})();
  `,
})
