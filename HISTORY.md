
## Kick Assembler Visual Studio Code Extension for C64
### History Of Changes
## v0.6.2
### Changes
- [Issue 91](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/91) use theme colors when draing memory map view
- [Issue 88](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/88) better error handling and start extension when vscode opens
## v0.6.1
### Changes
- `.printnow` support added
## v0.6.0
### Changes
- [Issue 18](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/18) added new Memory Map View for Assembled Programs
## v0.5.6
### Fixed
- [Issue 86](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/86) libdir path failed to find files
## v0.5.5
### Changes
- support for the Kick Assembler option to produce [Byte Dumps](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/94)
- added support for [Reference Provider](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/92/diffs#4d1b91c5d30469849735c2ef4f4ea8a5e1eaa00b)
- added support for [Mega65](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/93)
### Fixes
- [Issue 57](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/57) scoped symbols not showing anything on hover
## v0.5.3
### Changes
- change made to ensure that `!` was triggering autocompletion
### Fixes
-[Issue 79](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/79) - Missing hover description on first line
- [Issue 80](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/80) - Immediate decimal value gets autocompleted with var, const, labels, etc.
- [Issue 83](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/83) - When renaming a var, const etc. by adding a number, autocompletion picks up vars, consts, labels etc
## v0.5.2
### Changes
- all keyboard shortcuts will now only activate when editing a kickassembler file or selecting a file from the Explorer (matched by extension) 
### Fixes
- [Issue 84](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/84) non kickassembler source files were being deleted when being compiled and there was no output folder specified on settings
## v0.5.1
### Changes
# added a few more missing directives, symbols from the tmLanguage file
# some code cleanup

## v0.5.0
### Changes
+ support for 5.17 which removes need for `.asminfo.txt` file (now uses stdout)
### Fixes
+ [Issue 77](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/77)number of missing directives in the tmLanguage file resulted in some not highlighting
+ [Issue 74](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/74)better support for macOS when choosing to run `binary` or `.app` for emulator runtime
## v0.4.14
### Changes
+ update vscode libraries to 3.15 protocol
### Fixed
+ `#if` was not highlighting properly when used with `!` and `@`
## v0.4.13
### Changes
+ small update for .print handling
+ added new setting for using a different Main class for different kickass jar files
## v0.4.12
### Fixed
+ [Issue 60](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/60) - strange issue with .print and .break
## v0.4.11
### Fixed
+ corrected error for autostarting on windows using the F6 key -- mistakenly removed "-autostart" option :(
## v0.4.10
### Fixed
+ [Issue 71](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/71) - intellisense continually pops up without typing character first
+ [Issue 69](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/69) - literal values not showing up on parameters for pseudocommands
## v0.4.9
### Changes
+ [removed keepWorkFiles setting ](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/67)
### Fixed
+ [Issue 66](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/66)

## v0.4.8
### Fixed
[Issue 63](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/63)

## v0.4.7
### Changes
[kick 5.16 version check](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/74)
[support for ascii encoding](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/75)
### Fixed
[Issue 38](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/38)

## v0.4.6
### Changes
+ [Collect symbol namespaces from .namespace if they have the same name to avoid multiple same symbols and suggestions](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests?scope=all&utf8=%E2%9C%93&state=all)
### Fixed
+ [Issue 58](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/58) - errors on imported files for new KickAss 5.13

## v0.4.5
### Changes
+ [updated kick version check to 5.13](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/65)
+ [limited support for pseudocommands (autocomplete only)](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/64)
+ [support for multiple definitions](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/67)
### Fixed
+ [fixed keepWorkFiles setting](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/63)
+ [fixed `.print` support ghosting](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/issues/59)

## v0.4.4
### Changes
+ [support for parenthesis on `.print` directive](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/62)
### Fixed
+ [Issue 53](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/53) - errors when saving (removed keepWorkFiles setting)

## v0.4.3
### Changes
+ [Automatically create/delete/adjust breakpoints when inserted manually](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/60)
### Fixed
+ [Issue 61](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/61) bug fix on manually inserted `.print`
+ fix errors when startup setting was not located in the workspace folder

## v0.4.2
### Changes
+ [allow addition of manual adding or changing break/print](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/60)
### Fixed
+ [issue 51](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/51) - opening empty file with no startup causing errors
+ [issue 52](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/52) - fix errors with new/empty files

## v0.4.1
### Changed
+ [multilabel support](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/58)
+ added delay setting for onChange trigger setting
+ added message to let developer know that the extension is ready (activated) and what version is running
+ removed the initial build message to make it a little less chatty
+ [support for external breakpoints](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/57)
### Fixed
+ [vscode slow and producing many errors](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/43)
+ [fixed build errors when vscode first starting and no file opened](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/47)
+ [CompletionProvider scope error occuring when new lines added to open file](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/46)
+ [confirm active file or startup before building](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/44)
+ [ignore whitespace in pure dividers as well](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/56)
+ [multiline comments broke symbol display](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/55)
### Known Issues
+ [imported files in a STARTUP project will not properly assemble changes until it is saved](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/48)

## v0.4.0
### Changed
+ [added startup control file and changed default key bindings](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/35)
+ [added some missing syntax highlighting](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/47)
+ [support directive on same line after labels](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/48)
+ [support namespaces and scope](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/50)
### Fixed
+ [hover bug fixes for labels](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/49)
+ [Issue 41](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/41) fix missing directives on hover
+ [Issue 40](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/40) out of scope macros should not be available in completion provider

## v0.3.3
### Changed
+ [added definition provider for goto support](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/44)
+ [added more support for -libdir command](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/37)
+ [added goto support for imports](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/-/merge_requests/46)
### Fixed
+ [Issue 33](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/33) switching tabs on opened files breaks everything
+ [Issue 30](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/30) space in paths on emulator and debugger could cause problems on mac/linux

## v0.3.2
### Fixed
+ small bug in the version checker that was added in 0.3.1

## v0.3.1
### Changed
+ debugger uses `-symbols` not `-vicesymbols`
+ named labels `label:` where being suggested for preprocessors
+ kick assembler version checking
+ support additional library paths
### Fixed
+ optional vice symbols
+ fixed emulator option not being used
+ removed `-a` parameter for emulator
+ fix backslashes in strings breaking completion
+ prevent word suggestion on empty file lists

## v0.3.0
### Changed
+ added support for 65c02, DTV and Illegal opcodes
+ optional parameter completion hints
+ better output setting support for relative and fixed paths
+ [Issue 27](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/27) completion for filenames when using `.import` or `#import`
+ [Issue 17](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/17) support for .eval var

### Fixed
+ [Issue 26](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/26) code completion for macros and functions was broken
+ [Issue 29](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/29) supress intellisense and code completion inside remarks/comments
+ [Issue 32](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/32) building when focused on output window produced errors
+ [Issue 34](https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/34) empty output file setting would cause issues

## v0.2.7
### Changed
+ added new version info to the asminfo file for future use
+ better overall formatting for hovers
### Fixed
+ issue #24 -- symbols with same name only showing the first type registered (hover refactoring)
+ fix preprocessor completion items not showing because of name mismatch

## v0.2.6
### Changed
+ some small changes to the code snippets for whitepace and value completion for .var and .label directives
+ changes to the README to help developers interested in the extension to see all of the new features that have been added
### Fixed
+ fix code snippets to include completion items -- not that this also requires that the editor setting "editor.suggest.snippetsPreventQuickSuggestions" is set to FALSE

## v0.2.5
### Changed
+ code snippets and new directive support (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/27) - Lubber
+ snippets for functions and macros (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/28) - Lubber
+ change icons for labels to match in the outline view
### Fixed
+ named labels hover fixed (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/29) - Lubber

## v0.2.4
### Fixed
+ fixed issue #22 where files could not be read on macos and linux (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/22)

## v0.2.3
### Fixed
+ remove extra hover lines (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/26) - Lubber

## v0.2.2
### Changed
+ detect inline comment as remark and handle original value (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/23) - Lubber
+ support code folding (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/25) - Lubber
+ add missing built-in functions (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/24) - Lubber
### Fixed
+ fix path issue on mac/linux on builds (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/2)

## v0.2.1
### Fixed
+ missing semver dependency on new language server libraries

## v0.2.0
### Changed
+ add new default options C64Debugger (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/3) - Lubber
+ new output directory option when compiling
+ added support for .var directive
+ hover cleaned up for some symbols like .const, .var and .label
+ show correct directive for label symbols (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/6) - Lubber
+ recognize high/low literals (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/7) - Lubber
+ add support for single line comments and and correct remark overlapping (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/9) - Lubber
+ add option to determine when to assemble (onChange or onSave) (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/12) - Lubber
+ add badge info to readme (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/10) - Lubber
+ support for -debugdump on compile (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/13) - Lubber
+ added better support for built-in Constants, Macros and Functions (Hover and Completion)
+ support for pre-processor boolean variables - Lubber
+ support for high/low triggers - Lubber
+ dont provide intructions, but only symbols/macros/etc when a directive was the previous token - Lubber
+ recognize and deny completion inside line comments or string definitions - Lubber
+ fix function/macro parameter hover (last param missed comma separation) - Lubber
+ show docs, examples and comments for completion items (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/19)- Lubber
+ correctly fetch base symbol with methods added (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/22) - Lubber
+ hovers show which file symbols were imported from
### Fixed
+ thanks to Lubber for some general cleanup of code
+ make sure that symbols are updated on outline and in completion (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/issues/13) - Lubber
+ fix undefined errors on hover (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/5) - Lubber
+ fix comments on functions (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/8) - Lubber
+ removed lorem ipsum from opcode hover (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/11) - Lubber
+ upgraded language server (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/20) - Lubber
+ hover over zero values was broken (https://gitlab.com/retro-coder/commodore/kick-assembler-vscode-ext/merge_requests/21) - Lubber

## v0.1.15
### Changed
+ mistaken package update with version change (no actual changes)

## v0.1.14
### Changed
* added hover for macros and functions with comments
* some coverage for parameters on hover
* better symbol coverage
### Fixed
* command pallette entries missing (thanks Wanja Gayk for finding this)

## v0.1.13
### Changed
* added command to run last build (ctrl+f5)
* added command to debug last build (ctrl+f6)
### Fixed
* validate settings on server
* fixed output stealing focus on compile
* better settings validation
* better remark searching
