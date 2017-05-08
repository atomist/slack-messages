# @atomist/slack-messages

[![Build Status](https://travis-ci.org/atomist/slack-messages.svg?branch=master)](https://travis-ci.org/atomist/slack-messages)
[![Slack Status](https://join.atomist.com/badge.svg)](https://join.atomist.com/)

[Node][node] module [`@atomist/slack-messages`][slack-messages] 
helps rendering well formatted [Slack][slack] messages sent by [`@atomist`][docs] 
from your [Rug][rug] event and command handlers. This module also lets you add 
actions to your [Slack][slack] messages that execute [Rug][rug] instructions.
See the [Atomist Documentation][docs] for more information.

[node]: https://nodejs.org/en/
[slack]: https://slack.com/
[rug]: https://github.com/atomist/rug
[slack-messages]: https://www.npmjs.com/package/@atomist/slack-messages
[ts]: https://www.typescriptlang.org/
[docs]: http://docs.atomist.com/

## Using Slack message builder

Construct message as a plain map following Slack message formatting API:

https://api.slack.com/docs/message-formatting

```typescript
// A very simple message
const msg = { text: "Simple message" };
```

```typescript
// Here is an example of a message with a Slack action (button) that launches
// a rug instruction when clicked.
// This assumes user, issue and instruction objects are defined elsewhere.
const msg = {
                text: `${url(user.url, "@" + user.name)} opened issue: ${url(issue.url, issue.title)}`,
                attachments: [
                    {
                        text: escape(issue.body),
                        fallback: escape(issue.title),
                        mrkdwn_in: ["text"],
                        actions: [
                            rugButtonFrom({ text: "Close issue" }, instruction),
                        ],
                    },
                ],
            };
```

And then simply render message.  This will construct JSON string representation of the message:
```typescript
const renderedMsg = render(msg);
```
Or to produce pretty JSON string:
```typescript
const renderedMsg = render(msg, true);
```

This will produce the following JSON string (pretty version):

```json
{
    "text": "<https://github.com/anna|@anna> opened issue: <https://github.com/someorg/somerepo/issues/484|This issue title contains &lt;unsafe&gt; characters and &amp;>",
    "attachments": [
        {
            "text": "This is a very important issue with body containing &lt;unsafe&gt; characters and even &amp;",
            "fallback": "This issue title contains &lt;unsafe&gt; characters and &amp;",
            "mrkdwn_in": [
                "text"
            ],
            "actions": [
                {
                    "text": "Close issue",
                    "type": "button",
                    "name": "rug",
                    "value": "somebuttonid"
                }
            ]
        }
    ]
}
```


### Additional helper functions:

**Special characters**
```typescript
escape("Slack requires you to escape <, > and &");
  => "Slack requires you to escape &lt;, &gt; and &amp;"
```

**Links**
```typescript
// Simple link
url("https://www.atomist.com");
  => "<https://www.atomist.com>"

// Link with label
url("https://www.atomist.com", "atomist");
  => "<https://www.atomist.com|atomist>"
```

**User & channel links**
```typescript
// @some-user (Slack will display user name for provided user ID)
atUser("U123");
  => "<@U123>"

// #some-channel (Slack will display channel name for provided channel ID)
atChannel("C123");
  => "<#C123>"
```

**Special variables**
```typescript
// @channel
atChannel();
  => "<!channel>"

// @here
atHere();
  => "<!here>"

// @everyone
atEveryone();
  => "<!everyone>"
```

**Emoji**

```typescript
emoji("smile");
  => ":smile:";
```

**Markdown**

Slack will render markdown if field where markdown is present is included in `mrkdwn_in` array.

```typescript
bold("This text will appear bold");
  => "*This text will appear bold*"

italic("This text will appear italic");
  => "_This text will appear italic_"

strikethrough("This text will appear strike-through");
  => "~This text will appear strike-through~"

// Single line code block
codeLine("var a = new A();");
  =>  "`var a = new A();`"

// Multi line code block
codeBlock("var a = new A();\nvar b = new B();");
  => "```var a = new A();\nvar b = new B();```"

// List
listItem("Item 1");
  => "• Item 1"
```

## Support

General support questions should be discussed in the `#support`
channel on our community Slack team
at [atomist-community.slack.com][slack].

If you find a problem, please create an [issue][].

[issue]: https://github.com/atomist/slack-messages/issues

## Development

### Notable conventions ###
* [tslint](https://palantir.github.io/tslint/rules/) with a modified rule set
* [mocha](https://mochajs.org/) test example
* [power asserts](https://github.com/power-assert-js/power-assert) with proper configuration
* a directory structure separating source, test, and compiled .js
* [yarn](https://yarnpkg.com/en/).lock file

You will need to install [npm](http://blog.npmjs.org/post/85484771375/how-to-install-npm), [yarn](https://yarnpkg.com/en/docs/install), and [TypeScript](https://www.typescriptlang.org/) so that you can run the following commands from the command line.

Command | Reason 
--- | --- 
`$ yarn` | to install all the required packages
`$ tsc -w` | to continually compile your TypeScript files (run in a different terminal)
`$ yarn test` | to run tests and ensure everything is working
`$ yarn autotest` | run tests continuously (you also need to run `tsc -w`)

### Test

Test using the standard approach for Node modules.

```
$ yarn test
```

### Release

To create a new release of the project, simply push a tag of the form
`M.N.P` where `M`, `N`, and `P` are integers that form the next
appropriate [semantic version][semver] for release.  The version in
the package.json is replaced by the build and is totally ignored!  For
example:

[semver]: http://semver.org

---
Created by [Atomist][atomist].
Need Help?  [Join our Slack team][slack].

[atomist]: https://www.atomist.com/
[slack]: https://join.atomist.com