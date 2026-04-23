import { EmailNotification } from '@servicenow/sdk/core'

EmailNotification({
    $id: Now.ID['ems_dispatch_alert'],
    name: 'LEVER — EMS Dispatch Alert',
    table: 'x_1996578_projec_0_regional_referral',
    active: true,
    description: 'Fires on lever.dispatch.triggered. Notifies sn_hcls.transport role that a patient transfer requires immediate dispatch.',
    triggerConditions: {
        generationType: 'event',
        eventName: 'lever.dispatch.triggered',
        affectedFieldOnEvent: 'parm1',
        item: 'event.parm1',
        itemTable: 'x_1996578_projec_0_regional_referral',
    },
    recipientDetails: {
        sendToCreator: false,
        // After install: add sn_hcls.transport role under Who Will Receive in the notification UI.
    },
    emailContent: {
        subject: 'DISPATCH: Patient transfer requires EMS — ${record.getDisplayValue("u_destination_facility")}',
        messageHtml: `
<p><strong>PROJECT LEVER — EMS Dispatch Alert</strong></p>
<table>
  <tr><td><strong>Priority</strong></td><td>${"${record.getValue('priority')}"} — ${"${record.getDisplayValue('priority')}"}</td></tr>
  <tr><td><strong>Destination</strong></td><td>${"${record.getDisplayValue('u_destination_facility')}"}</td></tr>
  <tr><td><strong>Requesting Facility</strong></td><td>${"${record.getDisplayValue('u_requesting_facility')}"}</td></tr>
  <tr><td><strong>Clinical Summary</strong></td><td>${"${record.getValue('u_clinical_notes')}"}</td></tr>
</table>
<br/>
<p>Acknowledge dispatch and confirm arrival using the record link below.</p>
<p><a href="${"${URI_REF}"}">Open Referral Record</a></p>
`,
    },
})

EmailNotification({
    $id: Now.ID['arrival_prep_alert'],
    name: 'LEVER — Arrival Prep Alert',
    table: 'x_1996578_projec_0_regional_referral',
    active: true,
    description: 'Fires when transport_status changes to in_transit. Notifies destination clinician and manager to prepare the receiving bay.',
    triggerConditions: {
        generationType: 'engine',
        onRecordUpdate: true,
        advancedCondition: "current.transport_status == 'in_transit' && previous.transport_status != 'in_transit'",
    },
    recipientDetails: {
        sendToCreator: false,
        // After install: add sn_hcls.doctor and sn_hcls.manager roles under Who Will Receive,
        // filtered to the destination facility, in the notification UI.
    },
    emailContent: {
        subject: 'ARRIVAL PREP: Patient en route to your facility — ETA imminent',
        messageHtml: `
<p><strong>PROJECT LEVER — Arrival Prep Alert</strong></p>
<p>A patient is now in transit and will arrive shortly. Please prepare the receiving bay.</p>
<table>
  <tr><td><strong>Priority</strong></td><td>${"${record.getValue('priority')}"} — ${"${record.getDisplayValue('priority')}"}</td></tr>
  <tr><td><strong>Your Facility</strong></td><td>${"${record.getDisplayValue('u_destination_facility')}"}</td></tr>
  <tr><td><strong>Assigned Bed</strong></td><td>${"${record.getValue('u_bed_assignment')}"}</td></tr>
  <tr><td><strong>Originating Facility</strong></td><td>${"${record.getDisplayValue('u_requesting_facility')}"}</td></tr>
  <tr><td><strong>Clinical Notes</strong></td><td>${"${record.getValue('u_clinical_notes')}"}</td></tr>
</table>
<br/>
<p>Ambulance is en route. Confirm hand-off when patient arrives using the link below.</p>
<p><a href="${"${URI_REF}"}">Open Referral Record</a></p>
`,
    },
})