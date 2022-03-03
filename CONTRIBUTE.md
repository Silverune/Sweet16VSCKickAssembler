### Supported VSCode Protocols

VSCode = ^1.43
Language Server = 3.15.3
### Building A Release

The following command will publish a new release up to the VSCode Marketplace with the current Version in package file. It is important to have this updated before you release. You cannot re-publish the same release, you will receive an error.

```
> vsce publish --baseContentUrl https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/blob/master --baseImagesUrl https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/raw/master
```

### Building A Local Copy

A local copy will create a VSIX file that you can use for sharing with other people without publishing. It will let you install the extension locally on your computer. This is helpful to do when you are testing features our with others, or just want to make sure that the extension installs and works prior to publishing.

```
> vsce package --baseContentUrl https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/blob/master --baseImagesUrl https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/raw/master
```

### Develop and Test locally
#### Prerequisities
- Fork https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext
- Clone your fork locally
```
> git clone https://gitlab.com/<yourgitlabuser>/<yourfork>.git
```
- Install npm modules
```
> cd <yourfork>
> npm install
```

#### Debugging The Extension

- open the fork folder in VSCode itself
- select `compile` from the NPM Scripts section of the files Tab (or press crtl-shift-b) 
- change to the Debug-Tab and Start "Client+Server"
- another VSCode Window will open which uses your just compiled local fork extension
 
### Extension Resources

Here are some additional links to help you get started with understanding how to write extensions and language servers for Visual Studio Code.

- https://code.visualstudio.com/api/language-extensions/language-server-extension-guide
- https://github.com/Microsoft/vscode-extension-samples/tree/master/lsp-sample
