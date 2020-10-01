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
                    res.send(`Fetch Successful, Electric power carbon dioxide emission quantity from ${req.params['state']} from ${req.params['year']} is ${value} million`)
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
                    res.send(`Fetch Successful, Electric power carbon dioxide emission quantity from ${req.params['state']} ( ${req.params['from']} - ${req.params['to']} )   is ${accumulation} million`)
                });
                break;
            }
        }
    });
});

//Get Question 3 series as params to save 
router.get('/3/state/:state',(req,res)=>{
    //Init some vars
    var MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://test_zallat:zallat123@testzallat.lay3h.mongodb.net/emissions?retryWrites=true&w=majority";
    var obj = [];
    
    const client = new MongoClient(uri, {useNewUrlParser:true});
    client.connect(err =>{
        console.log('Connected');

        // HTTPS Call using fetch library 
        const collection = client.db('emissions').collection('zallat');
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
                        
                        //Push the entire series into the obj to prepare it for insert
                        for(i=0;i<results.series[0].data.length;i++){
                            obj.push({
                                //Create a new object
                                State: req.params['state'],
                                Year: results.series[0].data[i][0],
                                Value: results.series[0].data[i][1]                           
                            })
                        }
                        //Insert the list of objects
                        collection.insertMany(obj, function(err, res) {
                            if (err) throw err;
                            console.log("Number of documents inserted: " + res.insertedCount);
                            //Close connection
                            client.close();
                          });
                    //Return the value 
                    res.send(`Fetch Successful, Electric power carbon dioxide emission quantity from ${req.params['state']} Inserted`);
                });
                break;
            }
        }
    });

    });

    
    
});

//Question 3 from,to params from mongoDb

router.get('/3/from/:from/to/:to',(req,res)=>{
    //Initiate mongoClient
    var MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://test_zallat:zallat123@testzallat.lay3h.mongodb.net/emissions?retryWrites=true&w=majority";
    const client = new MongoClient(uri, {useNewUrlParser:true});
    //Connect to the db. Upon Researching new MongoCLient passing in the URI gives a CLIENT not db as what was thought before. We can then manipulate
    //the client to do what we need it to do.
    client.connect(err =>{
    const collection = client.db('emissions').collection('zallat');
    //Create a pipeline ( its basically a weird query) for the aggregate
    const pipeline = [
        {
            '$match':{
                'Year':{
                    '$gte': `${req.params['from']}`,
                    '$lte':`${req.params['to']}`
                }
            }
        },
        {
            '$group':{
                '_id': "$State",
                'total':{
                    '$sum': "$Value"
                }
            }
        }
    ]
    //Pass in the pipeline to the aggregate function
    collection.aggregate(pipeline).toArray().then(values=>{
        //Find the max Value through the iterated returned states.
        let max = 0;
        let State = '';
        for(const value of values ){
            if(value.total > max){
                max = value.total;
                State = value._id;
            }
            console.log(value)
        }
        //cLose connection
        client.close();
        //Return result.
        res.send(`Fetch Successful, Highest Coal Emission State is ${State} With ${max} Units`);
    })

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