/* ------------------ */
/* Search App project */
/* ------------------ */

/* pseudo-Constants */

var MONGO_URL="mongodb://localhost:27017/proto";
var EVENT_COLL="Event"


/* Initializations */

var express=require('express');
var mongoClient=require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var app=express();
app.set('views', __dirname + '/views');
app.use('/Search/static',express.static(__dirname + '/public'));
app.set('view engine', 'jade');
app.set('view options', {layout: false});
app.use(express.favicon());


/* Util functions */

function fnRenderMain(pRequest,pResponse)
{
 pResponse.render('main',{title: 'MAIINN'});
}


function fnGenericResponse(pError,pResult,pResponse)
{
	if (pError)
	{
		pResponse.send({Status: "KO", Message: pError});
	}
	else
	{
		pResponse.send({Status: "OK", Result: pResult});
	}
}

/* Define mongodb handlers */


function fnDbGetColl(pColl,pEventCriteria,pCallback)
{
  mongoClient.connect(MONGO_URL, 
    function(err, db) 
    {
        if (err || !db)
        {
          pCallback("Error connecting mongo. "+err,null)  
        }
        else
        {
          db.collection(pColl).find(pEventCriteria).toArray( 
            function(err, result) 
            {
              if (err) // || result!=1)
              {
                pCallback("Error querying mongo. "+err,null);
                db.close(); 
            }
            else
            { 
              db.close();
              pCallback(null,result);
            }
            });
        }
    });
 }



function fnDbGetEvent(pEventCriteria,pCallback)
{
 	mongoClient.connect(MONGO_URL, 
 		function(err, db) 
 		{
  			if (err || !db)
  			{
  				console.log("AAA");
  				pCallback("Error connecting mongo. "+err,null)	
  			}
  			else
  			{
  				/*var criteria={}
  				if (pEventID)
  					criteria={_id: ObjectID(pEventID)}*/
  				db.collection(EVENT_COLL).find(pEventCriteria).toArray( 
  					function(err, result) 
  					{
   						if (err) // || result!=1)
   						{
   							console.log("BBB");
  							pCallback("Error querying mongo. "+err,null);
  							db.close();	
						}
						else
						{	
							console.log("CCC");
							db.close();
							pCallback(null,result);
						}
  					});
  			}
		});
 }


function fnDbWriteEvent(pEvent,pCallback)
{
 	mongoClient.connect(MONGO_URL, 
 		function(err, db) 
 		{
  			if (err || !db)
  			{
  				console.log("AAA");
  				pCallback("Error connecting mongo. "+err,null)	
  			}
  			else
  			{
  				db.collection(EVENT_COLL).insert(pEvent, {w:1}, 
  					function(err, result) 
  					{
    
   						if (err) // || result!=1)
   						{
   							console.log("BBB");
  							pCallback("Error inserting mongo. "+err,null);
  							db.close();	
						}
						else
						{	
							console.log("CCC");
							db.close();
							pCallback(null,null);
						}
  					});
  			}
		});
 }

 function fnDbDeleteEvent(pEventCriteria,pCallback)
{
 	mongoClient.connect(MONGO_URL, 
 		function(err, db) 
 		{
  			if (err || !db)
  			{
  				console.log("AAA");
  				pCallback("Error connecting mongo. "+err,null)	
  			}
  			else
  			{
  				/*var criteria={}
  				if (pEventID)
  					criteria={_id: ObjectID(pEventID)}*/
  				db.collection(EVENT_COLL).remove(pEventCriteria, {w:1}, 
  					function(err, result) 
  					{
    					if (err) // || result!=1)
   						{
   							console.log("BBB");
  							pCallback("Error removing mongo. "+err,null);
  							db.close();	
						}
						else
						{	
							console.log("CCC");
							db.close();
							pCallback(null,null);
						}
  					});
  			}
		});
 }

/* Define functions callbacks */

function fnObjCollGetResp(pRequest,pResponse)
{
  if (pRequest.params.coll!='Location' && pRequest.params.coll!='Trainer' && pRequest.params.coll!='Training')
  {
    fnGenericResponse("Invalid collection",null,pResponse);
  }
  else
  {
   fnDbGetColl(pRequest.params.coll,pRequest.query, function(pError, pResult) {
    fnGenericResponse(pError,pResult,pResponse);
  });
 }
}


function fnObjCollIdGetResp(pRequest,pResponse)
{
  if (pRequest.params.coll!='Location' && pRequest.params.coll!='Trainer' && pRequest.params.coll!='Training')
  {
    fnGenericResponse("Invalid collection",null,pResponse);
  }
  else
  {
   fnDbGetColl(pRequest.params.coll,{_id: ObjectID(pRequest.params.id)}, function(pError, pResult) {
    fnGenericResponse(pError,pResult,pResponse);
   });
  }
}

function fnInitGetResp(pRequest,pResponse)
{
	fnGenericResponse(null,'Search App v1.0',pResponse);
}

function fnEventGetResp(pRequest,pResponse)
{
	console.log(pRequest.query);
	fnDbGetEvent(pRequest.query, function(pError, pResult) {
		fnGenericResponse(pError,pResult,pResponse);
	});
}

function fnEventPostResp(pRequest,pResponse)
{
	pResponse.send('2')
}

function fnEventIdGetResp(pRequest,pResponse)
{
	//pResponse.send(pRequest.params.id)
	fnDbGetEvent({_id: ObjectID(pRequest.params.id)}, function(pError, pResult) {
		fnGenericResponse(pError,pResult,pResponse);
	});
}

function fnEventIdPutResp(pRequest,pResponse)
{
	fnDbWriteEvent(pRequest.params.id, function(pError, pResult) {
		fnGenericResponse(pError,pResult,pResponse);
	});
}

function fnEventIdDeleteResp(pRequest,pResponse)
{	
	fnDbDeleteEvent({_id: ObjectID(pRequest.params.id)}, function(pError, pResult) {
		fnGenericResponse(pError,pResult,pResponse);
	});
}



/* More inits */

app.configure('development', function(){
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});


app.configure('production', function(){
        app.use(express.errorHandler()); 
});


/* Define Routing */

app.get('/Search/api',fnInitGetResp);
app.get('/Search/api/Event',fnEventGetResp);
app.put('/Search/api/Event',fnEventPostResp);
app.get('/Search/api/Event/:id',fnEventIdGetResp);
app.post('/Search/api/Event/:id',fnEventIdPutResp);
app.delete('/Search/api/Event/:id',fnEventIdDeleteResp);
app.get('/Search',fnRenderMain);

/* Under Test */
app.get('/Search/api/:coll',fnObjCollGetResp);
app.get('/Search/api/:coll/:id',fnObjCollIdGetResp);

/* Start Server Listening */
app.listen(7777);