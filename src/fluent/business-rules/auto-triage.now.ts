import { BusinessRule } from '@servicenow/sdk/core'

export const autoTriageAndMatch = BusinessRule({
  $id: Now.ID['auto_triage_match_br'],
  name: 'Auto-Triage + Auto-Match',
  table: 'x_1996578_projec_0_regional_referral',
  when: 'before', action: ['insert'], active: true, order: 100,

  script: `
(function executeRule(current, previous) {
  current.transport_status = 'pending';

  if (current.priority != '1') return;

  var requiredCapability = _getRequiredCapability(current.u_clinical_notes + '');

  var facilityGR = new GlideRecord('sn_hcls_location');
  facilityGR.addQuery('u_available_beds', '>', 0);
  facilityGR.addNotNullQuery('u_zone');
  facilityGR.query();

  var candidates = [];
  while (facilityGR.next()) {
    var caps = (facilityGR.u_capabilities + '').toUpperCase();
    var zone = facilityGR.u_zone + '';
    var beds = parseInt(facilityGR.u_available_beds + '', 10) || 0;
    var capScore = 0;
    if (requiredCapability && caps.indexOf(requiredCapability) !== -1) capScore = 2;
    else if (caps.indexOf('GENERAL') !== -1) capScore = 1;
    var zoneScore = (zone === 'metro') ? 2 : (zone === 'northern') ? 1 : 0;
    candidates.push({ sysId: facilityGR.sys_id + '', name: facilityGR.name + '',
      beds: beds, caps: caps, zone: zone, score: capScore + zoneScore });
  }

  candidates.sort(function(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return b.beds - a.beds;
  });

  current.u_matched_facilities = JSON.stringify(candidates.slice(0, 3));

  function _getRequiredCapability(notes) {
    var n = notes.toUpperCase();
    if (n.indexOf('TRAUMA')   !== -1) return 'TRAUMA';
    if (n.indexOf('CARDIAC')  !== -1) return 'CARDIAC';
    if (n.indexOf('ICU')      !== -1) return 'ICU';
    if (n.indexOf('OB')       !== -1 || n.indexOf('OBSTETRIC') !== -1) return 'OB';
    return '';
  }
})(current, previous);
  `,
})
