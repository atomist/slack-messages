# @atomist/slack-messages

[![npm version](https://img.shields.io/npm/v/@atomist/slack-messages.svg)](https://www.npmjs.com/package/@atomist/slack-messages)

[Node.js][node] module that helps to create well-formatted
[Slack][slackhq] messages sent through the `@atomist` bot from your
software delivery machine (SDM).  This module also facilitates adding
actions to your Slack messages that execute commands.

See the [Atomist documentation][atomist-doc] for more information on
what SDMs are and what they can do for you using the Atomist API for
software.

[atomist-doc]: https://docs.atomist.com/ (Atomist Documentation)
[slackhq]: https://slack.com/ (Slack)

## Using

Construct a message as a plain map following the [Slack message
formatting API][slack-api].

[slack-api]: https://api.slack.com/docs/message-formatting (Slack message formatting API)

```typescript
import { SlackMessage } from "@atomist/slack-message";
// A very simple message
const msg: SlackMessage = { text: "Simple message" };
```

```typescript
import {
    escape,
    SlackMessage,
    url,
} from "@atomist/slack-message";
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

And then render the message with SlackMessages.render.  This will
construct a JSON string representation of the message:

```typescript
import { render } from "@atomist/slack-messages"

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

Note that the `render` function will automatically assign a unique
`callback_id` to each attachments that has actions.  But, if you
provide your custom `callback_id` it will be preserved as is.

### Additional helper functions

#### Special characters

```typescript
escape("Slack requires you to escape <, > and &");
// => "Slack requires you to escape &lt;, &gt; and &amp;"
```

#### Links

```typescript
// Simple link
url("https://www.atomist.com");
// => "<https://www.atomist.com>"

// Link with label
url("https://www.atomist.com", "atomist");
// => "<https://www.atomist.com|atomist>"
```

#### User & channel links

```typescript
// @some-user (Slack will display user name for provided user ID)
user("U123");
// => "<@U123>"

// #some-channel (Slack will display channel name for provided channel ID)
channel("C123");
// => "<#C123>"
```

#### Special variables

```typescript
// @channel
atChannel();
// => "<!channel>"

// @here
atHere();
// => "<!here>"

// @everyone
atEveryone();
// => "<!everyone>"
```

#### Emoji

```typescript
emoji("smile");
// => ":smile:";
```

#### Markdown

Slack will render markdown if field where markdown is present is
included in `mrkdwn_in` array.

```typescript
bold("This text will appear bold");
// => "*This text will appear bold*"

italic("This text will appear italic");
// => "_This text will appear italic_"

strikethrough("This text will appear strike-through");
// => "~This text will appear strike-through~"

// Single line code block
codeLine("var a = new A();");
// =>  "`var a = new A();`"

// Multi line code block
codeBlock("var a = new A();\nvar b = new B();");
// => "```var a = new A();\nvar b = new B();```"

// List
listItem("Item 1");
// => "• Item 1"
```

### GitHub to Slack markdown conversion

GitHub and Slack markdown are different enough to make your GitHub
issues or GitHub PRs look quite bad in Slack by default. You can use
the `githubToSlack` function from `Markdown` to convert text that uses
GitHub markdown to text that will look good in Slack:

```typescript
import { githubToSlack } from "@atomist/slack-messages"

githubToSlack("* list item 1\n* list item 2\n\**some bold text** and *some italic text* with a link [click here](http://someplace.com)");
// => "• list item 1\n• list item 2\n*some bold text* and _some italic text_ with a link <http://someplace.com|click here>"
```

## Support

General support questions should be discussed in the `#support`
channel in the [Atomist community Slack workspace][slack].

If you find a problem, please create an [issue][].

[issue]: https://github.com/atomist/slack-messages/issues

## Development

You will need to install [Node.js][node] to build and test this project.

[node]: https://nodejs.org/ (Node.js)

### Build and test

Install dependencies.

```
$ npm install
```

Use the `build` package script to compile, test, lint, and build the
documentation.

```
$ npm run build
```

### Release

Releases are handled via the [Atomist SDM][atomist-sdm].  Just press
the 'Approve' button in the Atomist dashboard or Slack.

[atomist-sdm]: https://github.com/atomist/atomist-sdm (Atomist Software Delivery Machine)

---

Created by [Atomist][atomist].
Need Help?  [Join our Slack workspace][slack].

[atomist]: https://atomist.com/ (Atomist - How Teams Deliver Software)
[slack]: https://join.atomist.com/ (Atomist Community Slack)
