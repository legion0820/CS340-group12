/*
    SETUP
*/


// Most of the app.js implementation is from the ecampus resource to use a node.js starter app
// https://github.com/osu-cs340-ecampus/nodejs-starter-app

// Step 0: set up Node.js / Express
// Express
var express = require('express');   // We are using the express library for the web server
var app     = express();            // We need to instantiate an express object to interact with the server in our code
// Step 5: Adding New Data SETUP
app.use(express.json())
app.use(express.urlencoded({extended: true}))

PORT        = 5647;                 // Set a port number at the top so it's easy to change in the future

// static files
app.use(express.static('public'))

// Step 1: Connecting to SQL database
// Database
var db = require('./db-connector');

// Step 3: Integrating Handlebars
const { engine } = require('express-handlebars');
var expressHBS = require('express-handlebars'); // importing expressHBS
app.engine('.hbs', engine({extname: ".hbs"})); // Create HBS engine to process template
app.set('view engine', '.hbs') // use HBS when it sees a .hbs file

// This allows access to public, static directories for now
// Make public directory (CSS, etc,.) available to client (user's browser)
app.use(express.static('public'));


/*
    ROUTES
*/
app.get('/', function(req, res){

    res.render('partials/index');

});

/*//////////////////////
        REVIEW
*///////////////////////
app.get('/review', function(req, res){

    let query1;

    query1 = "SELECT * FROM Reviews";

    // This is for the drop down menu for UserID
    let query2 = "SELECT * FROM Users;";

    // This is for the drop down menu for EquipmentID
    let query3 = "SELECT * FROM Equipment;"

    db.pool.query(query1, function(error, rows, fields){
         
        // {data: rows}
        // This sends the renderer an object
        // where 'data' is equal to 'rows' we s
        // got from the query
        let reviews = rows;

        // res.render('partials/users',{data: users});
        db.pool.query(query2, (error, rows, fields) => {

            // Save user IDs
            let userIDs = rows;

            db.pool.query(query3, (error, rows, fields) => {

                let equipmentIDs = rows;
                return res.render('partials/review', {data: reviews, user: userIDs, equip: equipmentIDs});

            })


            
        })



    })

});

app.post('/add-review-ajax', function(req, res){

    let data = req.body;

    let query1 = `INSERT INTO Reviews
    (
        userID, 
        equipmentID, 
        reviewDescription, 
        stars
    )
    VALUES
    (
    
        "${data['rUserID']}", 
        "${data['rEquipmentID']}", 
        "${data['rReviewValue']}", 
        "${data['rStarsValue']}" 
    
    );`;

    db.pool.query(query1, function(error, rows, fields){

        if(error){
            console.log(error)
            res.sendStatus(400);
        }

        else{

            query2 = `SELECT * FROM Reviews`;
            db.pool.query(query2, function(error, rows, field){

                if(error){

                    console.log(error);
                    res.sendStatus(400);
                }

                else{

                    res.send(rows)

                }

            })
        }

    })


});


app.delete('/delete-review-ajax/', function(req,res,next){
    let data = req.body;
    let reviewID = parseInt(data.reviewID);
    let delete_review = `DELETE FROM Reviews WHERE reviewID = ?`;
  
  
          // Run the 1st query
          db.pool.query(delete_review, [reviewID], function(error, rows, fields){
              if (error) {
                  // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                  console.log(error);
                  res.sendStatus(400);
              }
  
              else
              {
              
                  res.sendStatus(204);
                  
              }
  })});


/*//////////////////////
        EQUIPMENT
*///////////////////////
app.get('/equipment', function(req, res){

    let query1;

    query1 = `SELECT * FROM Equipment;`;


    let query2 = `SELECT * FROM ProductType;`


    db.pool.query(query1, function(error, rows, fields){

        let equipment = rows;

        db.pool.query(query2, (error, rows, fields) => {

            // Is allows to display product Type
            // save productType IDs
            let ptIDs = rows;

            let ptIDMap = {}
            ptIDs.map(ptID => {
                let id = parseInt(ptID.productTypeID, 10);
                ptIDMap[id] = ptID["typeDescription"];
            })

            // Overwrite productTypeID
            equipment = equipment.map(oneEquipment => {
                return Object.assign(oneEquipment, {productTypeID: ptIDMap[oneEquipment.productTypeID]})
            })

            return res.render('partials/equipment', {data: equipment, ptData: ptIDs});

        })

        
    })

});

app.post('/add-equipment-ajax', function(req, res){

    let data = req.body;

    let query1 = `INSERT INTO Equipment
    (
        equipmentName, 
        equipmentDescription, 
        equipmentCost, 
        equipmentStock, 
        productTypeID
    )
    VALUES
    (
    
        "${data['eName']}", 
        "${data['eDesc']}", 
        "${data['eCost']}", 
        "${data['eStock']}", 
        "${data['ePT']}"
    
    );`;

    db.pool.query(query1, function(error, rows, fields){

        if(error){
            console.log(error)
            res.sendStatus(400);
        }

        else{

            query2 = `SELECT * FROM Equipment`;
            db.pool.query(query2, function(error, rows, field){

                if(error){

                    console.log(error);
                    res.sendStatus(400);
                }

                else{

                    res.send(rows)

                }

            })
        }

    })


});


