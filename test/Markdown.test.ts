/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from "power-assert";

import {
    convertFormat,
    convertImageLinks,
    convertInlineImages,
    convertLinks,
    convertNamedLinks,
    githubToSlack,
} from "../lib/Markdown";

describe("Markdown", () => {

    describe("convertFormat", () => {

        it("should convert bold *", () => {
            const md = "Some **bold** text";
            const expected = "Some *bold* text";
            assert(convertFormat(md) === expected);
        });

        it("should convert bold _", () => {
            const md = "Some __bold__ text";
            const expected = "Some *bold* text";
            assert(convertFormat(md) === expected);
        });

        it("should convert italic *", () => {
            const md = "Some *italic* text";
            const expected = "Some _italic_ text";
            assert(convertFormat(md) === expected);
        });

        it("should convert italic _", () => {
            const md = "Some _italic_ text";
            const expected = "Some _italic_ text";
            assert(convertFormat(md) === expected);
        });

        it("should convert bold and italic", () => {
            const md = "*italic* Some text *not italic **bold**";
            const expected = "_italic_ Some text *not italic *bold*";
            assert(convertFormat(md) === expected);
        });

        it("should convert multiple italic *", () => {
            const md = `This is *italic* and so is *this* stop`;
            const expected = `This is _italic_ and so is _this_ stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert multiple italic _", () => {
            const md = `This is _italic_ and so is _this_ stop`;
            const expected = `This is _italic_ and so is _this_ stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert multiple italic *_", () => {
            const md = `This is *italic* and so is _this_ stop`;
            const expected = `This is _italic_ and so is _this_ stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert multiple bold *", () => {
            const md = `This is **bold** and so is **this** stop`;
            const expected = `This is *bold* and so is *this* stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert multiple bold _", () => {
            const md = `This is __bold__ and so is __this__ stop`;
            const expected = `This is *bold* and so is *this* stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert multiple bold *_", () => {
            const md = `This is **bold** and so is __this__ stop`;
            const expected = `This is *bold* and so is *this* stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert italic within bold *", () => {
            const md = `This is **bold and *italic* end** stop`;
            const expected = `This is *bold and _italic_ end* stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert bold within italic *", () => {
            const md = `This is *italic and **bold** end* stop`;
            const expected = `This is _italic and *bold* end_ stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert an italic bold *", () => {
            const md = `This is ***bold and italic*** stop`;
            const expected = `This is *_bold and italic_* stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert italic within bold _", () => {
            const md = `This is __bold and _italic_ end__ stop`;
            const expected = `This is *bold and _italic_ end* stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert bold within italic _", () => {
            const md = `This is _italic and __bold__ end_ stop`;
            const expected = `This is _italic and *bold* end_ stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert an italic bold _", () => {
            const md = `This is ___bold and italic___ stop`;
            const expected = `This is *_bold and italic_* stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert italic within bold *_", () => {
            const md = `This is **bold and _italic_ end** stop`;
            const expected = `This is *bold and _italic_ end* stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert bold within italic *_", () => {
            const md = `This is _italic and **bold** end_ stop`;
            const expected = `This is _italic and *bold* end_ stop`;
            assert(convertFormat(md) === expected);
        });

        it("should convert an italic bold *_", () => {
            const md = `This is **_bold and italic_** stop`;
            const expected = `This is *_bold and italic_* stop`;
            assert(convertFormat(md) === expected);
        });

        it("should not convert incorrectly formatted italic *", () => {
            const md = `This is* not italic *stop`;
            assert(convertFormat(md) === md);
        });

        it("should not convert incorrectly formatted italic _", () => {
            const md = `This is_ not italic _stop`;
            assert(convertFormat(md) === md);
        });

        it("should not convert incorrectly formatted bold *", () => {
            const md = `This is** not bold **stop`;
            assert(convertFormat(md) === md);
        });

        it("should not convert incorrectly formatted bold _", () => {
            const md = `This is__ not bold __stop`;
            assert(convertFormat(md) === md);
        });

        it("should _not perform *replacements for_ interleaved* formatting");

    });

    describe("convertImageLinks", () => {

        it("should convert image links to raw link", () => {
            const md = `![My Valuable Hunting Knife](http://gbv.com/mvhk.png)`;
            const expected = `http://gbv.com/mvhk.png`;
            assert(convertImageLinks(md) === expected);
        });

        /* tslint:disable:max-line-length */
        it("should convert img elements to raw links", () => {
            const md = `![I Am a Scientist](http://gbv.com/iaas.jpeg)
![Goldheart Mountaintop Queen Directory](http://gbv.com/gmqd.jpeg)![You're Not an Airplane](http://gbv.com/ynaa.jpeg)
![Big Boring Wedding](http://gbv.com/bbw.jpeg) and ![Dusted](http://gbv.com/dusted.jpeg)
`;
            const expected = `http://gbv.com/iaas.jpeg
http://gbv.com/gmqd.jpeg http://gbv.com/ynaa.jpeg
http://gbv.com/bbw.jpeg and http://gbv.com/dusted.jpeg
`;
            assert(convertImageLinks(md) === expected);
        });

        it("should convert img elements within markdown", () => {
            const md = `# Guided By Voices

## Some Songs

Here are some Guided By Voices songs.

-   ![I Am a Scientist](http://gbv.com/iaas.jpeg)
-   ![Goldheart Mountaintop Queen Directory](http://gbv.com/gmqd.jpeg)![You're Not an Airplane](http://gbv.com/ynaa.jpeg)
-   ![Big Boring Wedding](http://gbv.com/bbw.jpeg) and ![Dusted](http://gbv.com/dusted.jpeg)

There are many more.
`;
            const expected = `# Guided By Voices

## Some Songs

Here are some Guided By Voices songs.

-   http://gbv.com/iaas.jpeg
-   http://gbv.com/gmqd.jpeg http://gbv.com/ynaa.jpeg
-   http://gbv.com/bbw.jpeg and http://gbv.com/dusted.jpeg

There are many more.
`;
            assert(convertImageLinks(md) === expected);
        });

        it("should convert img elements within HTML", () => {
            const md = `<h1>Guided By Voices</h1>

<h2>Some Songs</h2>

<p>Here are some Guided By Voices songs.</p>

<ul>
  <li>![I Am a Scientist](http://gbv.com/iaas.jpeg)</li>
  <li>![Goldheart Mountaintop Queen Directory](http://gbv.com/gmqd.jpeg)![You're Not an Airplane](http://gbv.com/ynaa.jpeg)</li>
  <li>![Big Boring Wedding](http://gbv.com/bbw.jpeg) and ![Dusted](http://gbv.com/dusted.jpeg)</li>
</ul>

<p>There are many more.</p>
`;
            const expected = `<h1>Guided By Voices</h1>

<h2>Some Songs</h2>

<p>Here are some Guided By Voices songs.</p>

<ul>
  <li>http://gbv.com/iaas.jpeg </li>
  <li>http://gbv.com/gmqd.jpeg http://gbv.com/ynaa.jpeg </li>
  <li>http://gbv.com/bbw.jpeg and http://gbv.com/dusted.jpeg </li>
</ul>

<p>There are many more.</p>
`;
            assert(convertImageLinks(md) === expected);
        });
        /* tslint:enable:max-line-length */

        it("should convert named image links", () => {
            const md = `The EP "Clown Prince of the Menthol Trailer" has
![Johnny Appleseed][apple] on it.

[apple]: http://gbv.com/ja.gif (Johnny Appleseed image)
`;
            const expected = `The EP "Clown Prince of the Menthol Trailer" has
http://gbv.com/ja.gif on it.

`;
            assert(convertImageLinks(convertNamedLinks(md)) === expected);
        });

    });

    describe("convertInlineImages", () => {

        it("should convert img element to raw link", () => {
            const md = `<img src="http://gbv.com/iaas.jpeg" alt="I Am a Scientist">`;
            const expected = `http://gbv.com/iaas.jpeg`;
            assert(convertInlineImages(md) === expected);
        });

        it("should convert img element when src not first", () => {
            const md = `<img alt="I Am a Scientist" src="http://gbv.com/iaas.jpeg">`;
            const expected = `http://gbv.com/iaas.jpeg`;
            assert(convertInlineImages(md) === expected);
        });

        it("should convert complicated img element", () => {
            const md = `<img alt="I Am a Scientist" src="http://gbv.com/iaas.jpeg" width="100" height="200" />`;
            const expected = `http://gbv.com/iaas.jpeg`;
            assert(convertInlineImages(md) === expected);
        });

        it("should convert multiline img element", () => {
            const md = `<img
  alt="I Am a Scientist"
  src="http://gbv.com/iaas.jpeg"
  width="100" height="200"
/>`;
            const expected = `http://gbv.com/iaas.jpeg`;
            assert(convertInlineImages(md) === expected);
        });

        /* tslint:disable:max-line-length */
        it("should convert img elements to raw links", () => {
            const md = `<img src="http://gbv.com/iaas.jpeg" alt="I Am a Scientist">
<img src="http://gbv.com/gmqd.jpeg" alt="Goldheart Mountaintop Queen Directory"><img src="http://gbv.com/ynaa.jpeg" alt="You're Not an Airplane">
<img src="http://gbv.com/bbw.jpeg" alt="Big Boring Wedding"> and <img src="http://gbv.com/dusted.jpeg" alt="Dusted">
`;
            const expected = `http://gbv.com/iaas.jpeg
http://gbv.com/gmqd.jpeg http://gbv.com/ynaa.jpeg
http://gbv.com/bbw.jpeg and http://gbv.com/dusted.jpeg
`;
            assert(convertInlineImages(md) === expected);
        });

        it("should convert img elements within markdown", () => {
            const md = `# Guided By Voices

## Some Songs

Here are some Guided By Voices songs.

-   <img src="http://gbv.com/iaas.jpeg" alt="I Am a Scientist">
-   <img src="http://gbv.com/gmqd.jpeg" alt="Goldheart Mountaintop Queen Directory"><img src="http://gbv.com/ynaa.jpeg" alt="You're Not an Airplane">
-   <img src="http://gbv.com/bbw.jpeg" alt="Big Boring Wedding"> and <img src="http://gbv.com/dusted.jpeg" alt="Dusted">

There are many more.
`;
            const expected = `# Guided By Voices

## Some Songs

Here are some Guided By Voices songs.

-   http://gbv.com/iaas.jpeg
-   http://gbv.com/gmqd.jpeg http://gbv.com/ynaa.jpeg
-   http://gbv.com/bbw.jpeg and http://gbv.com/dusted.jpeg

There are many more.
`;
            assert(convertInlineImages(md) === expected);
        });

        it("should convert img elements within HTML", () => {
            const md = `<h1>Guided By Voices</h1>

<h2>Some Songs</h2>

<p>Here are some Guided By Voices songs.</p>

<ul>
  <li><img src="http://gbv.com/iaas.jpeg" alt="I Am a Scientist"></li>
  <li><img src="http://gbv.com/gmqd.jpeg" alt="Goldheart Mountaintop Queen Directory"><img src="http://gbv.com/ynaa.jpeg" alt="You're Not an Airplane"></li>
  <li><img src="http://gbv.com/bbw.jpeg" alt="Big Boring Wedding"> and <img src="http://gbv.com/dusted.jpeg" alt="Dusted"></li>
</ul>

<p>There are many more.</p>
`;
            const expected = `<h1>Guided By Voices</h1>

<h2>Some Songs</h2>

<p>Here are some Guided By Voices songs.</p>

<ul>
  <li>http://gbv.com/iaas.jpeg </li>
  <li>http://gbv.com/gmqd.jpeg http://gbv.com/ynaa.jpeg </li>
  <li>http://gbv.com/bbw.jpeg and http://gbv.com/dusted.jpeg </li>
</ul>

<p>There are many more.</p>
`;
            assert(convertInlineImages(md) === expected);
        });
        /* tslint:enable:max-line-length */

    });

    describe("convertLinks", () => {

        it("should convert a link", () => {
            const md = `[GBV](http://www.gbv.com/)`;
            const expected = `<http://www.gbv.com/|GBV>`;
            assert(convertLinks(md) === expected);
        });

        /* tslint:disable:max-line-length */
        it("should convert a complicated link", () => {
            const md = `[Google &mdash; Guided By Voices](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwj98P7fwNTVAhUKjVQKHUwJAkcQFggoMAA&url=http%3A%2F%2Fwww.gbv.com%2F&usg=AFQjCNF85PQImFGH5_nHSKg8ZZk0Hj57ow)`;
            const expected = `<https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwj98P7fwNTVAhUKjVQKHUwJAkcQFggoMAA&url=http%3A%2F%2Fwww.gbv.com%2F&usg=AFQjCNF85PQImFGH5_nHSKg8ZZk0Hj57ow|Google &mdash; Guided By Voices>`;
            assert(convertLinks(md) === expected);
        });
        /* tslint:enable:max-line-length */

        it("should convert multiple links on one line", () => {
            const md = `[GBV](http://www.gbv.com/) [My Valuable Hunting Knife](http://gbv.com/mvhk)
`;
            const expected = `<http://www.gbv.com/|GBV> <http://gbv.com/mvhk|My Valuable Hunting Knife>
`;
            assert(convertLinks(md) === expected);
        });

        it("should convert links", () => {
            const md = `[GBV](http://www.gbv.com/)
[My Valuable Hunting Knife](http://gbv.com/mvhk)
`;
            const expected = `<http://www.gbv.com/|GBV>
<http://gbv.com/mvhk|My Valuable Hunting Knife>
`;
            assert(convertLinks(md) === expected);
        });

        it("should convert a named link", () => {
            const md = `[GBV][gbv]

[gbv]: http://www.gbv.com/ (Guided By Voices)
`;
            const expected = `<http://www.gbv.com/|GBV>

`;
            assert(convertLinks(convertNamedLinks(md)) === expected);
        });

        it("should convert an implicitly named link", () => {
            const md = `[GBV][]

[GBV]: http://www.gbv.com/ (Guided By Voices)
`;
            const expected = `<http://www.gbv.com/|GBV>

`;
            assert(convertLinks(convertNamedLinks(md)) === expected);
        });

        it("should convert links within markdown", () => {
            const md = `# Guided By Voices

## Some Songs

Here are some [Guided By Voices][gbv] songs.

-   [I Am a Scientist](http://gbv.com/iaas.jpeg)
-   [Goldheart Mountaintop Queen Directory](http://gbv.com/gmqd.jpeg)[You're Not an Airplane](http://gbv.com/ynaa.jpeg)
-   [Big Boring Wedding](http://gbv.com/bbw.jpeg) and [Dusted](http://gbv.com/dusted.jpeg)

There are many more.

[gbv]: https://www.gbv.com
`;
            const expected = `# Guided By Voices

## Some Songs

Here are some <https://www.gbv.com|Guided By Voices> songs.

-   <http://gbv.com/iaas.jpeg|I Am a Scientist>
-   <http://gbv.com/gmqd.jpeg|Goldheart Mountaintop Queen Directory><http://gbv.com/ynaa.jpeg|You're Not an Airplane>
-   <http://gbv.com/bbw.jpeg|Big Boring Wedding> and <http://gbv.com/dusted.jpeg|Dusted>

There are many more.

`;
            assert(convertLinks(convertNamedLinks(md)) === expected);
        });

    });

    describe("convertNamedLinks", () => {

        it("should convert a named link", () => {
            const md = `[My Valuable Hunting Knife][mvhk]

[mvhk]: http://gbv.com/mvhk.html
`;
            const expected = `[My Valuable Hunting Knife](http://gbv.com/mvhk.html)

`;
            assert(convertNamedLinks(md) === expected);
        });

        it("should convert an implicit named link", () => {
            const md = `[GBV][]

[GBV]: http://gbv.com
`;
            const expected = `[GBV](http://gbv.com)

`;
            assert(convertNamedLinks(md) === expected);
        });

        it.skip("should convert a named link with optional space", () => {
            const md = `[My Valuable Hunting Knife] [mvhk]

[mvhk]: http://gbv.com/mvhk.html
`;
            const expected = `[My Valuable Hunting Knife](http://gbv.com/mvhk.html)

`;
            assert(convertNamedLinks(md) === expected);
        });

        it("should convert a named link with (alt)", () => {
            const md = `[My Valuable Hunting Knife][mvhk]

[mvhk]: http://gbv.com/mvhk.html (GBV - MVHK)
`;
            const expected = `[My Valuable Hunting Knife](http://gbv.com/mvhk.html)

`;
            assert(convertNamedLinks(md) === expected);
        });

        it("should convert a named link with 'alt')", () => {
            const md = `[My Valuable Hunting Knife][mvhk]

[mvhk]: http://gbv.com/mvhk.html 'GBV - MVHK'
`;
            const expected = `[My Valuable Hunting Knife](http://gbv.com/mvhk.html)

`;
            assert(convertNamedLinks(md) === expected);
        });

        it("should convert a named link with \"alt\")", () => {
            const md = `[My Valuable Hunting Knife][mvhk]

[mvhk]: http://gbv.com/mvhk.html "GBV - MVHK"
`;
            const expected = `[My Valuable Hunting Knife](http://gbv.com/mvhk.html)

`;
            assert(convertNamedLinks(md) === expected);
        });

        it("should convert multiple named links", () => {
            const md = `[GBV][]
[My Valuable Hunting Knife][mvhk]

[mvhk]: http://gbv.com/mvhk.html
[GBV]: http://gbv.com
`;
            const expected = `[GBV](http://gbv.com)
[My Valuable Hunting Knife](http://gbv.com/mvhk.html)

`;
            assert(convertNamedLinks(md) === expected);
        });

        it("should convert a named link everywhere", () => {
            const md = `[My Valuable Hunting Knife][mvhk]
can be abbreviated [MVHK][mvhk].

[mvhk]: http://gbv.com/mvhk.html
`;
            const expected = `[My Valuable Hunting Knife](http://gbv.com/mvhk.html)
can be abbreviated [MVHK](http://gbv.com/mvhk.html).

`;
            assert(convertNamedLinks(md) === expected);
        });

        it("should convert an implicit named link everywhere", () => {
            const md = `[GBV][] [GBV][]

[GBV]: http://gbv.com
`;
            const expected = `[GBV](http://gbv.com) [GBV](http://gbv.com)

`;
            assert(convertNamedLinks(md) === expected);
        });

    });

    describe("GitHub to Slack markdown conversion with code", () => {

        it("should leave markdown inside code blocks as is", () => {
            const md = "```\n* list item\n```\n";
            assert(githubToSlack(md) === md);
        });

        it("should convert markdown outside of code blocks", () => {
            const md = "* list item\n```\n* list item\n```\n";
            const expected = "• list item\n```\n* list item\n```\n";
            assert(githubToSlack(md) === expected);
        });

        it("should recognize code blocks with language hint", () => {
            const md = "```markdown\n* list item\n```\n";
            assert(githubToSlack(md) === md);
        });

        it("should ignore code blocks with invalid language hint", /* () => {
            // GitHub seems to allow this
            const md = "```markdown linenum=1\n* list item\n```\n";
            const expected = "```markdown linenum=1\n• list item\n```\n";
            assert(githubToSlack(md) === expected);
        } */ );

        it("should convert mid-line triple backticks to inline code", /* () => {
            // GitHub allows inline triple backtick with embedded single backticks
            const md = "This code block ```* list _item_``` is actually inline code\n";
            const expected = "This code block `* list _item_` is actually inline code\n";
            assert(githubToSlack(md) === expected);
        } */ );

        it("should leave markdown inside inline code as is", () => {
            const md = "`* list _item_`";
            assert(githubToSlack(md) === md);
        });

        it("should convert markdown outside of inline code", () => {
            const md = "* list item\n`* list item`\n";
            const expected = "• list item\n`* list item`\n";
            assert(githubToSlack(md) === expected);
        });

        it("should convert markdown outside of blocks and leave each block as is", () => {
            const md = "Some text\n\n```\nblock *of `code\n```\n\n**bold text** `another ```line``` of code`\n";
            const expected = "Some text\n\n```\nblock *of `code\n```\n\n*bold text* `another ```line``` of code`\n";
            assert(githubToSlack(md) === expected);
        });

    });

    describe("Just GitHub to Slack markdown conversion", () => {
        it("should convert list item expressed with -", () => {
            assert.strictEqual(githubToSlack("- list item 1\n - list item 2"),
                "• list item 1\n • list item 2");
        });

        it("should convert list item expressed with *", () => {
            assert.strictEqual(githubToSlack("* list item 1\n * list item 2"),
                "• list item 1\n • list item 2");
        });

        it("should not convert non-* lists", () => {
            const md = "blah * list item 1\nblah * list item 2";
            assert(githubToSlack(md) === md);
        });

        it("should not convert non-- lists", () => {
            const md = "blah - list item 1\nblah - list item 2";
            assert(githubToSlack(md) === md);
        });

        it("should not confuse italic with list item", () => {
            assert.strictEqual(githubToSlack("*list item* 1\n * list item 2"),
                "_list item_ 1\n • list item 2");
        });

        it("given simple image link should leave URL", () => {
            assert.strictEqual(githubToSlack("<img  width=\"345\" src=\"http://someplace.com\">"),
                "http://someplace.com");
        });

        it("given image link with other attributes should leave URL", () => {
            assert.strictEqual(githubToSlack("<img  width=\"345\" src=\"http://someplace.com\" alt=\"screen shot\">"),
                "http://someplace.com");
        });

        it("given encoded image link should leave URL", () => {
            assert.strictEqual(githubToSlack("&lt;img  width=\"345\" src=\"http://someplace.com\"&gt;"),
                "http://someplace.com");
        });

        it("given link will convert it", () => {
            assert.strictEqual(githubToSlack("[click here](http://someplace.com)"),
                "<http://someplace.com|click here>");
        });
    });

    describe("githubToSlack", () => {

        it("should convert GitHub Markdown to Slack markup", () => {
            const md = `# Guided By Voices

[Guided By Voices][GBV], commonly referred to as "_GBV_", is a band from
Dayton, OH, USA fronted by [Robert Pollard](https://en.wikipedia.org/wiki/Robert_Pollard).
Mr. Pollard is a **prolific** songwriter, through GBV and solo efforts
having released over ***100 albums***.

[GBV]: https://www.gbv.com "Guided By Voices"

## Albums

Here are some [GBV][] albums:

-   [Vampire on Titus](http://gbv.com/vampire-on-titus/)
-   Propeller
-   *Bee Thousand*
-   Alien __Lanes__
-   \`*Under the Bushes Under the Stars*\`

There are many, many more.

Here is how the above list was created using Markdown:

\`\`\`markdown
-   [Vampire on Titus](http://gbv.com/vampire-on-titus/)
-   Propeller
-   *Bee Thousand*
-   Alien __Lanes__
-   \`*Under the Bushes Under the Stars*\`
\`\`\`
`;
            const expected = `# Guided By Voices

<https://www.gbv.com|Guided By Voices>, commonly referred to as "_GBV_", is a band from
Dayton, OH, USA fronted by <https://en.wikipedia.org/wiki/Robert_Pollard|Robert Pollard>.
Mr. Pollard is a *prolific* songwriter, through GBV and solo efforts
having released over *_100 albums_*.


## Albums

Here are some <https://www.gbv.com|GBV> albums:

•   <http://gbv.com/vampire-on-titus/|Vampire on Titus>
•   Propeller
•   _Bee Thousand_
•   Alien *Lanes*
•   \`*Under the Bushes Under the Stars*\`

There are many, many more.

Here is how the above list was created using Markdown:

\`\`\`markdown
-   [Vampire on Titus](http://gbv.com/vampire-on-titus/)
-   Propeller
-   *Bee Thousand*
-   Alien __Lanes__
-   \`*Under the Bushes Under the Stars*\`
\`\`\`
`;
            assert(githubToSlack(md) === expected);
        });

        /* tslint:disable:max-line-length */
        it("should not mangle urls", () => {
            const md = `This is *some* markdown.  It has __some__ URLs.
[UTBUTS](https://gbv.com/__under-the-bushes__under-the-stars/)
For example, https://github.com/graphql/graphql-js/blob/master/src/utilities/__tests__/buildClientSchema-test.js#L821 caused
problems.
Named [links][sih] too.

[sih]: http://www.gbv.org/song/Smothered*in*hugs.html (GbV - Smothered in Hugs)
`;
            const expected = `This is _some_ markdown.  It has *some* URLs.
<https://gbv.com/__under-the-bushes__under-the-stars/|UTBUTS>
For example, https://github.com/graphql/graphql-js/blob/master/src/utilities/__tests__/buildClientSchema-test.js#L821 caused
problems.
Named <http://www.gbv.org/song/Smothered*in*hugs.html|links> too.

`;
            assert(githubToSlack(md) === expected);
        });
        /* tslint:enable:max-line-length */

    });
});
