# Release Notes
## v0.6.2
### The Color My Memory Release

This release adds Theme Color support to the Memory Map Viewer. It is still somewhat experimental in that I had to "guess" some of the available theme colors to see if they worked in all situations. It is very likely that some will look very bad. Do not use the RED Theme that comes with VSCode unless you want to go blind. Also added was the number of bytes that are taken up by a segment when the hover displays the memory range. Thanks to Marcelo Cabral for that great idea!

We also cleaned up some of the error checking that takes place when the extension starts up to assist in making sure that everything is configured properly. We also change the startup of the extension to be when you open VSCode instead of when you open your "first" extension supported file. This has given a much better experience so far, at the cost of increasing the time it takes to open VSCode. I would have liked to have added this as an option in the preferences, but I have not seen where we can do that as it is driven by the configuration of the project.

Till next time. Thanks for using the Extension.

For a full list of changes, please see the projects [History](HISTORY.md) file.

We hope you are enjoying the Extension, and if you find any bugs, or would like to see a certain feature added, please feel free to use our [Trello Board](https://trello.com/b/vIsioueo/kick-assembler-vscode-ext#) or the [Gitlab](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues) issues page.

Enjoy!
