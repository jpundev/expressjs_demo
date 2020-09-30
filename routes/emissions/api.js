const { response } = require('express');
//Get libraries
const express = require('express');
const router = express.Router();
const apikey = 'f8c39d1a3ce44b9772f00aa5ad65de14';
const categoryUrl = 'http://api.eia.gov/category/?api_key=' +  apikey + '&category_id=2251609';
//Get Series List

const fetch = require('node-fetch');


//Get Question 1 year,state as params
router.get('/1/year/:year/state/:state',(req,res)=>{

    fetch(categoryUrl)
    .then(response=>{return response.json()})
    .then((data)=>{
        for(i=0;i<data.category.childseries.length;i++){
            if(data.category.childseries[i].name === 'Electric power carbon dioxide emissions, coal, ' + req.params['state']){
                let series_id = data.category.childseries[i].series_id;
                fetch(`http://api.eia.gov/series/?api_key=`+apikey+`&series_id=`+series_id)
                .then(response=>{return response.json()})
                .then((results)=>{
                    for(y = 0;y<results.series[0].data.length;y++){
                        console.log(results.series[0].data[y])
                        if(results.series[0].data[y][0] === req.params['year'].toString()){
                            res.send(`Fetch Successful, Electric power carbon dioxide emission quantity from ${req.params['state']} from ${req.params['year']} is ${results.series[0].data[y][1]}`)
                            break;
                        }
                    }
                });
                break;
            }
        }
    });
});

//Get Question 2 from,to,state as params
router.get('/2/from/:from/to/:to/state/:state',(req,res)=>{
    let years = [];
    let accumulation = 0;
    for(i=req.params['from'];i<=req.params['to'];i++){
        years.push(i.toString());
    }
    console.log(years);
    fetch(categoryUrl)
    .then(response=>{return response.json()})
    .then((data)=>{
        for(i=0;i<data.category.childseries.length;i++){
            if(data.category.childseries[i].name === 'Electric power carbon dioxide emissions, coal, ' + req.params['state']){
                let series_id = data.category.childseries[i].series_id;
                fetch(`http://api.eia.gov/series/?api_key=`+apikey+`&series_id=`+series_id)
                .then(response=>{return response.json()})
                .then((results)=>{
                    for(x = 0 ;x < years.length ; x ++){
                        for(y = 0;y<results.series[0].data.length;y++){
                            console.log(results.series[0].data[y])
                            if(results.series[0].data[y][0] === years[x]){
                                accumulation += results.series[0].data[y][1];
                                break;
                            }
                        }
                    }
                    res.send(`Fetch Successful, Electric power carbon dioxide emission quantity from ${req.params['state']} ( ${req.params['from']} - ${req.params['to']} )   is ${accumulation}}`)
                });
                break;
            }
        }
    });
});
//export routes

module.exports = router;