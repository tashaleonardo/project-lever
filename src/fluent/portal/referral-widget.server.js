;(function () {
    var action = input ? (input.action || 'load') : 'load';

    if (action === 'load') {
        data.phase = 'intake';
        return;
    }

    if (action === 'submit_intake') {
        var priority      = (input.priority          || '') + '';
        var notes         = (input.clinical_notes    || '') + '';
        var reqFacility   = (input.requesting_facility || '') + '';

        if (!priority || !notes || !reqFacility) {
            data.error = 'Priority, clinical notes, and requesting facility are required.';
            data.phase = 'intake';
            return;
        }

        var referral = new GlideRecord('x_1996578_projec_0_regional_referral');
        referral.initialize();
        referral.setValue('priority', priority);
        referral.setValue('u_clinical_notes', notes);
        referral.setValue('u_requesting_facility', reqFacility);
        referral.setValue('status', 'new');
        referral.setValue('transport_status', 'pending');
        var referralSysId = referral.insert();

        if (!referralSysId) {
            data.error = 'Failed to create referral record. Please try again.';
            data.phase = 'intake';
            return;
        }

        // Re-read to pick up auto-triage BR output (u_matched_facilities)
        var created = new GlideRecord('x_1996578_projec_0_regional_referral');
        if (!created.get(referralSysId)) {
            data.error = 'Referral created but results could not be retrieved.';
            data.phase = 'intake';
            return;
        }

        data.referral_id = referralSysId + '';
        data.referral_number = created.getDisplayValue('number');

        var matched = created.getValue('u_matched_facilities') + '';
        var candidates = [];
        if (matched && matched !== '') {
            try { candidates = JSON.parse(matched); } catch (e) { candidates = []; }
        }

        // Fall back to live scoring if auto-triage produced nothing
        if (!candidates || candidates.length === 0) {
            candidates = _scoreFacilities(notes);
        }

        data.facilities = candidates.slice(0, 3);
        data.phase = 'select';
        return;
    }

    if (action === 'select_facility') {
        var refId      = (input.referral_id  || '') + '';
        var facilityId = (input.facility_id  || '') + '';

        if (!refId || !facilityId) {
            data.error = 'Missing referral or facility selection.';
            data.phase = 'select';
            return;
        }

        var ref = new GlideRecord('x_1996578_projec_0_regional_referral');
        if (!ref.get(refId)) {
            data.error = 'Referral record not found.';
            data.phase = 'select';
            return;
        }

        ref.setValue('u_destination_facility', facilityId);
        ref.setValue('status', 'selected');
        ref.update();

        data.referral_number = ref.getDisplayValue('number');
        data.phase = 'done';
        return;
    }

    // --- helpers ---

    function _scoreFacilities(notes) {
        var n = (notes + '').toUpperCase();
        var required = '';
        if      (n.indexOf('TRAUMA')    !== -1)                          required = 'TRAUMA';
        else if (n.indexOf('CARDIAC')   !== -1)                          required = 'CARDIAC';
        else if (n.indexOf('ICU')       !== -1)                          required = 'ICU';
        else if (n.indexOf('OB')        !== -1 || n.indexOf('OBSTETRIC') !== -1) required = 'OB';

        var gr = new GlideRecord('sn_hcls_location');
        gr.addQuery('u_available_beds', '>', 0);
        gr.addNotNullQuery('u_zone');
        gr.query();

        var results = [];
        while (gr.next()) {
            var caps  = (gr.u_capabilities  + '').toUpperCase();
            var zone  =  gr.u_zone          + '';
            var beds  = parseInt(gr.u_available_beds + '', 10) || 0;

            var capScore = 0;
            if (required && caps.indexOf(required) !== -1) capScore = 2;
            else if (caps.indexOf('GENERAL') !== -1)       capScore = 1;

            var zoneScore = zone === 'metro' ? 2 : zone === 'northern' ? 1 : 0;

            results.push({
                sysId: gr.sys_id + '',
                name:  gr.name   + '',
                beds:  beds,
                zone:  zone,
                score: capScore + zoneScore,
            });
        }

        results.sort(function (a, b) {
            if (b.score !== a.score) return b.score - a.score;
            return b.beds - a.beds;
        });

        return results.slice(0, 3);
    }
})();
