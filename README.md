# Cophonia
Collaborative music notation software for browsers.


## Getting started
Following are instructions to set up everything on your local machine for any of your purposes

### Prerequisites
All you need is to install Node.js first, you can do so here:
https://nodejs.org/en/download/

### Installing
Installing dependencies to get everything running is simple, just clone the repository to your machine, find the folder where the file "dependencies.json" exists, open a command prompt and run the following code:
```
npm install
```

### Start up local server
Simply repeat the last steps, and instead write the following code:

(Windows)
```
set DEBUG=music* & npm start
```

Open up the browser on localhost port 3000, and evereything should be up and running.

## Controls
Here are some basic controls (all input is done via keyboard for now):
* Arrow keys to move the marker
* Numbers to define the note's duration
* Enter to place a note
* Spacebar to insert a beat
* Backspace to delete a note
* Shift + Delete to delete a Bar/Measure
* Shift + T to change the Time Signature
* Shift + K to change the Key
* T + Arrow Keys to tie beats
* T + Delete to demolish ties
* . to add augmentation dots
* (+) and (-) for accidentals
* K is for music playback

## Built with

* [Node.js](https://nodejs.org/en/) - Server Language used
* [Handlebars.js](https://handlebarsjs.com/) - View Engine used
* [webaudiofont](https://github.com/surikov/webaudiofont) - Used for real-time music playback
* [Bravura](https://github.com/steinbergmedia/bravura) - Font from the software Dorico, which is a reference font for Standard Music Font Layout (or SMuFL)

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE v3.0 - see the [LICENSE.md](LICENSE.md) file for details.

## Keeping up to date

I suggest you keep up to date with the feature, develop and release branches if you want the most updated (and bleeding) content.
