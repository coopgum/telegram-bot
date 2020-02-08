const Telegraf = require('telegraf')
const { Markup } = Telegraf

const app = new Telegraf('828682387:AAFwmcMYUNJI4ATP6hzvGBRYUSI-mih516o')
const PAYMENT_TOKEN = 'pk_live_ZUFzonlOhu4AzqOh3vD1wzP100V74tuki8'

const products = [
    {
        name: 'Big Bag Forex VIP',
        price: 19.99,
        description: 'Gain access to the Big Bag Forex VIP server with more signals!',
        photoUrl: 'https://i.imgur.com/hOeTbMA.jpg'
    },
    
]

function createInvoice (product) {
    return {
        provider_token: PAYMENT_TOKEN,
        start_parameter: 'foo',
        title: product.name,
        description: product.description,
        currency: 'EUR',
        photo_url: product.photoUrl,
        is_flexible: false,
        need_shipping_address: false,
        prices: [{ label: product.name, amount: Math.trunc(product.price * 100) }],
        payload: {}
    }
}

// Start command
app.command('start', ({ reply }) => reply('Hello, glad to see you are interested in the VIP telegram!'))

// Show offer
app.hears(/^what.*/i, ({ replyWithMarkdown }) => replyWithMarkdown(`
Here is the current pricing for VIP!

${products.reduce((acc, p) => {
    return (acc += `*${p.name}* - ${p.price} €\n`)
    }, '')}    
Keep in mind this is a monthly subscription.`,
    Markup.keyboard(products.map(p => p.name)).oneTime().resize().extra()
))

// Order product
products.forEach(p => {
    app.hears(p.name, (ctx) => {
        console.log(`${ctx.from.first_name} is about to buy a ${p.name}.`);
        ctx.replyWithInvoice(createInvoice(p))
    })
})

// Handle payment callbacks
app.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true))
app.on('successful_payment', (ctx) => {
    console.log(`${ctx.from.first_name} (${ctx.from.username}) just payed ${ctx.message.successful_payment.total_amount / 100} €.`)
})

app.startPolling()
