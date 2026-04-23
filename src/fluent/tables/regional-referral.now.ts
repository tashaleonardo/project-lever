import {
    Table,
    StringColumn,
    MultiLineTextColumn,
    ChoiceColumn,
    BooleanColumn,
    ReferenceColumn,
} from '@servicenow/sdk/core'

export const x_1996578_projec_0_regional_referral = Table({
    name: 'x_1996578_projec_0_regional_referral',
    label: 'Regional Referral',
    schema: {
        priority: ChoiceColumn({
            label: 'Patient Priority',
            mandatory: true,
            dropdown: 'dropdown_without_none',
            choices: {
                '1': { label: 'Priority 1 — Critical' },
                '2': { label: 'Priority 2 — Urgent' },
                '3': { label: 'Priority 3 — Non-urgent' },
            },
        }),

        u_clinical_notes: MultiLineTextColumn({
            label: 'Clinical Notes',
            maxLength: 4000,
        }),

        u_requesting_facility: ReferenceColumn({
            label: 'Requesting Facility',
            mandatory: true,
            referenceTable: 'sn_hcls_location',
        }),

        u_destination_facility: ReferenceColumn({
            label: 'Destination Facility',
            referenceTable: 'sn_hcls_location',
        }),

        transport_status: ChoiceColumn({
            label: 'Transport Status',
            default: 'pending',
            dropdown: 'dropdown_without_none',
            choices: {
                pending: { label: 'Pending' },
                dispatched: { label: 'Dispatched' },
                in_transit: { label: 'In Transit' },
                arrived: { label: 'Arrived' },
            },
        }),

        status: ChoiceColumn({
            label: 'Status',
            default: 'new',
            dropdown: 'dropdown_without_none',
            choices: {
                new: { label: 'New' },
                selected: { label: 'Selected' },
                approved: { label: 'Approved' },
                dispatched: { label: 'Dispatched' },
                in_transit: { label: 'In Transit' },
                arrived: { label: 'Arrived' },
                closed: { label: 'Closed' },
            },
        }),

        u_ai_clinical_summary: MultiLineTextColumn({
            label: 'AI Clinical Summary',
            maxLength: 4000,
            readOnly: true,
        }),

        u_ai_summary_source: ChoiceColumn({
            label: 'AI Summary Source',
            default: 'gemini',
            dropdown: 'dropdown_without_none',
            choices: {
                gemini: { label: 'Gemini' },
                groq: { label: 'Groq' },
                mock: { label: 'Local Fallback' },
                none: { label: 'None' },
            },
        }),

        u_handoff_confirmed: BooleanColumn({
            label: 'Hand-off Confirmed',
            default: false,
        }),

        u_bed_assignment: StringColumn({
            label: 'Bed Assignment',
            maxLength: 40,
        }),

        u_ambulance_id: StringColumn({
            label: 'Ambulance ID',
            maxLength: 40,
        }),

        u_matched_facilities: StringColumn({
            label: 'Matched Facilities',
            maxLength: 1000,
            default: '',
        }),
    },
})