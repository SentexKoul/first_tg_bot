const TelegramBot = require('node-telegram-bot-api')
const { gameOptions, restartGameOptions } = require('./options')

const token = '5070386368:AAH0IKAnW4kS8Im82G6naobHmtVHUVOPftg'
const bot = new TelegramBot(token, { polling: true })
const chats = {}

const startGame = async (chatID) => {
    const randomNum = Math.floor(Math.random() * 10)
    const text = 'Я хочу поиграть с тобой в игру, кожанный мешок, я загадаю чило, а ты его угадаешь.'

    await bot.sendMessage(chatID, text);
    chats[chatID] = randomNum.toString();

    await bot.sendMessage(chatID, 'Отгадывай', gameOptions);
}

const start = () => {
    bot.setMyCommands([
        { command: '/start', description: 'Начальное приветствие' },
        { command: '/info', description: 'Получить информацию о пользователе' },
        { command: '/game', description: 'Поиграть в игру' }
    ])

    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id

        await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/5a7/cb3/5a7cb3d0-bca6-3459-a3f0-5745d95d54b7/1.webp')
        await bot.sendMessage(chatId, `Привет, ${ msg.from.first_name }`);
    });

    bot.onText(/\/info/, (msg) => {
        const text = msg.chat.type === 'private'
            ? `О, я тебя знаю, ты ${ msg.from.first_name } aka ${msg.from.username}`
            : `Как же я люблю "${msg.chat.title}", вот вы все слева направо`

        bot.sendMessage(msg.chat.id, text);
    });

    bot.onText(/\/game/, (msg) => startGame(msg.chat.id));

    bot.on('message', msg => {
        if (msg.text.toString().toLowerCase().includes('бот') && msg.chat.type === 'group') {
            bot.sendMessage(msg.chat.id, `О, вы обо мне говорите!`)
        }
    })

    bot.on('callback_query', msg => {
        const data = msg.data
        const chatId = msg.message.chat.id

        if (data === '/game') return startGame(chatId)

        let answerText = data === chats[chatId] ? `🎉🎉🎉 Надо же, ты угадал, ответив "${data}"!`: '😠 Ты не угадал!'
        bot.sendMessage(chatId, answerText, restartGameOptions)
    })
}

start();