app.delete('/delete-equipment-ajax/', function(req,res,next){
    let data = req.body;
    let equipmentID = parseInt(data.equipmentID);
    let delete_equipment= `DELETE FROM Equipment WHERE equipmentID = ?`;
  
  
          // Run the 1st query
          db.pool.query(delete_equipment, [equipmentID], function(error, rows, fields){
              if (error) {
                  // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                  console.log(error);
                  res.sendStatus(400);
              }
  
              else
              {
              
                  res.sendStatus(204);
                  
              }
  })});


/*//////////////////////
        USERS
*///////////////////////
app.get('/users', function(req, res){

    // let query1 = "SELECT * FROM Users;";
    let query1;

    // If there is no query string, we perform simple SELECT
    if(req.query.fname === undefined){
        query1 = `SELECT * FROM Users`;
    }

    else{
        query1 = `SELECT * FROM Users WHERE firstName LIKE "${req.query.fname}%"`
    }



    // This is for the drop down menu, the same for both cases
    let query2 = "SELECT userID FROM Users;";

    db.pool.query(query1, function(error, rows, fields){
         
        // {data: rows}
        // This sends the renderer an object
        // where 'data' is equal to 'rows' we 
        // got from the query
        let users = rows;

        // res.render('partials/users',{data: users});
        db.pool.query(query2, (error, rows, fields) => {

            // Save user IDs
            let userIDs = rows;
            return res.render('partials/users', {data: users, users: userIDs});
        })



    })

});


// Step 5 Adding New Data
app.post('/add-user-ajax', function(req, res){

    // Capture incoming data and parse into JS object
    let data = req.body;

    // Create query and run it on database
    let query1 = `INSERT INTO Users(firstName, lastName, address, phoneNumber, email) 
                   VALUES ("${data['fName']}", "${data['lName']}", "${data['address']}", "${data['pNumber']}", "${data['email']}")`;
    db.pool.query(query1, function(error, rows, fields){

         // Check to see if there was an error
        if (error){
            console.log(error)
            res.sendStatus(400);
        }

        else{

            query2 = `SELECT * FROM Users;`;
            db.pool.query(query2, function(error, rows, field){

                if(error){

                    console.log(error);
                    res.sendStatus(400);
                }

                else{
                    res.send(rows);
                }
            })
        }

    });

});

app.delete('/delete-user-ajax/', function(req,res,next){
  let data = req.body;
  let userID = parseInt(data.userID);
  let delete_user= `DELETE FROM Users WHERE userID = ?`;


        // Run the 1st query
        db.pool.query(delete_user, [userID], function(error, rows, fields){
            if (error) {
                // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                console.log(error);
                res.sendStatus(400);
            }

            else
            {
            
                res.sendStatus(204);
                
            }
})});


app.put('/put-user-ajax', function(req,res,next){
  let data = req.body;

  let uID = parseInt(data.uID);

  // if email != '':
  //   query += ' email = ?'
  //   params += email


  let uEmail = data.email;
  let queryUpdateEmail = `UPDATE Users SET email = ? WHERE Users.userID = ?`;
  let selectEmail = `SELECT * FROM Users WHERE Users.email = ?;`


    // Run the 1st query
   
    db.pool.query(queryUpdateEmail, [uEmail, uID], function(error, rows, fields){
        if (error) {

        // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
        console.log(error);
        res.sendStatus(400);
        }

        // If there was no error, we run our second query and return that data so we can use it to update the people's
        // table on the front-end
        else
        {
            // Run the second query
            db.pool.query(selectEmail, [uEmail], function(error, rows, fields) {

                if (error) {
                    console.log(error);
                    res.sendStatus(400);
                } 
                else {
                    res.send(rows);
                }
            })
        }

    })

});


/*//////////////////////
        ORDER
*///////////////////////
app.get('/order', function(req, res){

    // let query1 = "SELECT * FROM Users;";
    let query1;

    // If there is no query string, we perform simple SELECT
    // if(req.query.fname === undefined){
    query1 = "SELECT * FROM Orders";
    // }

    // else{
    //     query1 = `SELECT * FROM Orders WHERE firstName LIKE "${req.query.fname}%"`
    // }



    // This is for the drop down menu, the same for both cases
    let query2 = "SELECT orderID FROM Orders;";

    db.pool.query(query1, function(error, rows, fields){
         
        // {data: rows}
        // This sends the renderer an object
        // where 'data' is equal to 'rows' we 
        // got from the query
        let orders = rows;

        // res.render('partials/users',{data: users});
        db.pool.query(query2, (error, rows, fields) => {

            // Save user IDs
            let orderIDs = rows;
            return res.render('partials/order', {data: orders, orders: orderIDs});
        })



    })

});

