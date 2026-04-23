import { Acl } from '@servicenow/sdk/core'

// Read ACLs
Acl({
    $id: Now.ID['referral_read_doctor_acl'],
    type: 'record',
    table: 'x_1996578_projec_0_regional_referral',
    operation: 'read',
    active: true,
    roles: ['sn_hcls.doctor'],
})

Acl({
    $id: Now.ID['referral_read_manager_acl'],
    type: 'record',
    table: 'x_1996578_projec_0_regional_referral',
    operation: 'read',
    active: true,
    roles: ['sn_hcls.manager'],
})

Acl({
    $id: Now.ID['referral_read_transport_acl'],
    type: 'record',
    table: 'x_1996578_projec_0_regional_referral',
    operation: 'read',
    active: true,
    roles: ['sn_hcls.transport'],
})

// Write ACLs
Acl({
    $id: Now.ID['referral_write_doctor_acl'],
    type: 'record',
    table: 'x_1996578_projec_0_regional_referral',
    operation: 'write',
    active: true,
    roles: ['sn_hcls.doctor'],
})

Acl({
    $id: Now.ID['referral_write_manager_acl'],
    type: 'record',
    table: 'x_1996578_projec_0_regional_referral',
    operation: 'write',
    active: true,
    roles: ['sn_hcls.manager'],
})

Acl({
    $id: Now.ID['referral_write_transport_acl'],
    type: 'record',
    table: 'x_1996578_projec_0_regional_referral',
    operation: 'write',
    active: true,
    roles: ['sn_hcls.transport'],
})

// Create ACL
Acl({
    $id: Now.ID['referral_create_doctor_acl'],
    type: 'record',
    table: 'x_1996578_projec_0_regional_referral',
    operation: 'create',
    active: true,
    roles: ['sn_hcls.doctor'],
})