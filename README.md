# runbrackets.com

[runbrackets.com](runbrackets.com) is a web app designed to help tournament organizers run their Challonge brackets more smoothly.
Inspired by Challonge Match Display.

Formerly named (ChallongeTO)


## Getting Started

If you're a TO, you 'll need to grab your Challonge API Key. 
Don't have one? Head [here](https://challonge.com/settings/developer).

Create your bracket on Challonge and add participants.
Then, head [here](http://www.runbrackets.com/signup). You're all set.

If you're just a participant, just grab a Challonge URL, like challonge.com/letstrythisout, and you're good. 

### Prerequisities

You'll need Node and NPM installed. 

### Installing

You can run this locally, and are welcome to make changes.

Fork this repository and go navigate to it.

```
git clone https://github.com/novacourtois/runbrackets && cd $_
```

Install all the dependencies.

```
npm install && bower install
```

Add your Challonge API Key to the /server/app.js file.
Mine is an environment variable in Heroku. You can add yours on line 10.

```
process.env.CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY || 'INSERT API KEY HERE';
```

Get the server up.

```
grunt serve
```

Head on over to http://localhost:9000/ to see your local copy.

## Built With

* AngularJS
* Node.js
* MongoDB
* Challonge API
* Angular Material
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
