"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceTemplateVariables = exports.fetchAndProcessEmailTemplate = exports.prepareEmailTemplate = exports.emailWithNodemailerSmtp = exports.emailWithNodemailerService = exports.emailWithSendgrid = exports.sendEmailWithProvider = void 0;
/* eslint-disable prettier-vue/prettier */
const mail_1 = __importDefault(require("@sendgrid/mail"));
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../logger");
const index_1 = require("./index");
const prisma_1 = __importDefault(require("./prisma"));
const logger = (0, logger_1.createLogger)('Mailer Util');
const rootPath = `${process.cwd()}/.app`;
const APP_EMAILER = process.env.APP_EMAILER || 'nodemailer-service';
const APP_NODEMAILER_SERVICE = process.env.APP_NODEMAILER_SERVICE || '';
const APP_NODEMAILER_SERVICE_SENDER = process.env.APP_NODEMAILER_SERVICE_SENDER || '';
const APP_NODEMAILER_SERVICE_PASSWORD = process.env.APP_NODEMAILER_SERVICE_PASSWORD || '';
const APP_NODEMAILER_SMTP_SENDER = process.env.APP_NODEMAILER_SMTP_SENDER || '';
const APP_NODEMAILER_SMTP_PASSWORD = process.env.APP_NODEMAILER_SMTP_PASSWORD || '';
const APP_NODEMAILER_SMTP_HOST = process.env.APP_NODEMAILER_SMTP_HOST || 'smtp.gmail.com';
const APP_NODEMAILER_SMTP_PORT = process.env.APP_NODEMAILER_SMTP_PORT || '465';
const APP_NODEMAILER_SMTP_ENCRYPTION = process.env.APP_NODEMAILER_SMTP_ENCRYPTION || 'ssl';
const APP_SENDGRID_API_KEY = process.env.APP_SENDGRID_API_KEY || '';
const APP_SENDGRID_SENDER = process.env.APP_SENDGRID_SENDER || '';
const APP_PUBLIC_URL = process.env.APP_PUBLIC_URL || '';
const APP_PUBLIC_SITE_NAME = process.env.APP_PUBLIC_SITE_NAME || '';
const APP_SENDMAIL_PATH = process.env.APP_SENDMAIL_PATH || '/usr/sbin/sendmail';
async function sendEmailWithProvider(provider, options) {
    try {
        switch (provider) {
            case 'local':
                return await emailWithLocalSMTP(options);
            case 'nodemailer-service':
                options.from = APP_NODEMAILER_SERVICE_SENDER;
                return await emailWithNodemailerService(APP_NODEMAILER_SERVICE_SENDER, APP_NODEMAILER_SERVICE_PASSWORD, APP_NODEMAILER_SERVICE, options);
            case 'nodemailer-smtp':
                options.from = APP_NODEMAILER_SMTP_SENDER;
                return await emailWithNodemailerSmtp(APP_NODEMAILER_SMTP_SENDER, APP_NODEMAILER_SMTP_PASSWORD, APP_NODEMAILER_SMTP_HOST, APP_NODEMAILER_SMTP_PORT, APP_NODEMAILER_SMTP_ENCRYPTION === 'ssl', options);
            case 'nodemailer-sendgrid':
                options.from = APP_SENDGRID_SENDER;
                return await emailWithSendgrid(options);
            default:
                throw new Error('Unsupported email provider');
        }
    }
    catch (error) {
        logger.error(`Primary email sending method failed: ${error}`);
        // Fallback to local SMTP, but only if 'local' was not the primary method
        if (provider !== 'local') {
            try {
                return await emailWithLocalSMTP(options);
            }
            catch (fallbackError) {
                logger.error(`Fallback to local SMTP failed: ${fallbackError}`);
                throw fallbackError; // Rethrow the error
            }
        }
        else {
            throw error; // Rethrow the original error if local SMTP was the primary method
        }
    }
}
exports.sendEmailWithProvider = sendEmailWithProvider;
/**
 * Sends email using the local Sendmail program.
 * @param {EmailOptions} options Email options including to, from, subject, etc.
 * @returns {Promise<Error | true>} A promise resolving to true if successful, or an error if failed.
 */
