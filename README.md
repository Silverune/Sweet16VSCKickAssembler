# kick-assembler-vscode-ext 
![](https://vsmarketplacebadge.apphb.com/version-short/paulhocker.kick-assembler-vscode-ext.svg)
![](https://vsmarketplacebadge.apphb.com/installs-short/paulhocker.kick-assembler-vscode-ext.svg)

A [Kick Assembler](http://www.theweb.dk/KickAssembler/Main.html#frontpage) extension for [VSCode](https://code.visualstudio.com/).

A Core [Kick Assembler](http://www.theweb.dk/KickAssembler/Main.html#frontpage) extension for [VSCode](https://code.visualstudio.com/).

## Additional Feature Summary
* Specify command arguments to Kick Assembler `assemblerArgs`
* Override the default output file with one specified `outputFile` - useful if using `.segments` in Kick which create files from within the source
* Code completion also uses the `-libdir` options when attempting to complete
* Also creates hidden field populated from root drectory as fallback to ease development when files not all kept in same directory.

## New System Reminders
* Switch to remote branch `dev-core`
* In the Terminal make sure to update: `npm install`

## Feature Summary
* build, run and debug commands
* support for emulators like [VICE](http://vice-emu.sourceforge.net/) and the [C64Debugger](https://csdb.dk/release/?id=170893)
* auto completion (intellisense)
* syntax highlighting
* error checking
* hover Support
* code outline
* code snippets
* illegal opcode support

## Feature Details
The following features are currently working relatively well.

### Editing

This extension provides a lot of features to make your coding life easier with Kick Assembler.

#### Syntax Highlighting

Syntax highlighting for every element in your code.

![](/images/syntax-highlighting.png)

#### Code Snippets

Code snippets for built-in and personal functions and macros.

![](/images/snippets.gif)

#### Code Completion

See all of your variables, macros and functions from your code and included source code.

![](/images/code-completion.gif)

#### Code Scoping

Support for Namespaces and Scopes in all providers, including `.filenamespace`. 

![](/images/scoping.gif)

Completion Provider according to cursor position first.

![](/images/namespace-cursor-position.png)

#### Code Outline

See an outline of your current source code, and jump to those items in your code.

![](/images/outline.gif)

Including any Scoping or Namespaces.

![](/images/document-system.png)

#### Imported File Support

Code completion for all of your code files for the `.import` and `#import` directives.

![](/images/fileimport.gif)

Any imported files will have their variables, macros and functions available in auto completion for your current file. The heading of the hover will let you know which file the item was imported from.

![](/images/include-file-information.gif)

#### Error Checking

Real time syntax checking of your code by using information from the Kick Assembler compiler. 

![](/images/error-checking.gif)

#### Breakpoints And Logging

The ability to add breakpoints and log messages using the built-in capabilities of the editor.

![](./images/breakpoints.gif)

#### Code Folding

![](/images/folding.gif)

### Hover Support

Hover support has been added to help you with your daily coding. From simple things like a comment on your variable or macro, to more useful things like variable values and even support to show you high and low byte values in your code.

#### Comments

Most comments for defined variables, macros and functions are captured and displayed as a comment. There is some very basic MARKDOWN support so that you can include things like parameters in your comments.

![](/images/comments.gif)

#### Values

Most values will give you comments about the variable itself, but also decimal, hex and binary values as well.

![](/images/ka-hover2.gif)

#### Hi/Lo Byte Values

Useful when creating jump tables.

![](/images/ka-hover3.gif)

#### Additional/Illegal Opcodes

Additional opcodes for 65c02, DTV and Illegal opcodes supported. Be a Rebel!

![](/images/opcodes.gif)

#### Support For `-libdir` Option

Work with external code libraries in your project, and then ensure they are added to your compile using the `-libdir` parameter on Kick.

![](/images/library-paths.png)

Support for Plugins

![](/images/java-plugins.png)


## TODO
See [the Roadmap](/ROADMAP.md)

## Release Notes
See [the Release Notes](/RELEASE.md) for a summary of what was changed.

## History
See [the History](/HISTORY.md) for a more detailed breakdown of everything that has been done to the extenstion.


## Acknowledgements
Thanks to [SWOFFA](https://csdb.dk/scener/?id=984) for his work on the tmLanguage file for syntax highlighting from his [Sublime Package](https://github.com/Swoffa/SublimeKickAssemblerC64).

I would also like to recognize [Thomas Conté]() for his work on the original [vscode-kickassembler](https://github.com/tomconte/vscode-kickassembler) extension for VSCode that inspired me to start this project.

### Known Issues

### Contributing
Bug reports, fixes, and other changes are welcomed. The [repository](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext) is on [GitLab](https://gitlab.com), and issues and pull requests are accepted. Check the [contribute](CONTRIBUTE.md) file on information of what the project needs, and how to run the extension locally for development and testing

### Requirements
* [Java Runtime (openjdk)](http://jdk.java.net/14/)
* [Kick Assembler](http://www.theweb.dk/KickAssembler/Main.html#frontpage)
* [VICE](http://vice-emu.sourceforge.net/index.html#download)
* [C64Debugger](https://sourceforge.net/projects/c64-debugger/files/latest/download)