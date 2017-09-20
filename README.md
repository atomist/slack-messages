# @atomist/slack-messages

[![Build Status](https://travis-ci.org/atomist/slack-messages.svg?branch=master)](https://travis-ci.org/atomist/slack-messages)

[Node][node] module [`@atomist/slack-messages`][slack-messages] helps
rendering well formatted [Slack][slack] messages sent
by [`@atomist`][docs] from your [Rug][rug] event and command
handlers. This module also lets you add actions to your [Slack][slack]
messages that execute [Rug][rug] instructions.  See
the [reference documentation][docs] for more information.

[node]: https://nodejs.org/ (Node.js)
[slack]: https://slack.com/ (Slack)
[rug]: https://github.com/atomist/rug (Atomist Rug)
[slack-messages]: https://www.npmjs.com/package/@atomist/slack-messages (@atomist/slack-messages Node Module)
[ts]: https://www.typescriptlang.org/ (TypeScript)
[docs]: https://atomist.github.io/slack-messages/ (@atomist/slack-messages TypeDoc)

## Using

Construct a message as a plain map following the Slack message formatting API:

https://api.slack.com/docs/message-formatting

```typescript
// A very simple message
const msg: SlackMessage = { text: "Simple message" };
```

```typescript
// Here is an example of a message with a Slack action (button).
const msg: SlackMessage = {
                text: `${url(user.url, "@" + user.name)} opened issue: ${url(issue.url, issue.title)}`,
                attachments: [
                    {
                        text: escape(issue.body),
                        fallback: escape(issue.title),
                        mrkdwn_in: ["text"],
                        actions: [
                        {
                            text: "Close issue",
                            type: "button",
                            name: "closeissue",
                            value: "somebuttonid",
                        },
                    ],
                    callback_id: "cllbck1",
                    },
                ],
            };
```

And then render the message with SlackMessages.render.  This will construct a JSON string representation of the message:
```typescript
import { render } from "@atomist/slack-messages/SlackMessages"

const renderedMsg = render(msg);
```
Or to produce a pretty JSON string:
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
            "callback_id": "cllbck1",
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
Note that the `render` function will automatically assign a unique `callback_id` to each attachments that has actions.
But, if you provide your custom `callback_id` it will be preserved as is.

### Additional helper functions:

#### Special characters

```typescript
escape("Slack requires you to escape <, > and &");
  => "Slack requires you to escape &lt;, &gt; and &amp;"
```

#### Links

```typescript
// Simple link
url("https://www.atomist.com");
  => "<https://www.atomist.com>"

// Link with label
url("https://www.atomist.com", "atomist");
  => "<https://www.atomist.com|atomist>"
```

#### User & channel links

```typescript
// @some-user (Slack will display user name for provided user ID)
user("U123");
  => "<@U123>"

// #some-channel (Slack will display channel name for provided channel ID)
channel("C123");
  => "<#C123>"
```

#### Special variables

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

#### Emoji

```typescript
emoji("smile");
  => ":smile:";
```

#### Markdown

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

### GitHub to Slack markdown conversion

GitHub and Slack markdown are different enough to make your GitHub issues or GitHub PRs look quite bad in Slack by default. You can use the `githubToSlack` function from `Markdown` to convert text that uses GitHub markdown to text that will look good in Slack:

```typescript
import { githubToSlack } from "@atomist/slack-messages/Markdown"

githubToSlack("* list item 1\n* list item 2\n\**some bold text** and *some italic text* with a link [click here](http://someplace.com)");
  => "• list item 1\n• list item 2\n*some bold text* and _some italic text_ with a link <http://someplace.com|click here>"
```

## Support

General support questions should be discussed in the `#support`
channel on our community Slack team
at [atomist-community.slack.com][slack].

If you find a problem, please create an [issue][].

[issue]: https://github.com/atomist/slack-messages/issues

## Development

You will need to install [node][] to build and test this project.

### Build and Test

Command | Reason
------- | ------
`npm install` | to install all the required packages
`npm run lint` | to run tslint against the TypeScript
`npm run compile` | to compile all TypeScript into JavaScript
`npm test` | to run tests and ensure everything is working
`npm run autotest` | run tests continuously (you may also need to run `tsc -w`)
`npm run clean` | remove stray compiled JavaScript files and build directory

### Release

To create a new release of the project, simply push a tag of the form
`M.N.P` where `M`, `N`, and `P` are integers that form the next
appropriate [semantic version][semver] for release.  The version in
the package.json is replaced by the build and is totally ignored!  For
example:

[semver]: http://semver.org

```
$ git tag -a 1.2.
$ git push --tags
```

The Travis CI build (see badge at the top of this page) will publish
the NPM module and automatically create a GitHub release using the tag
name for the release and the comment provided on the annotated tag as
the contents of the release notes.

---

Created by [Atomist][atomist].
Need Help?  [Join our Slack team][slack].

[atomist]: https://www.atomist.com/
[slack]: https://join.atomist.com
