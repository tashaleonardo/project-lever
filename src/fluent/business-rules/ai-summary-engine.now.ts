import { BusinessRule } from '@servicenow/sdk/core'

BusinessRule({
    $id: Now.ID['ai_summary_engine_br'],
    name: 'LEVER - AI Clinical Summary Engine',
    table: 'x_1996578_projec_0_regional_referral',
    active: true,
    when: 'async',
    action: ['insert', 'update'],
    condition: "(current.u_clinical_notes.changes() || current.u_ai_summary_source.changes()) && current.u_ai_summary_source != 'none'",
    order: 100,
    description: 'Calls Gemini or Groq REST Messages to summarize clinical notes asynchronously.',
    script: `
(function executeRule(current, previous /*null when async*/) {
    var source = current.getValue('u_ai_summary_source');
    var notes = current.getValue('u_clinical_notes');
    
    if (!notes) return;

    if (source === 'mock') {
        current.setValue('u_ai_clinical_summary', 'MOCK SUMMARY: Patient requires immediate attention. ' + notes.substring(0, 50) + '...');
        current.update();
        return;
    }

    try {
        var restMessageName = source === 'groq' ? 'Groq Triage Engine' : 'Gemini Triage Engine';
        
        var rm = new sn_ws.RESTMessageV2(restMessageName, 'Generate Summary'); 
        
        // Prepend a strong instruction to the notes so the AI knows exactly what to do
        var promptText = "You are a clinical AI. Please summarize the following patient notes for an emergency hand-off:\\n\\n" + notes;
        
        // Escaping safely to prevent JSON payload breakage
        var safeNotes = JSON.stringify(promptText).slice(1, -1);
        rm.setStringParameterNoEscape('doctor_notes', safeNotes);
        
        // Set a 15-second timeout so the Async worker doesn't hang if the LLM API is slow
        rm.setHttpTimeout(15000);
        
        // Log to System Logs so we can verify the script grabbed the notes successfully
        gs.info('LEVER AI Engine triggered for ' + source + '. Notes length being sent: ' + notes.length);

        var response = rm.execute();
        var responseBody = response.getBody();
        var httpStatus = response.getStatusCode();
        
        if (httpStatus === 200) {
            var parsed = JSON.parse(responseBody);
            
            // NOTE: Adjust the JSON path based on the actual raw response from the LLMs!
            var summary = source === 'groq' ? parsed.choices[0].message.content : parsed.candidates[0].content.parts[0].text;
            
            current.setValue('u_ai_clinical_summary', summary);
            current.update();
        } else {
            gs.error('LEVER AI Engine Error (' + source + '): ' + httpStatus + ' - ' + responseBody);
        }
    } catch(ex) {
        gs.error('LEVER AI Engine Exception: ' + ex.message);
    }
})(current, previous);
`
})
