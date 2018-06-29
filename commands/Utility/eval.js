const stripIndents = require('common-tags').stripIndents;
const chalk = require('chalk');
//const util = require("./util.js");

exports.run = async (bot, msg, args) => {
  

  msg.delete().catch(O_o=>{});
    if(msg.author.id !== "404295469657882624") return;
          try {
              var code = args.join(" ");
              var evaled = eval(code);
    
              if (typeof evaled !== "string")
                  evaled = require("util").inspect(evaled);
              msg.channel.send({
        embed: bot.utils.embed('', stripIndents`
                **Code:**\n\`\`\`fix\n${code}\n\`\`\`
                **Résultat:**${clean.length < 1500 ? `\n\`\`\`js\n${evaled}\n\`\`\`` : `\n\n`}
                `)
    });
          } catch(err) {
              msg.channel.send(`\`ERREUR\` \`\`\`x1\n${clean(err)}\n\`\`\``);
          }
          console.log(`${msg.author.username} sur ${msg.guild.name} salon ${msg.channel.name} : ${(chalk.green('\u2713'))} A ouvert la [ Eval ]\n--------------------------------------`);
      }

function clean(text) {
                          if (typeof(text) === "string")
                              return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                          else
                              return text;
                      }

exports.info = {
    name: 'eval',
    usage: 'eval <code>',
    description: 'Évaluer JavaScript arbitraire',
    options: [
        {
            name: '-l',
            usage: '-l <lang>',
            description: 'Définit le langage de syntaxe du code de sortie'
        },
        {
            name: '-i',
            usage: '-i',
            description: 'Sortie extra-longue en ligne en plus du téléchargement vers hastebin'
        },
        {
            name: '-q',
            usage: '-q',
            description: 'N\'affiche aucune sortie'
        }
    ]
};
