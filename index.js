//API_URL = https://api.binance.com/api
const api = require('./api')
const symbol = process.env.SYMBOL
const profitability = parseFloat(process.env.PROFITABILITY)
const day = 60000*60*24


//Compra e Venda
setInterval(async() => {
  const result  =  await api.depth(symbol)

  let buy = 0, sell = 0

  if(result.bids && result.bids.length){
    console.log(`Highest Buy: ${result.bids[0][0]}`)
    buy = parseInt(result.bids[0][0])
  }

  if(result.asks && result.asks.length){
    console.log(`Lowest Sell: ${result.asks[0][0]}`)
    sell = parseInt(result.asks[0][0])
  }
 


  if(sell < 700 ) {
        console.log('Hora de comprar')
        const account = await api.accountInfo()
        const coins = account.balances.filter(b => symbol.indexOf(b.asset) !== -1)
        console.log(coins)

        console.log('Verificando se tenho dinheiro')
        if(sell <= parseInt(coins.find(c => c.asset === 'BUSD').free)){
            console.log('Tenho dinheiro, comprando agora')
            const buyOrder = await api.newOrder(symbol,1)
            console.log(`orderId: ${buyOrder.orderId}`)
            console.log(`status: ${buyOrder.status}`)

            console.log('Posicionando venda futura...')
            const price = parseInt(sell * profitability)
            console.log(`Vendendo por ${price} (${profitability})`)
            const sellOrder = await api.newOrder(symbol,1,price, 'SELL', 'LIMIT')
            console.log(`orderId: ${sellOrder.orderId}`)
            console.log(`status: ${sellOrder.status}`)
        }
  }
  else if (buy > 1000){
      console.log('Hora de vender')
  }
  else{
      console.log('Esperando')
  } 

 
}, process.env.CRAWLER_INTERVAL)

//Máxima e mínima
setInterval(async() => {
  const result = await api.dayStatistics(symbol)
  let lowerPrice = result.lowPrice
  let higherPrice = result.highPrice
  let closeTime = result.closeTime
  let date = new Date(closeTime)

  console.log(`Preço mais baixo de ${symbol} na data ${date} : ${lowerPrice} `)
  console.log(`Preço mais alto  de ${symbol} na data ${date} : ${higherPrice} `)
  

}, day)
