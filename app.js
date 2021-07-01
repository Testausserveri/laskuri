/* 
Testausserverin #satunnaiset-muu laskuri.
*/

process.env.TZ = 'Europe/Helsinki'

// Set timezone for the process

const Discord = require('discord.js')

// Create WebhookClient
const webhook = new Discord.WebhookClient(process.env.WEBHOOK_ID, process.env.WEBHOOK_SECRET);

const config = require('./config.json');

const diff = (to, from = Date.now()) => {
  return Math.ceil((to.getTime() - from)/(24 * 60 * 60 * 1000))
}

const getMessage = (start, end, name, msg = "") => {
  const toStart = diff(start);
  const toEnd = diff(end);
  if(toStart > 0) {
    msg += `Vielä ${toStart} päivää jotta "${name}" ${toStart === toEnd ? 'on' : 'alkaa'}`;
  } else if(toStart == 0) {
    msg += `Tänään ${toStart === toEnd ? 'on' : 'alkaa'} "${name}"`;
    if (toStart !== toEnd) msg += `. Loppuun ${toEnd} päivää`;
  } else if (toEnd > 0) {
    msg += `Vielä ${toEnd} päivää niin "${name}" loppuu`;
  } else if (toEnd == 0) {
    msg += `"${name}" loppuu tänään`;
  } else {
    return ''; // no more
  }
  return msg;
}  

const pings = [];
const messages = []
Object.keys(config.subscribers).forEach((entry) => {
  console.log('Calculating user ' + entry)
  let ping = false;
  config.subscribers[entry].forEach((user) => {
    const start = new Date(user.start);
    const end = new Date(user.end);
    const name = user.name;
    const message = getMessage(start, end, name, `${entry}\n`);
    if (message === '') {
      return;
    }
    ping = true;
    messages.push(`${message}`);
  })
  if(ping) pings.push(entry);
})

if (pings.length === 0) {
  console.log('No recipients')
  webhook.destroy();
  return;
}
// Send message

const embed = new Discord.MessageEmbed()
  .setTitle(`Laskuri`)
  .setDescription(
    `${messages.join('\n')}`
  )
  .setColor('#96227d')
  .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

webhook.send(
  pings.join(' '),
  {
    username: 'Laskuri',
    embeds: [embed],
    avatarURL: 'https://hotemoji.com/images/dl/h/ten-o-clock-emoji-by-twitter.png',
  }
).then(()=>webhook.destroy());
