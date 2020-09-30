//Get libraries
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
//Init apikey and initial the categoryUrl
const apikey = 'f8c39d1a3ce44b9772f00aa5ad65de14';
const categoryUrl = 'http://api.eia.gov/category/?api_key=' +  apikey + '&category_id=2251609';

//Get Question 1 year,state as params
router.get('/1/year/:year/state/:state',(req,res)=>{

//HTTPS Call using fetch library 
    fetch(categoryUrl)
    .then(response=>{return response.json()})
    .then((data)=>{
//Iterate through the List of child series for the name of the state to obtain the Series_id 
        for(i=0;i<data.category.childseries.length;i++){
            //Found the Series name
            if(data.category.childseries[i].name === 'Electric power carbon dioxide emissions, coal, ' + req.params['state']){
                //This is the series_id
                let series_id = data.category.childseries[i].series_id;
                //New fetch to series_id to get the array data
                fetch(`http://api.eia.gov/series/?api_key=`+apikey+`&series_id=`+series_id)
                .then(response=>{return response.json()})
                .then((results)=>{
                    //Return the value
                    let value = getValue(req.params['year'],results);
                    res.send(`Fetch Successful, Electric power carbon dioxide emission quantity from ${req.params['state']} from ${req.params['year']} is ${value}`)
                });
                break;
            }
        }
    });
});

//Get Question 2 from,to,state as params
router.get('/2/from/:from/to/:to/state/:state',(req,res)=>{
    //Init some vars
    let years = [];
    let accumulation = 0;
    //Get the years in between the from and to 
    for(i=req.params['from'];i<=req.params['to'];i++){
        years.push(i.toString());
    }
    //HTTPS Call using fetch library 
    fetch(categoryUrl)
    .then(response=>{return response.json()})
    .then((data)=>{
        //Iterate through the List of child series for the name of the state to obtain the Series_id 
        for(i=0;i<data.category.childseries.length;i++){
            //Found the Series Name
            if(data.category.childseries[i].name === 'Electric power carbon dioxide emissions, coal, ' + req.params['state']){
                //This is the series_id
                let series_id = data.category.childseries[i].series_id;
                 //New fetch to series_id to get the array data
                fetch(`http://api.eia.gov/series/?api_key=`+apikey+`&series_id=`+series_id)
                .then(response=>{return response.json()})
                .then((results)=>{
                    //Unlike before we first iterate through the years and then the set of data to get each matching year.[~Can probably modualize this tbh~ Done]
                    for(x = 0 ;x < years.length ; x ++){
                        //accumualte the emission values over the years
                        accumulation += getValue(years[x],results);
                    }
                    //Return the value 
                    res.send(`Fetch Successful, Electric power carbon dioxide emission quantity from ${req.params['state']} ( ${req.params['from']} - ${req.params['to']} )   is ${accumulation}`)
                });
                break;
            }
        }
    });
});

function getValue(year,results){
    //Iterate through the data to get the matching date and its value
    for(y = 0;y<results.series[0].data.length;y++){
        //Found matching year
        if(results.series[0].data[y][0] === year.toString()){
            //Send response to the request 
            return results.series[0].data[y][1]
        }
    }
}
//export routes
module.exports = router;