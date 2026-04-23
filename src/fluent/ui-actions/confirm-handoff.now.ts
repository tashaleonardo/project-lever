import { UiAction } from '@servicenow/sdk/core'

UiAction({
    $id: Now.ID['confirm_handoff_ua'],
    name: 'Confirm Hand-off & Admit',
    table: 'x_1996578_projec_0_regional_referral',
    active: true,
    roles: ['sn_hcls.doctor'],
    condition: "current.status == 'arrived' && gs.hasRole('sn_hcls.doctor')",
    form: { showButton: true, style: 'primary' },
    showInsert: false,
    showUpdate: true,
    order: 100,

    client: {
        isClient: true,
        onClick: `
var bedId = prompt('Enter bed assignment for this patient (e.g. ICU-Bed 4):');
if (bedId === null) {
    return false;
}
bedId = bedId.trim();
if (bedId === '') {
    alert('Bed assignment is required to complete hand-off. Please enter a bed identifier.');
    return false;
}
g_form.setValue('u_bed_assignment', bedId);
gsftSubmit(null, this);
`,
    },

    // Runs server-side after gsftSubmit(). u_bed_assignment is already on current
    // from the submitted form value set by the client onClick above.
    // Setting u_handoff_confirmed = true is the sole trigger for TASK-09 Decrement Beds BR.
    script: `
current.setValue('u_handoff_confirmed', true);
current.setValue('status', 'closed');
current.update();
`,
})