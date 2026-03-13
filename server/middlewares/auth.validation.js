let joi = require('joi');

const signupvalidation = (req, res, next) => {
    const manufacturerDetailsSchema = joi.object({
        companyName: joi.string().required(),
        drugLicenseNo: joi.string().required(),
        cdscoApprovalNo: joi.string().required(),
        gstNumber: joi.string().required(),
        fullName: joi.string().required(),
        phone: joi.string().required(),
    });

    const distributorDetailsSchema = joi.object({
        companyName: joi.string().required(),
        drugLicenseNo: joi.string().required(),
        gstNumber: joi.string().required(),
        stateOfOperation: joi.string().required(),
        warehouseAddress: joi.string().required(),
        fullName: joi.string().required(),
        phone: joi.string().required(),
    });

    const patientDetailsSchema = joi.object({
        fullName: joi.string().required(),
        phone: joi.string().required(),
        city: joi.string().required(),
        aadharNumber: joi.string().allow('', null).optional(),
    });

    let signupSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).max(30).required(),
        role: joi.string().valid('MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'PATIENT').required(),
        walletAddress: joi.string().optional(),
        manufacturerDetails: joi.when('role', {
            is: 'MANUFACTURER',
            then: manufacturerDetailsSchema.required(),
            otherwise: joi.forbidden(),
        }),
        distributorDetails: joi.when('role', {
            is: 'DISTRIBUTOR',
            then: distributorDetailsSchema.required(),
            otherwise: joi.forbidden(),
        }),
        patientDetails: joi.when('role', {
            is: joi.valid('PATIENT', 'PHARMACY'),
            then: patientDetailsSchema.required(),
            otherwise: joi.forbidden(),
        }),
    });
    const error = signupSchema.validate(req.body, { abortEarly: true, allowUnknown: false }).error;
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    };
    next();
};

const loginvalidation = (req, res, next) => {
    let loginSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).max(30).required() // Changed from pattern
    });
    const error = loginSchema.validate(req.body).error;
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    };
    next();
};

module.exports = {
    signupvalidation,
    loginvalidation
}
