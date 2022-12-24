import { Client } from '@repaya/client'
import express from 'express'

const apiToken = process.env.REPAYA_API_TOKEN

const invoiceFormId = 'jGH42'
const storeFormId = 'H79bG'
const depositFormId = 'hSwQA'

/* create repaya client for the ethereum mainnet */
const repaya = new Client('https://repaya.io', apiToken)

const app = express()

app.use(express.static('public'))

app.get('/balance', async (req, res) => {
	const coin = 'USD_MULTI1'
	const balances = await repaya.balances.getAll(depositFormId, {
		customerId: 'user_42',
		coin
	})

	if (!balances) {
		return res.status(200).json(null)
	}
	
	if (balances.length === 0) {
		return res.status(200).json('0')
	}

	return res.status(200).json(balances[0].balance)
})

app.post('/checkout-invoice', async (req, res) => {
    const userId = 'user_42'

  	const session = await repaya.sessions.create(invoiceFormId, {
    	customer: { id: userId },
    })
  
	res.redirect(303, session.checkoutUrl)
})

app.post('/checkout-store', async (req, res) => {
    const userId = 'user_42'
    const productId = 'product_65291'

  	const session = await repaya.sessions.create(storeFormId, {
    	customer: { id: userId },
     	product: {
        	id: productId,
        	name: 'Awesome product'
      	},
      	price: {
        	USD_MULTI1: '5.0',
     	}
    })
  
	res.redirect(303, session.checkoutUrl)
})

app.get('/after-checkout-store', async (req, res) => {
	const sessionId = req.query.session

	const payment = await repaya.payments.getBySession(sessionId)
	
	if (!payment || payment.status !== 'completed') {
		res.redirect(303, '/error.html')
		return
	}

	res.redirect(303, '/success.html')
})


app.post('/checkout-deposit', async (req, res) => {
    const userId = 'user_42'

  	const session = await repaya.sessions.create(depositFormId, {
    	customer: { id: userId },
    })
  
	res.redirect(303, session.checkoutUrl)
})

const port = process.env.PORT
app.listen(port, () => console.log(`Running server on port ${port}`))