// Step 5 Adding New Data
app.post('/add-order-ajax', function(req, res){

    // Capture incoming data and parse into JS object
    let data = req.body;

    // Create query and run it on database
    let query1 = `INSERT INTO Orders
    (
        userID, 
        orderDate, 
        numItems, 
        totalCost
    ) 
    VALUES 
    (
        "${data['userID']}", 
        "${data['date']}", 
        "${data['numItems']}", 
        "${data['cost']}")`;

    db.pool.query(query1, function(error, rows, fields){

         // Check to see if there was an error
        if (error){
            console.log(error)
            res.sendStatus(400);
        }

        else{

            query2 = `SELECT * FROM Orders;`;
            db.pool.query(query2, function(error, rows, field){

                if(error){

                    console.log(error);
                    res.sendStatus(400);
                }

                else{
                    res.send(rows);
                }
            })
        }

    });

});

app.delete('/delete-order-ajax/', function(req,res,next){
    let data = req.body;
    let orderID = parseInt(data.orderID);
    let delete_order= `DELETE FROM Orders WHERE orderID = ?`;
  
  
          // Run the 1st query
          db.pool.query(delete_order, [orderID], function(error, rows, fields){
              if (error) {
                  // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                  console.log(error);
                  res.sendStatus(400);
              }
  
              else
              {
              
                  res.sendStatus(204);
                  
              }
})});


/*//////////////////////
        PRODUCTTYPE
*///////////////////////

app.get('/productType', function(req, res){

    // let query1 = "SELECT * FROM Users;";
    let query1;

    // If there is no query string, we perform simple SELECT
    // if(req.query.fname === undefined){
    query1 = "SELECT * FROM ProductType";
    // }

    // else{
    //     query1 = `SELECT * FROM Orders WHERE firstName LIKE "${req.query.fname}%"`
    // }



    // This is for the drop down menu, the same for both cases
    let query2 = "SELECT productTypeID FROM ProductType;";

    db.pool.query(query1, function(error, rows, fields){
         
        // {data: rows}
        // This sends the renderer an object
        // where 'data' is equal to 'rows' we 
        // got from the query
        let productTypes = rows;

        // res.render('partials/users',{data: users});
        db.pool.query(query2, (error, rows, fields) => {

            // Save user IDs
            let productTypeIDs = rows;
            return res.render('partials/productType', {data: productTypes, productTypes: productTypeIDs});
        })



    })

});

app.post('/add-productType-ajax', function(req, res){

    // Capture incoming data and parse into JS object
    let data = req.body;

    // Create query and run it on database
    let query1 = `INSERT INTO ProductType(typeDescription) 
                   VALUES ("${data['description']}")`;
    db.pool.query(query1, function(error, rows, fields){

         // Check to see if there was an error
        if (error){
            console.log(error)
            res.sendStatus(400);
        }

        else{

            query2 = `SELECT * FROM ProductType;`;
            db.pool.query(query2, function(error, rows, field){

                if(error){

                    console.log(error);
                    res.sendStatus(400);
                }

                else{
                    res.send(rows);
                }
            })
        }

    });

});


app.delete('/delete-productType-ajax/', function(req,res,next){
    let data = req.body;
    let productTypeID = parseInt(data.productTypeID);
    let delete_productType= `DELETE FROM ProductType WHERE productTypeID = ?`;
  
  
          // Run the 1st query
          db.pool.query(delete_productType, [productTypeID], function(error, rows, fields){
              if (error) {
                  // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                  console.log(error);
                  res.sendStatus(400);
              }
  
              else
              {
              
                  res.sendStatus(204);
                  
              }
  })});


/*//////////////////////
        ORDER EQUIPMENT
*///////////////////////


app.get('/productType', function(req, res){

    // let query1 = "SELECT * FROM Users;";
    let query1;

    // If there is no query string, we perform simple SELECT
    // if(req.query.fname === undefined){
    query1 = "SELECT * FROM ProductType";
    // }

    // else{
    //     query1 = `SELECT * FROM Orders WHERE firstName LIKE "${req.query.fname}%"`
    // }



    // This is for the drop down menu, the same for both cases
    let query2 = "SELECT productTypeID FROM ProductType;";

    db.pool.query(query1, function(error, rows, fields){
         
        // {data: rows}
        // This sends the renderer an object
        // where 'data' is equal to 'rows' we 
        // got from the query
        let productTypes = rows;

        // res.render('partials/users',{data: users});
        db.pool.query(query2, (error, rows, fields) => {

            // Save user IDs
            let productTypeIDs = rows;
            return res.render('partials/productType', {data: productTypes, productTypes: productTypeIDs});
        })



    })

});



/*
    LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});

    
// flip3