# Challonge TO

Challonge TO is a web app designed to help tournament organizers run their Challonge brackets more smoothly.
Inspired by Challonge Match Display.


## Getting Started

You'll need to grab your Challonge API Key. 
Don't have one? Head [here](https://challonge.com/settings/developer).

Create your bracket on Challonge and add participants.
Then, head [here](http://challonge-to.herokuapp.com/#/). You're all set.


### Prerequisities

You'll need Node and NPM installed. 

### Installing

You can run this locally, and are welcome to make changes.

Fork this repository and go navigate to it.

```
git clone https://github.com/novacourtois/challongeTO && cd challongeTO
```

Install all the dependencies.

```
npm install
```

A Challonge API Key is required for all service calls, so ensure that the var CHALLONGE_API_KEY is set in your local environment.
Deployments on Heroku can have this defined in the Heroku properties, and local deployments can be started with an optional parameter.

Windows; setting an api key for the life of the current terminal session. startup.bat can be edited to manage this for you.
```
setx CHALLONGE_API_KEY <your-api-key>
```

Alternatively, you can edit the server.js configuration, just ensure that your api key is never included in a public git commit.
```
var CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY || 'INSERT API KEY HERE';
```

Start the server.

```
node server.js
```

Head on over to http://localhost:8080/ to see your local deployment.

## Built With

* AngularJS
* Node.js
* Challonge API
* Bootstrap
* SCSS
* Heroku

## Contributing

Feel free to send me some pull requests.
Help is definitely appreciated.

## Authors

* **Nova Courtois** - *Initial work* 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

*  Inspired by Challonge Match Display
*  Thanks to the ATX Melee community for early testing and feedback.
* etc
