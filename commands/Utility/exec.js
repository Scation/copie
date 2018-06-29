const { exec } = require('child_process');
const username = require('os').userInfo().username;

exports.run = async (bot, msg, args) => {
    let parsed = bot.utils.parseArgs(args, ['r', 'd', 's', 'f', 'w', 'fn:', 'l:']);
msg.delete().catch(O_o=>{});
    if (parsed.length < 1) {
        throw 'Vous devez fournir une commande pour exécuter!';
    }

    if (parsed.options.d) {
        msg.delete();
    }

    let ps = exec(parsed.leftover.join(' '));
    if (!ps) {
        throw 'Échec du démarrage du processus!';
    }

    if (parsed.options.s) {
        return;
    }

    let opts = {
        delay: 10,
        cutOn: '\n'
    };

    if (!parsed.options.r) {
        opts.prefix = `\`\`\`${parsed.options.l || 'bash'}\n`;
        opts.suffix = '\n```';
    }

    if (parsed.options.f) {
        let output = '';

        ps.stdout.on('data', data => output += data.toString());
        await new Promise(resolve => {
            ps.once('exit', async () => {
                if (!output) {
                    return resolve();
                }

                try {
                    await msg.channel.send({
                        files: [
                            {
                                attachment: output.replace(/^file:\/\//, ''),
                                name: parsed.options.fn
                            }
                        ]
                    });
                } catch (err) {
                    msg.error('Invalid URL/path!');
                }

                resolve();
            });
        });
    } else {
        if (parsed.options.w) {
            let output = '';
            let handler = data => output += data.toString();

            [ps.stdout, ps.stderr].forEach(stream => stream.on('data', handler));

            await new Promise(resolve => {
                ps.once('exit', async () => {
                    if (!output) {
                        return resolve();
                    }

                    await bot.utils.sendLarge(msg.channel, clean(output), opts);

                    resolve();
                });
            });
        } else {
            ps.stdout.on('data', data => bot.utils.sendLarge(msg.channel, clean(data), opts));
            ps.stderr.on('data', data => bot.utils.sendLarge(msg.channel, clean(data), opts));

            await new Promise(resolve => ps.once('exit', resolve));
        }
    }
};

const clean = function (data) {
    return `${data}`
        .replace(/`/g, '\u200b$&')
        .replace(new RegExp(username, 'g'), '<Hidden>')
        .replace(/\[[0-9]*m/g, '');
};

exports.info = {
    name: 'exec',
    usage: 'exec <command>',
    description: 'Exécute une commande dans la console',
    options: [
        {
            name: '-s',
            description: 'Fonctionne en mode silencieux, ne montre aucune sortie de la console'
        },
        {
            name: '-l',
            usage: '-l <lang>',
            description: 'Définit la langue du bloc de code généré'
        },
        {
            name: '-r',
            description: 'Envoie la sortie brute, sans aucun bloc de code'
        },
        {
            name: '-d',
            description: 'Supprime le message de commande'
        },
        {
            name: '-f',
            description: 'Interprete la réponse en tant que URL de fichier / chemin à envoyer'
        },
        {
            name: '-fn',
            usage: '-fn <name>',
            description: 'Définit le nom du fichier envoyé'
        },
        {
            name: '-w',
            description: 'Attendez que le programme se termine avant d\'envoyer la sortie'
        }
    ]
};
