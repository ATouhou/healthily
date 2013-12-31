# Healthily
A node.js app that helps maintaining a healthy life.

## What can I use Healthily for?
  * Log weight, food, exercise
  * Create custom foods and meals
  * Add phased plans and set specific goals
  * Motivate: users can:
    * follow each other
    * optionally share activities with followers
    * win badges for commitment

## Features
  * Record weight, meals and snacks.
  * Create custom foods and share them. [TODO]
  * Record exercises. [TODO]
  * Create workout sets and share them. [TODO]
  * Win badges for commitment.
  * Maintain a streak to keep motivated.
  * Create phased weight loss plans and set weight/exercise goals.
  * Follow people to get their activities in your stream.

## Components
Healthily is a node/express/mongoose app that uses the following components:

### Backend
  * **Node.js**
  * **Express Framework**
  * **Mongoose**: a Node.js wrapper for MongoDB
  * **NutriDB**: For food descriptions and nutrients information, we use a MongoDB version of [nutridb.org database](http://nutridb.org/download) converted first to SQLite3 using [mysql2sqlite.sh](https://gist.github.com/943776) then to MongoDB using an included node script (`nutridb_import.js`), we will also provide the `mongodump` of the database soon. The script makes use of the document-oriented nature of MongoDB as opposed to the relational SQL model, so nutrients information are included as sub-documents inside food document instead of having separate collections (however we still store nutrient definitions (descriptions, tagnames, DRIs) in a separate collection).

### Frontend
  * **Angular JS**: A JavaScript frontend framework
  * **Bootstrap 3**
  * **Underscore.js**
  * [TODO]...

## Getting started
  1. First, make sure you have node.js and npm (node package manager) installed
  2. Clone this repository using git
  3. `cd` to the local clone and execute `npm install`, this will install all the node modules required by Healthily
  4. `npm start` will start the server at port 3000.

##License
GPLv2
