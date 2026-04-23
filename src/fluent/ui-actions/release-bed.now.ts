import '@servicenow/sdk/global'
import { UiAction } from '@servicenow/sdk/core'

export const releaseBed = UiAction({
  $id: Now.ID['release_bed_ui_action'],
  name: 'Release Bed',
  table: 'sn_hcls_location',
  actionName: 'release_bed',
  active: true,
  showInsert: false,
  showUpdate: true,
  hint: 'Increment available bed count by 1 (discharge or demo reset)',
  order: 900,

  condition: `gs.hasRole('sn_hcls.doctor') || gs.hasRole('sn_hcls.manager')`,

  roles: ['sn_hcls.doctor', 'sn_hcls.manager'],

  form: {
    showButton: true,
    style: 'unstyled',
  },

  script: `
(function() {
  var currentBeds = parseInt(current.u_available_beds + '', 10) || 0;
  var totalBeds   = parseInt(current.u_total_beds   + '', 10) || 0;

  // Guard: never exceed total bed capacity.
  if (currentBeds >= totalBeds) {
    gs.addInfoMessage('Available beds already at maximum capacity (' + totalBeds + ').');
    action.setRedirectURL(current);
    return;
  }

  current.u_available_beds = currentBeds + 1;
  current.update();

  gs.addInfoMessage('Bed released. Available beds: ' + (currentBeds + 1) + ' / ' + totalBeds);
  action.setRedirectURL(current);
})();
  `
})