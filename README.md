# ChristmasTreeController

## The Raspberry Pi script for Christmas-In-The-Park

For more details on the project, see [Christmas in the Park](https://github.com/Architecty/Christmas-in-the-Park).

This project is a meteor-based web worker that sits on the target Christmas Tree. It controls an arbitrary number of christmas lights via a series of IR LEDs. 

To use this project, first set up the [primary meteor project](https://github.com/Architecty/Christmas-in-the-Park). Then, on a raspberry pi, do the following: 

1. Install Raspbian Stretch on your pi.
2. Clone this repo onto your project
3. Install LIRC using [prasanthj's instructions](https://gist.github.com/prasanthj/c15a5298eb682bde34961c322c95378b).
4. Move lircd.conf from this repo into the LIRC directory, and restart LIRC. This will give you access to the Homestarry remote control keybindings. 
5. Run `npm install` on the repo.
6. Edit config-sample.js with your values, and run `cp config-sample.js config.js`.
7. Start the script using [forever](https://www.npmjs.com/package/forever)
