require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// Use JSON and URL-encoded form data parsing middleware
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.use('/public', express.static(`${process.cwd()}/public`));



//connect to mongoose
  mongoose.connect( process.env.mongodb_url)
  .then(()=>{
    console.log('MongoDb successfully connected!')
  })
  .catch((err)=>{
    console.warn(err)
  })
  
//connect to mongoose



// database
async function storeUrl(originalUrl){
  
  let alreadyStored = false;
  let searchedArray = []
  let urlNumber = 0


  const findLastURLNumber = await require('./model/url_schema').find({ 
    
  }, 'shortURL')
  .sort({ shortURL: -1 }) // Assuming you want to sort by _id in descending order
  .limit(1)
  .then(data => {

    if (data.length > 0) {
      urlNumber = data[0].shortURL;
      //console.log('find pervious url no '+ urlNumber)
    } //else console.log('cant find pervious url no '+ urlNumber)

  })
  .catch(error => {
    // Handle any errors that occurred during the query
    console.log('can\'t find last url number ' + error)     
  })



  
  const findURLInMongoDB = await require('./model/url_schema').findOne({ 
    'url' : originalUrl

  }, 'url shortURL')
  .then(data => {

    if(data){
      alreadyStored = true
      searchedArray.push([originalUrl, data.shortURL])
    }

  })
  .catch(error => {
    // Handle any errors that occurred during the query
    console.log('couldn\'t find in db ' + error)     
  })




  if( !alreadyStored ){ //console.log('new')

    urlNumber++
        
    // mongo db put
    const putInMongo = new require('./model/url_schema')({
      url: originalUrl,
      shortURL: urlNumber
    })

    try {      
      const objectId = await putInMongo.save()
      
      //console.log(objectId.id)      
      
    } catch(err) {     
      console.log('can\'t create url shortner in db ' + err.message)
    }
    // mongo db put

    

    return { original_url: originalUrl, short_url: urlNumber }
  } else { //console.log('old')
    return { original_url: searchedArray[0][0], short_url: searchedArray[0][1]}
  }
}







app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});



// shorturl endpoint
app.get('/api/shorturl/:number', async function(req, res) {
  let shortUrlNumber = req.params.number


  const findLastURLNumber = await require('./model/url_schema').findOne({ 
    shortURL: shortUrlNumber
  }, 'url shortURL')
  .then(data => {

    if (data) {
      const url = data.url;
      //console.log('url '+ url)
      res.redirect( url )

    } else res.json({ error: 'invalid url' })

  })
  .catch(error => {
    // Handle any errors that occurred during the query
    console.log('can\'t find short url ' + error)     
  })


  
});




// form submit endpoint
app.post('/api/shorturl', async function(req, res) {
  let originalUrl = req.body.url
  originalUrl = originalUrl.replaceAll(/ +/g, '') // remove all space

  const pattern = /[^A-Za-z0-9-_.~%:/]/g;
  const result = pattern.test(originalUrl); // check unrecognized char

  const firstOccurenceDot = originalUrl.indexOf(".")
  const lastOccurenceDot = originalUrl.lastIndexOf(".")

  const protocall = originalUrl.slice(0, firstOccurenceDot)
  const domainNameSlash = originalUrl.slice( lastOccurenceDot, originalUrl.indexOf("/", lastOccurenceDot) )
  const domainName = originalUrl.slice( lastOccurenceDot )

  

  if(!result && (protocall === 'https://www' || protocall === 'http://www') && firstOccurenceDot !== lastOccurenceDot  && (domainNameSlash != null || domainName != null) ) {
    // result false means no contamination
    
    
    res.json( await storeUrl( originalUrl ) )
  } else {    
    res.json({ error: 'invalid url' })
  }
});




app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
