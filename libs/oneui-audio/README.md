# OneUI Audio

A WASM library to process audio file into which the browser can play.

The silk sdk library comes from a clone of [kn007/silk-v3-decoder](https://github.com/kn007/silk-v3-decoder).

# How is it work?

We use emscripten to compile decoder to wasm and a js wrapper, then emscripten will provide a virtual filesystem for us to input file and take out the ourput.
So we can set an output file and take the result from virtual filesystem. That's the way OneUI using.

# Build

Use Emscripten to build. Then the compiled js in `pkg/` need to be moved to `oneui/src/utils/silksdk.js` to work with OneUI.

# Contribution

Any PR are welcomed. Feel free to make this tool better!

# Licence

This library is using CC0 Public Licence, which means you can do anything without permission.

![CC0 - 1.0](https://i.creativecommons.org/p/zero/1.0/88x31.png)
