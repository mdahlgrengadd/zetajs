# Changelog

## 1.2.0
* Added zetaHelper TypeScript library to combine commonly used code
  * used for examples: convertpdf, letter-address-tool, letter-address-vuejs3, ping-monitor, vuejs3-ping-tool
* disabled HTML page scrolling when the mouse cursor is above the canvas
* examples:
  * improved example layouts and zooming
  * improved initialisation
  * simplified and unified code
  * examples: fixed crash on non uniformly formatted selections
  * using Chromium's "File System Access API" in the web-office exmaple
* many small fixes

## 1.1.0
* Let zetajs return unwrapped ANY representations
  * Technically backwards-incompatible with old code that relied on unspecified implementation details, like relying on receiving wrapped rather than unwrapped UNO ANY representations.
* Converted most examples to NPM

## 1.0.3
* Fix version number clash on NPM

## 1.0.2
* Add SPDX-License-Identifier

## 1.0.1
* Fix domain name

## 1.0.0
* Initial release
