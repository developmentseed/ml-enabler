'use strict';
const Mailgen = require('mailgen');
const { Err } = require('@openaddresses/batch-schema');
const AWS = require('aws-sdk');

/**
 * @class
 *
 * @prop {Config} config Serverwide Config
 * @prop {Object} mailGenerator MailGen Generation API
 */
class Email {
    constructor(config) {
        this.config = config;
        this.ses = new AWS.SES({
            region: process.env.AWS_DEFAULT_REGION
        });

        this.mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                name: 'ML Enabler',
                link: config.url
            }
        });
    }

    /**
     * Send an email verification to the user
     *
     * @param {Object} user
     * @param {String} user.username
     * @param {String} user.email
     * @param {String} user.token
     */
    async verify(user) {
        const email = {
            body: {
                name: user.email,
                intro: 'ML-Enabler Email Confirmation',
                action: {
                    instructions: `Hello ${user.username}, to finish creating your account, please click here:`,
                    button: {
                        color: 'green',
                        text: 'Verify Email',
                        link: `${this.config.url}/#/login/verify?token=${user.token}`
                    }
                },
                outro: ''
            }
        };

        try {
            return await this.send(user.email, 'ML-Enabler Email Verification', this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err, 'Internal User Confirmation Error');
        }
    }

    async forgot(user) {
        const email = {
            body: {
                name: user.email,
                intro: 'ML-Enabler Password Reset',
                action: {
                    instructions: `Hello ${user.username}, to reset your password, please click here:`,
                    button: {
                        color: 'green',
                        text: 'Password Reset',
                        link: `${this.config.url}/#/login/reset?token=${user.token}`
                    }
                },
                outro: ''
            }
        };

        try {
            return await this.send(user.email, 'ML-Enabler Password Reset', this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err, 'Internal User Forgot Error');
        }
    }

    /**
     * Send an email via the AWS SES Service
     * Note: All emails are sent from robot@<domain>
     *
     * @param {string} email email recipient
     * @param {string} subject email subject
     * @param {string} body HTML body to send
     */
    async send(email, subject, body) {
        return await this.ses.sendEmail({
            Destination: {
                ToAddresses: [email]
            },
            Source: `robot@${this.config.domain}`,
            Message: {
                Subject: {
                    Data: subject
                },
                Body: {
                    Html: {
                        Data: body
                    }
                }
            }
        }).promise();
    }
}

module.exports = Email;
