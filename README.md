# Snake
Computer game for one player. The player controls a long, thin creature, resembling a snake. "Snake" must eat "food" and should avoid foreign objects (its body, stones, edges of the field).

This version Snake has a levels. Each level adds a **random walls**, their number depends **level * 5**. Every tenth level is the speed increases and all the walls are cleaned. Going to the next level occurs when the length of the snake became more than the number of boxs can fit on the field in its width (size box - 12, when a width of the field of 480 - **max size of the snake 40**)
```
node: 6.5.0,
npm: 3.10.3
```

## Environment
You need grunt and http-server packages globaly installed
```
npm -g install http-server
npm -g install grunt-cli
```

## Building
Go to the project dir and run
```
npm i
grunt
```

## Launch
Go to the project dir (dist) and run
```
http-server
```
Go to browser [localhost:8080](localhost:8080)

