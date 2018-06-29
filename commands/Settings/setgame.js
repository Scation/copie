const normalizeUrl = require('normalize-url');

exports.run = async (bot, msg, args) => {
    let { leftover, options } = bot.utils.parseArgs(args, ['s:']);

    if (leftover.length < 1) {
        if (options.s) {
            throw 'Vous devez fournir un jeu ainsi qu\'une URL de flux.';
        }

        bot.user.setGame(null, null);
        return msg.edit('Effacé votre jeu ! :ok_hand:').then(m => m.delete(3000));
    }

    let game = leftover.join(' ');
    let stream = options.s;

    let fields = [{ name: ':video_game: Game', value: game }];

    if (stream) {
        stream = normalizeUrl(`twitch.tv/${stream}`);

        fields.push({ name: ':headphones: Stream URL', value: stream });
    }

    bot.user.setPresence({
        game: {
            name: game,
            url: stream,
            type: !!stream + 0 // pr0 hax0r -- convert string to truthy int
        }
    });

    msg.delete();

    (await msg.channel.send({
        embed: bot.utils.embed(':ok_hand: Jeu changé!', '', fields)
    })).delete(5000);
};

exports.info = {
    name: 'setgame',
    usage: 'setgame <game>',
    description: 'Définit votre jeu (montre pour d\'autres personnes)',
    options: [
        {
            name: '-s',
            usage: '-s <url>',
            description: 'Définit votre URL de diffusion en continu http://twitch.tv/<url>'
        }
    ]
};
