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
/*
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

    

    return { 'original_url': originalUrl, 'short_url': urlNumber }
  } else { //console.log('old')
    return { 'original_url': searchedArray[0][0], 'short_url': searchedArray[0][1]}
  }
}*/

//text
function storeUrl(originalUrl, callbakc){
  
  let alreadyStored = false;
  let searchedArray = []
  let urlNumber = 0


  const findLastURLNumber =  require('./model/url_schema').find({ 
    
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



  setTimeout(()=>{

  const findURLInMongoDB =  require('./model/url_schema').findOne({ 
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

  }, 500)


  setTimeout(()=>{

  if( !alreadyStored ){ //console.log('new')

    urlNumber++
       
    // mongo db put
    const putInMongo = new require('./model/url_schema')({
      url: originalUrl,
      shortURL: urlNumber
    })

    try {      
      const objectId = putInMongo.save()
      
      //console.log(objectId.id)      
      
    } catch(err) {     
      console.log('can\'t create url shortner in db ' + err.message)
    }
    // mongo db put
    
    

    return callbakc({ 'original_url': originalUrl, 'short_url': urlNumber })
  } else { //console.log('old')
    return callbakc({ 'original_url': searchedArray[0][0], 'short_url': searchedArray[0][1]})
  }

  }, 1000)
}
//test








app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// test
/*
app.post('/api/shorturl',  function(req, res) {
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
    
    //const result = storeUrl( originalUrl )
    // /*
    storeUrl( originalUrl ).then(result => {
      res.json( { 'original_url': result['original_url'], 'short_url': result['short_url'] } )
    })
    // /
    
    //res.json( { 'original_url': result['original_url'], 'short_url': result['short_url'] } )

    storeUrl( originalUrl, (result) => {
      res.json( { 'original_url': result['original_url'], 'short_url': result['short_url'] } )
    })

  } else {    
    res.json({ 'error': 'invalid url' })
  }
});



app.get('/api/shorturl/:short_url', function(req, res) {
  let shortUrlNumber = req.params.short_url


  const findLastURLNumber = require('./model/url_schema').findOne({ 
    shortURL: shortUrlNumber
  }, 'url shortURL')
  .then(data => {

    if (data) {
      const url = data.url;
      //console.log('url '+ url)
      res.redirect( url )

    } else res.json({ 'error': 'invalid url' })

  })
  .catch(error => {
    // Handle any errors that occurred during the query
    console.log('can\'t find short url ' + error)     
  })


  
});
*/
// test



/*
//my method


// shorturl endpoint
app.get('/api/shorturl/:short_url', async function(req, res) {
  let shortUrlNumber = req.params.short_url


  const findLastURLNumber = await require('./model/url_schema').findOne({ 
    shortURL: shortUrlNumber
  }, 'url shortURL')
  .then(data => {

    if (data) {
      const url = data.url;
      //console.log('url '+ url)
      res.redirect( url )

    } else res.json({ 'error': 'invalid url' })

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
    
    const result = await storeUrl( originalUrl )
    
    res.json( { 'original_url': result['original_url'], 'short_url': result['short_url'] } )

  } else {    
    res.json({ 'error': 'invalid url' })
  }
});
*/




//chat gpt method


// In-memory storage for URL mappings
//const urlMap = new Map();
const urlArr = []
let currentShortUrl = 1;

// Route to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;

  if (!url) {
    return res.status(400).json({ error: 'invalid url' });
  }

  const short_url = currentShortUrl++;
  //urlMap.set(short_url, url);
  urlArr.push([url, short_url])

  console.log(url)
  res.json({ 'original_url': url, 'short_url': short_url });
});


// Route to redirect to the original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;
  //const original_url = urlMap.get(Number(short_url));

  let original_url = ''

  for (let i = 0; i < urlArr.length; i++) {
    if (urlArr[i].includes( Number(short_url) )) {
      original_url = urlArr[i][1]
      break;
    }
  }

  if (original_url) {
    res.redirect(original_url);
  } else {
    res.status(404).json({ error: 'invalid url' });
  }
});







app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
