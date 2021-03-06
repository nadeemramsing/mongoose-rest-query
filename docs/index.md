# Mongoose Rest Query

## Overview

Mongoose Rest Query makes the creation of rest api in mongoose a breeze. It automatically create CRUD routes up to two levels deep and provide a built-in mechanism to connect to multiple mongo databases.

## Installation

```sh
npm install mongoose-rest-query --save
npm install mongoose-auto-number --save
```

## Quick Start

Consider the following snippet

```js
const express = require('express');
const mongoose = require('mongoose');
const mrq = require('mongoose-rest-query')

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    firstname: String,
    lastname: String,
    age: Number
});

const models = {
    User: userSchema
};

mrq.config.modelSchemas = models;
mrq.config.dbPath = 'mongodb://localhost/restifydb';

const app = express();

app.use(mrq.db);

const restify = mrq.restify;

app.use('/api/users', restify('User'));

app.listen(9000, () => {
    console.log('Server is listening on port 9000');
});
```

The above snippet automatically generates the following api endpoints

- GET    http://localhost:9000/api/users -> List all users (subject to filter criteria) 
- POST   http://localhost:9000/api/users -> Create new user or users, can accept an object or array
- DELETE http://localhost:9000/api/users -> Delete all users (subject to filter criteria)
- GET    http://localhost:9000/api/users/count -> Get total count (subject to filter criteria)
- GET    http://localhost:9000/api/users/:id -> Get user by id (can apply populate or select in query)
- PUT    http://localhost:9000/api/users/:id -> Update user by id (also accept partial object)
- DELETE http://localhost:9000/api/users/:id -> Delete user by id
- POST   http://localhost:9000/api/users/aggregate -> Accept mongo aggregrate pipelines as body for rich aggregation

Note: additional crud routes are generated if the object contain a field which is of type array of objects

## Query parameters

In addition to the routes generated, certain endpoints also accept query parameters which provide a rich mechanism for filtering, sorting and paginating.

- Filtering
    - GET /api/users?email=adarsh@github.com  -> exact match
    - GET /api/users?email=~adarsh  -> containing
    - GET /api/users?age=>20  -> greater than 20
    - GET /api/users?age=>=20  -> greater than or equal 20
    - GET /api/users?age=<20  -> less than 20
    - GET /api/users?age=<=20  -> less than or equal 20
    - GET /api/users?age=>10&age=<=20  -> greater than 10 and less than or equal 20
    - GET /api/users?age=!=20  -> not equal 20
    - GET /api/users?age=!in=20,21,22  -> not equal 20, 21 or 22
    - GET /api/users?age=in=20,21,22  -> equal 20, 21 or 22

- Sorting
    - GET /api/users?sort=email  -> sort by email asc
    - GET /api/users?sort=-email  -> sort by email desc

- Fields projection
    - GET /api/users?select=email  -> return only email

- Mongoose Populate
    - GET /api/users?populate=referenceField  -> Populate the referencField

- Pagination
    - GET /api/users?limit=10  -> list only 10 users
    - GET /api/users?limit=10&skip=0  -> list only first 10 users
    - GET /api/users?limit=10&skip=10  -> list the 11th to 20th users


## Activating the multi database mode

In order to use the multi db mode, we need to have a strategy to identify request in order to use the correct database. In the example below, an indentifier shall be used in the request header (x-client-id)

Consider the following snippet

```js
const express = require('express');
const mongoose = require('mongoose');
const mrq = require('mongoose-rest-query')

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    firstname: String,
    lastname: String,
    age: Number
});

const models = {
    User: userSchema
};

mrq.config.modelSchemas = models;
mrq.config.multiDB = true;

const app = express();

//middleware to check client id and set to correct db path
app.use(function(req, res, next){

    if(req.headers['x-client-id'] === 'client1')
        req.headers['x-client-mongodb-path'] = 'mongodb://localhost/client1';
    
    else if(req.headers['x-client-id'] === 'client2')
        req.headers['x-client-mongodb-path'] = 'mongodb://localhost/client2';
    
    else
        res.status(401).send('Invalid client id');

    next();
});

app.use(mrq.db);

const restify = mrq.restify;

app.use('/api/users', restify('User'));

app.listen(9000, () => {
    console.log('Server is listening on port 9000');
});
```


## Accessing the mongoose model in a custom route


```js

app.get('/api/custom', function(req, res){

    const User = mrq.model(req, 'User'); //this return the mongoose model

    User.find(function(err, users){

        if(err)
            res.status(500).send(err);
        else
            res.send(users);
    });

});

```

