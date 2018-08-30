# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased](https://github.com/atomist/slack-messages/compare/0.12.1...HEAD)

### Changed

-   **BREAKING** Reorganize into more standard Node.js package layout.
-   Update TypeScript and its configuration and fix issues.
-   Update TSLint configuration and fix issues.
-   Update dependencies.
-   Update README.
-   Make sure all functions explicitly declare return type.
-   Recognize links that are not expressed as markdown. [#16](https://github.com/atomist/slack-messages/issues/16)

### Removed

-   Travis CI configuration and scripts.
-   Remove deprecated RugMessages.
-   Remove lodash dependency.

## [0.12.1](https://github.com/atomist/slack-messages/compare/0.12.0...0.12.1) - 2017-09-20

### Added

-   Add index so you can import SlackMessages with `...from "@atomist/slack-messages"`
-   Publish master and PR builds to Atomist NPM registry.

## [0.12.0](https://github.com/atomist/slack-messages/compare/0.11.0...0.12.0) - 2017-09-20

### Removed

-   **BREAKING** `rugButtonFrom` and `rugMenuFrom` have been removed as well as

## [0.11.0](https://github.com/atomist/slack-messages/compare/0.10.0...0.11.0) - 2017-08-17

### Added

-   Support for option_groups in menus

## [0.10.0](https://github.com/atomist/slack-messages/compare/0.9.0...0.10.0) - 2017-08-17

### Added

-   New function `rugMenuFrom` in SlackMessages for building Slack combo

## [0.9.0](https://github.com/atomist/slack-messages/compare/0.8.0...0.9.0) - 2017-08-14

### Added

-   Add standard formatted Slack messages and ResponseMessage for success,
-   Deprecate renderError

## [0.8.0](https://github.com/atomist/slack-messages/compare/0.7.0...0.8.0) - 2017-08-14

### Added

-   Standard Slack success, error, and warning messages and colors

### Deprecated

-   renderError and renderSuccess have been replaced by errorResponse

### Fixed

-   Improved Markdown to Slack markup conversion [#17](https://github.com/atomist/slack-messages/issues/17)

## [0.7.0](https://github.com/atomist/slack-messages/compare/0.6.0...0.7.0) - 2017-07-04

### Breaking

-   Moved emptyString from SlackMessages to Common

### Added

-   Support conversion of GitHub markdown to Slack markdown

## [0.6.0](https://github.com/atomist/slack-messages/compare/0.5.1...0.6.0) - 2017-05-16

### Fixed

-   Enforce message validation to ensure rendered buttons can be clicked:

## [0.5.1](https://github.com/atomist/slack-messages/compare/0.5.0...0.5.1) - 2017-05-15

### Fixed

-   Replace special characters globally: [#9](https://github.com/atomist/slack-messages/issues/9)

## [0.5.0](https://github.com/atomist/slack-messages/compare/0.4.0...0.5.0) - 2017-05-15

### Added

-   Added explicit `atChannel` that renders as `@channel` in Slack

### Changed

-   **BREAKING** Renamed `atUser` to `user`
-   **BREAKING** Renamed `atChannel` with channel id, channel name to `channel`

### Fixed

-   Fixes [#8](https://github.com/atomist/slack-messages/issues/8) (TypeError: key.charAt is not a function)
-   Slack helper function will render empty string when given undefined values

## [0.4.0](https://github.com/atomist/slack-messages/compare/0.3.1...0.4.0) - 2017-05-10

### Fixed

-   **BREAKING** Flatten module structure.  You will need to update your

## [0.3.1](https://github.com/atomist/slack-messages/compare/0.3.0...0.3.1) - 2017-05-10

### Fixed

-   **BREAKING** `ButtonSpec` should be an interface

## [0.3.0](https://github.com/atomist/slack-messages/compare/0.2.0...0.3.0) - 2017-05-10

### Changed

-   **BREAKING** `Action` fields `name` and `type` are now required in order

## [0.2.0](https://github.com/atomist/slack-messages/compare/0.1.0...0.2.0) - 2017-05-09

### Added

-   Add `renderError` and `renderSuccess` generic success and error rug messages

### Fixed

-   `SlackMessage` `text` field should be optional
-   `Attachment` `text` field should be optional
-   `ActionConfirmation` fields should be optional
-   Add missing `author_icon` and `callback_id` to `Attachment`

## [0.1.0](https://github.com/atomist/slack-messages/releases/tag/0.1.0) - 2017-05-09

### Added

-   Add Slack message rendering and most common rendering helper functions
-   Add support for Slack action buttons that execute rug instructions
