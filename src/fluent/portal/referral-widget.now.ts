import { SPWidget, SPPage, ServicePortal } from '@servicenow/sdk/core'

const referralWidget = SPWidget({
    $id: Now.ID['lever_referral_widget'],
    name: 'LEVER — Patient Referral Intake',
    id: 'lever-referral-intake',
    description: 'Three-phase intake widget: submit referral, select destination facility, view confirmation.',
    roles: ['sn_hcls.doctor'],
    public: false,
    serverScript: Now.include('./referral-widget.server.js'),
    clientScript: `
api.controller = function($scope) {
    var c = this;

    c.phase             = c.data.phase      || 'intake';
    c.error             = c.data.error      || '';
    c.p1NotesError      = '';
    c.facilities        = c.data.facilities || [];
    c.referral_number   = c.data.referral_number || '';
    c.selected_facility = null;

    c.form = {
        priority:            '',
        clinical_notes:      '',
        requesting_facility: '',
    };

    c.selectFacility = function(facility) {
        c.selected_facility = facility;
    };

    c.submitAnother = function() {
        c.phase             = 'intake';
        c.error             = '';
        c.p1NotesError      = '';
        c.facilities        = [];
        c.referral_number   = '';
        c.selected_facility = null;
        c.data.referral_id  = '';
        c.form = { priority: '', clinical_notes: '', requesting_facility: '' };
    };

    c.submitIntake = function() {
        c.error        = '';
        c.p1NotesError = '';
        if (!c.form.priority || !c.form.clinical_notes.trim() || !c.form.requesting_facility.trim()) {
            c.error = 'All fields are required.';
            return;
        }
        if (c.form.priority === '1' && c.form.clinical_notes.trim().length < 20) {
            c.p1NotesError = 'PRIORITY 1 — Clinical Notes must be at least 20 characters.';
            return;
        }
        c.data.action              = 'submit_intake';
        c.data.priority            = c.form.priority;
        c.data.clinical_notes      = c.form.clinical_notes;
        c.data.requesting_facility = c.form.requesting_facility;
        c.server.update().then(function() {
            c.phase             = c.data.phase;
            c.error             = c.data.error      || '';
            c.facilities        = c.data.facilities || [];
            c.referral_number   = c.data.referral_number || '';
            c.selected_facility = null;
        });
    };

    c.confirmSelection = function() {
        if (!c.selected_facility) return;
        c.error            = '';
        c.data.action      = 'select_facility';
        c.data.facility_id = c.selected_facility.sysId;
        c.server.update().then(function() {
            c.phase           = c.data.phase;
            c.error           = c.data.error || '';
            c.referral_number = c.data.referral_number || '';
        });
    };
};
`,
    htmlTemplate: Now.include('./referral-widget.html'),
    customCss: Now.include('./referral-widget.scss'),
    hasPreview: false,
})

const referralPage = SPPage({
    title: 'Patient Referral',
    pageId: 'referral',
    shortDescription: 'LEVER patient referral intake and destination facility selection',
    roles: ['sn_hcls.doctor'],
    public: false,
    containers: [
        {
            $id: Now.ID['lever_referral_container'],
            order: 100,
            rows: [
                {
                    $id: Now.ID['lever_referral_row'],
                    order: 100,
                    columns: [
                        {
                            $id: Now.ID['lever_referral_col'],
                            size: 12,
                            order: 100,
                            instances: [
                                {
                                    $id: Now.ID['lever_referral_instance'],
                                    widget: referralWidget,
                                    order: 100,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})

ServicePortal({
    $id: Now.ID['lever_portal'],
    title: 'LEVER — Patient Navigation',
    urlSuffix: 'referral',
    homePage: referralPage,
})