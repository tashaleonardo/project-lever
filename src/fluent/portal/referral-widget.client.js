// @ts-nocheck
function controller() {
    var c = this;

    // Initialise from server bootstrap data
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

    // ── Phase helpers ────────────────────────────────────────────────────────

    c.selectFacility = function (facility) {
        c.selected_facility = facility;
    };

    c.submitAnother = function () {
        c.phase             = 'intake';
        c.error             = '';
        c.p1NotesError      = '';
        c.facilities        = [];
        c.referral_number   = '';
        c.selected_facility = null;
        c.data.referral_id  = '';
        c.form = { priority: '', clinical_notes: '', requesting_facility: '' };
    };

    // ── Server calls ─────────────────────────────────────────────────────────
    // Uses c.server.update() — the reliable SP widget server call pattern.
    // Stamps action + payload onto c.data; the framework serialises c.data
    // as `input` on the server side.

    c.submitIntake = function () {
        c.error        = '';
        c.p1NotesError = '';

        if (!c.form.priority || !c.form.clinical_notes.trim() || !c.form.requesting_facility.trim()) {
            c.error = 'All fields are required.';
            return;
        }

        // Mirror TASK-17 onSubmit: Priority 1 requires ≥ 20-char notes
        if (c.form.priority === '1' && c.form.clinical_notes.trim().length < 20) {
            c.p1NotesError = 'PRIORITY 1 — Clinical Notes must be at least 20 characters.';
            return;
        }

        c.data.action              = 'submit_intake';
        c.data.priority            = c.form.priority;
        c.data.clinical_notes      = c.form.clinical_notes;
        c.data.requesting_facility = c.form.requesting_facility;

        c.server.update().then(function () {
            c.phase             = c.data.phase;
            c.error             = c.data.error      || '';
            c.facilities        = c.data.facilities || [];
            c.referral_number   = c.data.referral_number || '';
            c.selected_facility = null;
        });
    };

    c.confirmSelection = function () {
        if (!c.selected_facility) return;
        c.error = '';

        c.data.action      = 'select_facility';
        // referral_id already on c.data from the submit_intake server response
        c.data.facility_id = c.selected_facility.sysId;

        c.server.update().then(function () {
            c.phase           = c.data.phase;
            c.error           = c.data.error || '';
            c.referral_number = c.data.referral_number || '';
        });
    };
}
