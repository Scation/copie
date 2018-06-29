const prompt = require('prompt');
const chalk = require('chalk');
const stripIndents = require('common-tags').stripIndents;
const dateFormat = require('dateformat');

const fse = require('fs-extra');
const path = require('path');

prompt.message = '';
prompt.delimiter = chalk.green(' >');

class ConfigManager {
    constructor(bot, base, dynamicImports) {
        this._bot = bot;
        this._base = base;

        this._configPath = path.resolve(base, './data/configs/config.json');

        this._dynamicImports = dynamicImports;
    }

    getQuestions(currentConfig, optionalConfigs) {
        const questions = {
            properties: {
                botToken: {
                    pattern: /^"?[a-zA-Z0-9_\.\-]+"?$/,
                    type: 'string',
                    message: 'Le jeton ne peut contenir que des lettres, des chiffres, des traits de soulignement et des tirets',
                    // Only require a token if one isnt already configured
                    required: !currentConfig.botToken,
                    // This will show up in the prompt as (<default hidden>)
                    default: currentConfig.botToken,
                    hidden: true,
                    replace: '*',
                    before: value => value.replace(/"/g, '')
                },
                prefix: {
                    type: 'string',
                    default: currentConfig.prefix || '//',
                    required: false
                }
            }
        };

        Object.keys(optionalConfigs).forEach(configName => {
            const config = optionalConfigs[configName];
            const question = config.getQuestion(currentConfig, configName);
            if (!question) {
                return;
            }
            question.description = (question.description || configName) + ' (Optional)';
            questions.properties[configName] = question;
        });

        return questions;
    }

    load(reconfiguring = false) {
        if (reconfiguring || !fse.existsSync(this._configPath)) {
            console.log(stripIndents`
            ${chalk.gray('--------------------------------------------------------')}
            ${chalk.gray('==============<') + chalk.yellow(' Thost ') + chalk.gray('>==============')}
            ${chalk.gray('----------------------------------------------------------')}

            ${chalk.blue('Note:')} Cliquer sur ${chalk.green('console')} juste au dessus, puis une fois dans la console, taper ${chalk.green('node bot.js')} puis entrer.

            S'il vous plait entrez votre ${chalk.yellow('token')} tapez ${chalk.blue('Entrer')} puis tapez votre ${chalk.yellow('prefix')} pour le bot, puis validez avec ${chalk.blue('Entrer')}
            \u200b
            `);

            let currentConfig = this._config || {};
            if (reconfiguring && fse.existsSync(this._configPath)) {
                currentConfig = fse.readJSONSync(this._configPath);
            }

            prompt.get(this.getQuestions(currentConfig, this._dynamicImports.optionalConfigs), (err, res) => {
                if (err) {
                    console.error(err);
                    process.exit(666);
                }

                res.blacklistedServers = res.blacklistedServers || [
                    '226865538247294976',
                    '239010380385484801'
                ];

                try {
                    fse.writeJSONSync(this._configPath, res);
                } catch (e) {
                    console.error(`Je n'écrirais pas de config pour ${this._configPath}\n${e.stack}`);
                    if (!reconfiguring) {
                        process.exit(666);
                    }
                }
                // If this is running as the configure script, then we want a non-error return code
                process.exit(reconfiguring ? 0 : 42);
            });
            return null;
        }

        this._config = fse.readJSONSync(this._configPath);

        return this._config;
    }

    _backup() {
        const backupPath = `${this._configPath}.${dateFormat('dd-mm-yy-HH-MM-ss')}.bak`;
        fse.copySync(this._configPath, backupPath);

        return backupPath;
    }

    save() {
        const backupPath = this._backup();

        try {
            fse.writeJSONSync(this._configPath, this._config);
            fse.removeSync(backupPath);
        } catch (e) {
            this._bot.logger.severe('Impossible d\'enregistrer le fichier de configuration!');
        }
    }

    set(key, value) {
        // Convert to string if it's not a string already
        const realKey = `${key}`;
        this._config[realKey] = value;

        this.save();
    }
}

module.exports = ConfigManager;
