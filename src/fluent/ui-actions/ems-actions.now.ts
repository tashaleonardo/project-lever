import { UiAction } from '@servicenow/sdk/core'

UiAction({
    $id: Now.ID['acknowledge_dispatch_ua'],
    name: 'Acknowledge Dispatch',
    table: 'x_1996578_projec_0_regional_referral',
    active: true,
    roles: ['sn_hcls.transport'],
    condition: "current.status == 'dispatched' && gs.hasRole('sn_hcls.transport')",
    form: { showButton: true, style: 'primary' },
    showInsert: false,
    showUpdate: true,
    order: 100,
    script: `
current.setValue('status', 'in_transit');
current.setValue('transport_status', 'in_transit');
current.update();
gs.eventQueue('lever.arrival.prep', current, current.getUniqueValue(), '');
`,
})

UiAction({
    $id: Now.ID['confirm_arrival_ua'],
    name: 'Confirm Arrival',
    table: 'x_1996578_projec_0_regional_referral',
    active: true,
    roles: ['sn_hcls.transport'],
    condition: "current.status == 'in_transit' && gs.hasRole('sn_hcls.transport')",
    form: { showButton: true, style: 'primary' },
    showInsert: false,
    showUpdate: true,
    order: 100,
    script: `
current.setValue('status', 'arrived');
current.setValue('transport_status', 'arrived');
current.update();
`,
})