async function emailWithLocalSMTP(options) {
    try {
        const transporterOptions = {
            sendmail: true,
            newline: 'unix',
            path: APP_SENDMAIL_PATH,
        };
        // Check if DKIM is available in .env
        const APP_NODEMAILER_DKIM_PRIVATE_KEY = process.env.APP_NODEMAILER_DKIM_PRIVATE_KEY || '';
        const APP_NODEMAILER_DKIM_DOMAIN = process.env.APP_NODEMAILER_DKIM_DOMAIN || '';
        const APP_NODEMAILER_DKIM_SELECTOR = process.env.APP_NODEMAILER_DKIM_SELECTOR || 'default';
        if (APP_NODEMAILER_DKIM_PRIVATE_KEY &&
            APP_NODEMAILER_DKIM_DOMAIN &&
            APP_NODEMAILER_DKIM_SELECTOR) {
            transporterOptions.dkim = {
                privateKey: fs_1.default.readFileSync(APP_NODEMAILER_DKIM_PRIVATE_KEY, 'utf8'),
                domainName: APP_NODEMAILER_DKIM_DOMAIN,
                keySelector: APP_NODEMAILER_DKIM_SELECTOR,
            };
        }
        const transporter = nodemailer_1.default.createTransport(transporterOptions);
        const mailOptions = {
            from: options.from,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        };
        await transporter.sendMail(mailOptions);
        return true;
    }
    catch (error) {
        logger.error(`Error when sending email using local SMTP: ${error}`);
        return new Error(`Failed to send email: ${error.message}`);
    }
}
/**
 * @desc Sends email with Sendgrid
 * @param options Email message options like to, from etc.
 * @returns {Promise<Error | true>}
 */
