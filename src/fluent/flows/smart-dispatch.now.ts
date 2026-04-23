import { ScriptAction } from '@servicenow/sdk/core'

ScriptAction({
    $id: Now.ID['smart_dispatch_sa'],
    name: 'Smart Matching - Dispatch on Readiness Confirmed',
    eventName: 'lever.dispatch.triggered',
    active: true,
    order: 100,
    description: 'Fires on lever.dispatch.triggered. Reads referral sys_id from event.parm1, sets status and transport_status to dispatched. EMS Dispatch Alert fires reactively on the status change.',
    script: `
var referralId = event.parm1 + '';
if (!referralId) {
    gs.warn('LEVER smart_dispatch: lever.dispatch.triggered received with no referral sys_id in parm1');
    return;
}

var referral = new GlideRecord('x_1996578_projec_0_regional_referral');
if (!referral.get(referralId)) {
    gs.warn('LEVER smart_dispatch: referral record not found for sys_id ' + referralId);
    return;
}

referral.setValue('status', 'dispatched');
referral.setValue('transport_status', 'dispatched');
referral.update();
`,
})