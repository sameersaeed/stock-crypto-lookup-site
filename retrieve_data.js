/*
** Sameer Saeed
** Stock/Crypto Lookup Website
** Uses Alpha Vantage's Stock APIs to retrieve info for a stock/crypto given by the user
*/

const s_URL = "https://www.alphavantage.co/query?apikey=YOUR_API_KEY&function=TIME_SERIES_MONTHLY_ADJUSTED&datatype=json&symbol=";
const c_URL = "https://www.alphavantage.co/query?&apikey=YOUR_API_KEY&function=DIGITAL_CURRENCY_MONTHLY&market=USD&datatype=json&symbol=";
const form = document.querySelector("#search");
const chart = document.querySelector("#chart");
var selected = document.getElementById("options"), val;

//retrieves and outputs info from stock/crypto url 
API = { get };
//handles submission of data
form.addEventListener("submit", submit);

//customizing graph that will be inserted into html
let options = {
    chart: {
        type: "candlestick",
        animations: {
            enabled: true,
            easing: "linear",
            speed: 800,
            animateGradually: {
                enabled: true,
                delay: 2500
            },
            dynamicAnimation: {
                enabled: true,
                speed: 1000
            }
        }
    },
    series: [
        {
            data: [],
        },
    ],
    title: {
        text: "",
        align: "center",
    },
    xaxis: {
        type: "datetime",
    },
    yaxis: {
        tooltip: {
            enabled: true
        },
    },
    tooltip: {
        x: {
            format: "dd MMM yyyy"
        },
    },    
    theme: {
        mode: "dark",
        palette: "palette5",
    }
};

function get(url) { //gets either the stock or crypto url, returns data
    val = selected.options[selected.selectedIndex].value;
    if(val === "cr"){ //user selects crypto
        return fetch(url)
        .then(response => response.json())
        .then(data => format(data))
        .then(result => {
            chart.innerText = "";
            new ApexCharts(document.querySelector("#chart"), options).render();
        });
    }
    //default - user selects stock
    return fetch(url)
    .then(response => response.json())
    .then(data => format(data))
    .then(result => {
        chart.innerText = "";
        new ApexCharts(document.querySelector("#chart"), options).render();
    });
}

function format(data) { //filters data from API to get what will be inserted into chart
    let out = []; //contains data for x and y axes
    if(val === "cr") { //formatting for crypto option
        //title for chart
        options.title.text = "Monthly Time Series for: " + data["Meta Data"]["2. Digital Currency Code"] + 
       "("+ data["Meta Data"]["3. Digital Currency Name"] +")";
       //gets each time entry for the graph
        Object.entries(data["Time Series (Digital Currency Monthly)"]).forEach(
            ([month, monthlyPrices]) => {
                let obj = {}; //contains price and date data for each month
                //plots all dates on x axis
                obj.x = new Date(month);
                let prices = []; //contains prices
                prices.push(monthlyPrices["1a. open (USD)"]);
                prices.push(monthlyPrices["2a. high (USD)"]);
                prices.push(monthlyPrices["3a. low (USD)"]);
                prices.push(monthlyPrices["4a. close (USD)"]);
                prices.push(monthlyPrices["6. market cap (USD)"]);
                //plots all prices on y axis
                obj.y = prices;
                out.push(obj); //data gets plotted to graph
            },
        );
        options.series[0].data = out.sort((x, y) => x.a - y.b); //sorts axes in ascending order
    }
    else { //formatting for stock (default) option
        options.title.text = "Monthly Time Series for: " + data["Meta Data"]["2. Symbol"];
        Object.entries(data["Monthly Adjusted Time Series"]).forEach(
        ([month, monthlyPrices]) => {
            let obj = {};
            obj.x = new Date(month);
            let prices = [];
            prices.push(monthlyPrices["1. open"]);
            prices.push(monthlyPrices["2. high"]);
            prices.push(monthlyPrices["3. low"]);
            prices.push(monthlyPrices["4. close"]);
            obj.y = prices;
            out.push(obj);
        },
        );
        options.series[0].data = out.sort((x, y) => x.a - y.b);
    }
}

function submit(event) { //submits api request
    val = selected.options[selected.selectedIndex].value; //gets users search option (stock/crypto)
    event.preventDefault();
    let symbol = event.target.name.value; //symbol to lookup (ex. AAPL, TSLA, BTC, ETH, etc.)
    if(val === "cr") { //submission for crypto
        API.get(`${c_URL}${symbol}`); //fetches info for crypto given url and symbol 
    }
    else { //submission for stock
        API.get(`${s_URL}${symbol}`); //fetches info for stock given url and symbol
    }
}