async function emailWithSendgrid(options) {
    const apiKey = APP_SENDGRID_API_KEY;
    let emailError = null;
    // If Sendgrid api key not found
    if (!apiKey) {
        logger.error('Sendgrid Api key not found. Cannot send email. Aborting.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Attempting to send mail with Sendgrid
    mail_1.default.setApiKey(apiKey);
    // Create messag object
    const msg = {
        to: options.to,
        from: options.from,
        subject: options.subject,
        html: options.html ? options.html : options.text,
    };
    await mail_1.default.send(msg).catch((error) => {
        logger.error(`Error when sending email in Sendgrid: ${error}`);
        emailError = error;
    });
    // If error, return error
    if (emailError) {
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // If successful
    return true;
}
exports.emailWithSendgrid = emailWithSendgrid;
/**
 *@desc Sends email using Nodemailer service (e.g. hotmail)
 * @param sender Sender's email address
 * @param password Sender's password
 * @param service Sender's service such as hotmail
 * @param options Options for email such as to, from, subject etc.
 * @returns
 */
async function emailWithNodemailerService(sender, password, service, options) {
    // Error flag
    let errorFound = null;
    const emailOptions = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };
    if (!service) {
        logger.error('Error: Email service not specified. Aborting email send.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Check for email user
    if (!sender) {
        logger.error('Error: Email user not specified. Aborting email send.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Check for password
    if (!password) {
        logger.error('Error: Email password not specified. Aborting email send.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Create transporter
    const transporter = nodemailer_1.default.createTransport({
        service: service,
        auth: {
            user: sender,
            pass: password,
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
        },
    });
    // Check if email server is ready to take our messages
    transporter.verify(function (error, success) {
        if (error) {
            logger.error(`Error when verifying email server: ${error}`);
            errorFound = error;
        }
    });
    // If transporter verify error, return
    if (errorFound)
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    // Attempt to send email
    transporter.sendMail(emailOptions, (err, result) => {
        // If error, log error and return
        if (err) {
            logger.error(`Error when sending email: ${err}`);
            errorFound = err;
        }
    });
    // If errorFound, return error
    if (errorFound)
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    // Otherwise successful
    return true;
}
exports.emailWithNodemailerService = emailWithNodemailerService;
/**
 * @desc Sends email using Nodemailer SMTP
 * @param sender Sender's email address
 * @param password Sender's password
 * @param host Email server host
 * @param port Email server port
 * @param options Options for email such as to, from, subject etc.
 * @returns
 */
async function emailWithNodemailerSmtp(sender, password, host, port, smtpEncryption, options) {
    // Error flag
    let errorFound = null;
    const emailOptions = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };
    // Sending email using nodemailer-service
    if (!host) {
        logger.error('Error: Email host not specified. Aborting email send.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Check for email user
    if (!sender) {
        logger.error('Error: Email user not specified. Aborting email send.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Check for password
    if (!sender) {
        logger.error('Error: Email password not specified. Aborting email send.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Create transporter
    const transporter = nodemailer_1.default.createTransport({
        host: host,
        port: port,
        pool: true,
        secure: false,
        auth: {
            user: sender,
            pass: password,
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
        },
    });
    // Check if email server is ready to take our messages
    transporter.verify(function (error, success) {
        if (error) {
            logger.error(`Error when verifying email server: ${error}`);
            errorFound = error;
        }
    });
    // If transporter verify error, return
    if (errorFound)
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    // Attempt to send email
    transporter.sendMail(emailOptions, (err, result) => {
        // If error, log error and return
        if (err) {
            logger.error(`Error when sending email: ${err}`);
            errorFound = err;
        }
    });
    // If errorFound, return error
    if (errorFound)
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    // Otherwise successful
    return true;
}
exports.emailWithNodemailerSmtp = emailWithNodemailerSmtp;
// Function to prepare the email template
async function prepareEmailTemplate(processedTemplate, processedSubject) {
    const generalTemplate = fs_1.default.readFileSync(`${rootPath}/data/emails/generalTemplate.html`, 'utf-8');
    if (!generalTemplate) {
        logger.error('General email template not found');
        throw (0, index_1.createError)({
            statusCode: 500,
            statusMessage: 'General email template not found',
        });
    }
    // Fetching both 'full_logo' and 'site_name' in a single query
    const settings = await prisma_1.default.settings.findMany({
        where: {
            key: {
                in: ['full_logo', 'site_name'],
            },
        },
    });
    // Convert the settings array to an object for easier access
    const settingsObj = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
    // Define values to replace placeholders in the email template
    const replacements = {
        '%SITE_URL%': APP_PUBLIC_URL,
        '%HEADER%': settingsObj['full_logo']
            ? `<img src="${APP_PUBLIC_URL}${settingsObj['full_logo']}" style="max-height:96px;" />`
            : `<h1>${settingsObj['site_name'] || APP_PUBLIC_SITE_NAME || 'Bicrypto'}</h1>`,
        '%MESSAGE%': processedTemplate,
        '%SUBJECT%': processedSubject,
        '%FOOTER%': settingsObj['site_name'] || APP_PUBLIC_SITE_NAME || 'Bicrypto',
    };
    return Object.entries(replacements).reduce((acc, [key, value]) => replaceAllOccurrences(acc, key, value), generalTemplate);
}
exports.prepareEmailTemplate = prepareEmailTemplate;
async function fetchAndProcessEmailTemplate(specificVariables, templateName) {
    const templateRecord = await prisma_1.default.notification_templates.findUnique({
        where: { name: templateName },
    });
    if (!templateRecord || !templateRecord.email || !templateRecord.email_body) {
        logger.error('Email template not found or email not enabled');
        throw (0, index_1.createError)({
            statusCode: 404,
            statusMessage: 'Email template not found or email not enabled',
        });
    }
    const basicVariables = {
        URL: APP_PUBLIC_URL,
    };
    const variables = {
        ...basicVariables,
        ...specificVariables,
    };
    // Process the email body
    const processedTemplate = replaceTemplateVariables(templateRecord.email_body, variables);
    // Process the email subject
    const processedSubject = replaceTemplateVariables(templateRecord.subject, variables);
    return { processedTemplate, processedSubject, templateRecord };
}
exports.fetchAndProcessEmailTemplate = fetchAndProcessEmailTemplate;
function replaceTemplateVariables(template, variables) {
    if (typeof template !== 'string') {
        logger.error('Template is not a string');
        return ''; // or handle this case as you see fit
    }
    return Object.entries(variables).reduce((acc, [key, value]) => {
        if (value === undefined) {
            logger.warn(`Variable ${key} is undefined`);
            return acc; // Skip replacement if value is undefined
        }
        return acc.replace(new RegExp(`%${key}%`, 'g'), String(value));
    }, template);
}
exports.replaceTemplateVariables = replaceTemplateVariables;
function replaceAllOccurrences(str, search, replace) {
    if (str == null) {
        // Checks for both null and undefined
        logger.error('Input string is null or undefined');
        return ''; // Return empty string or handle as needed
    }
    const regex = new RegExp(search, 'g');
    return str.replace(regex, replace);
}
