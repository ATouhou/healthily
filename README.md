# Healthily
A service that helps maintaining a healthy life.

## What can I use Healthily for?
  * Log weight, food and exercise
  * Create and share custom recipes
  * Create and share plans and goals
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
### Backend
The backend is a *Node/Express* application with a **RESTful API** that is composed of the following components:

  * **Mongoose**: a Node wrapper for MongoDB
  * **Baucis**: creates RESTful APIs using Mongoose models
  * **NutriDB**: For foods and nutrients details, we use a MongoDB version of [NutriDB](http://nutridb.org/download) converted using an included Grunt task  (`grunt nutridb`), we will also provide the `mongodump` of the database soon to make it easier to build the project. The task will conform to the document-oriented nature of MongoDB as opposed to the relational SQL model, so nutrients information are included as sub-documents within each food document instead of having separate collections for foods and nutrients. However we still store nutrient definitions (descriptions, tag names, DRIs) in a separate collection to eliminate redundancy.

### Frontend
The current frontend is intended for use on a desktop web browser and is built using *Bootstrap 3* and *AngularJS*. It will support offline using IndexedDB and AppCache.

More frontends are planned:

  * a Firefox OS webapp
  * a native app for Android

## Getting started
### Building
  1. First, make sure you have [Node and NPM](http://nodejs.org) installed
  2. Clone this repository: `git clone https://github.com/forabi/healthily.git`
  3. `cd` to the local clone and execute `npm install`, this will install all the node modules required by the project
  4. `grunt build:prod` will build the project for production environments. Check out the other Grunt tasks included in `Gruntfile.js` and `/tasks` folder.

### Contributing

#### Reporting bugs

[TODO]

#### Translating

[TODO]

#### Documenting

[TODO]

##License
GPLv2