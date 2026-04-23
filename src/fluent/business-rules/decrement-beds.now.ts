import { BusinessRule } from '@servicenow/sdk/core'

export const decrementBeds = BusinessRule({
  $id: Now.ID['decrement_beds_br'],
  name: 'Decrement Beds on Hand-off',
  table: 'x_1996578_projec_0_regional_referral',
  when: 'after', action: ['update'], active: true, order: 100,
  filterCondition: 'u_handoff_confirmed=true',

  script: `
(function executeRule(current, previous) {
  if (!current.u_destination_facility || current.u_destination_facility.nil()) return;
  if (previous.u_handoff_confirmed == true) return;

  var facilityGR = new GlideRecord('sn_hcls_location');
  if (!facilityGR.get(current.u_destination_facility)) return;

  var currentBeds = parseInt(facilityGR.u_available_beds + '', 10) || 0;
  if (currentBeds <= 0) return;

  facilityGR.u_available_beds = currentBeds - 1;
  facilityGR.update();
  gs.info('Decrement Beds: ' + facilityGR.name + ' now at ' + (currentBeds - 1));
})(current, previous);
  `,
})
