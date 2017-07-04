# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

[Unreleased]: https://github.com/atomist/slack-messages/compare/0.7.0...HEAD

## [0.7.0] - 2017-07-04

[0.7.0]: https://github.com/atomist/slack-messages/compare/0.6.0...0.7.0

### Breaking
-  Moved emptyString from SlackMessages to Common

### Added
-  Support conversion of GitHub markdown to Slack markdown

## [0.6.0] - 2017-05-16

[0.6.0]: https://github.com/atomist/slack-messages/compare/0.5.1...0.6.0

### Fixed
-  Enforce message validation to ensure rendered buttons can be clicked: 
   [#10](https://github.com/atomist/slack-messages/issues/10)

## [0.5.1] - 2017-05-15

[0.5.1]: https://github.com/atomist/slack-messages/compare/0.5.0...0.5.1

### Fixed
-   Replace special characters globally: [#9](https://github.com/atomist/slack-messages/issues/9)

## [0.5.0] - 2017-05-15

[0.5.0]: https://github.com/atomist/slack-messages/compare/0.4.0...0.5.0

### Added
-   Added explicit `atChannel` that renders as `@channel` in Slack

### Fixed
-   Fixes [#8](https://github.com/atomist/slack-messages/issues/8) (TypeError: key.charAt is not a function)
-   Slack helper function will render empty string when given undefined values

### Changed
-   **BREAKING** Renamed `atUser` to `user`
-   **BREAKING** Renamed `atChannel` with channel id, channel name to `channel`

## [0.4.0] - 2017-05-10

[0.4.0]: https://github.com/atomist/slack-messages/compare/0.3.1...0.4.0

### Fixed
-   **BREAKING** Flatten module structure.  You will need to update your
    import statements:

    before: `import { ... } from "@atomist/slack-messages/build/src/RugMessages";`
    
    after: `import { ... } from "@atomist/slack-messages/RugMessages";`

## [0.3.1] - 2017-05-10

[0.3.1]: https://github.com/atomist/slack-messages/compare/0.3.0...0.3.1

### Fixed
-   **BREAKING** `ButtonSpec` should be an interface

## [0.3.0] - 2017-05-10

[0.3.0]: https://github.com/atomist/slack-messages/compare/0.2.0...0.3.0

### Changed
-   **BREAKING** `Action` fields `name` and `type` are now required in order 
    to match Slack required fields

## [0.2.0] - 2017-05-09

[0.2.0]: https://github.com/atomist/slack-messages/compare/0.1.0...0.2.0

### Added
-   Add `renderError` and `renderSuccess` generic success and error rug messages

### Fixed
-   `SlackMessage` `text` field should be optional
-   `Attachment` `text` field should be optional
-   `ActionConfirmation` fields should be optional
-   Add missing `author_icon` and `callback_id` to `Attachment`

## [0.1.0] - 2017-05-09

Initial release

[0.1.0]: https://github.com/atomist/slack-messages/releases/tag/0.1.0

### Added

-   Add Slack message rendering and most common rendering helper functions
-   Add support for Slack action buttons that execute rug instructions 
