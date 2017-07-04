import { emptyString } from "./Common";

const codeBlockSeparator = "```";
const codeLineSeparator = "`";

interface Block {
    type: "text" | "code";
    separator?: string;
    text?: string;
}

function textBlock(text: string): Block {
    return {
        type: "text",
        text,
    };
}

function closeBlock(text: string, block: Block): [Block, string] {
    const position = text.indexOf(block.separator);
    if (position >= 0) {
        block.text = text.substr(0, position);
        const remainingText = text.substr(position + block.separator.length);
        return [block, remainingText];
    } else {
        return [textBlock(block.separator + text), null];
    }
}

function startBlock(text: string): [string, Block, string] {
    const codeBlockStart = text.indexOf(codeBlockSeparator);
    const codeLineStart = text.indexOf(codeLineSeparator);
    if (codeBlockStart >= 0 || codeLineStart >= 0) {
        const [separator, position] = (codeLineStart < 0) || (codeBlockStart >= 0 && codeBlockStart <= codeLineStart)
            ? [codeBlockSeparator, codeBlockStart] : [codeLineSeparator, codeLineStart];
        const plainText = text.substr(0, position);
        const remainingText = text.substr(position + separator.length);
        return [plainText, { type: "code", separator }, remainingText];
    } else {
        return null;
    }
}

function toTextBlocks(text: string, currentBlock: Block, blocks: Block[]): Block[] {
    if (!emptyString(text)) {
        if (currentBlock) {
            const [codeBlock, remainingText] = closeBlock(text, currentBlock);
            blocks.push(codeBlock);
            return toTextBlocks(remainingText, null, blocks);
        } else {
            const newBlock = startBlock(text);
            if (newBlock) {
                const [plainText, codeBlock, remainingText] = newBlock;
                blocks.push(textBlock(plainText));
                return toTextBlocks(remainingText, codeBlock, blocks);
            } else {
                blocks.push(textBlock(text));
                return blocks;
            }
        }
    } else {
        return blocks;
    }
}

function convertInlineImages(text: string): string {
    return text.replace(/<img .*src=\"([^\"]+)\".*>/g, "$1")
        .replace(/&lt;img .*src=\"([^\"]+)\".*&gt;/g, "$1");
}

function convertImageLinks(text: string): string {
    return text.replace(/"\!\[image\]\((.*)\)/g, "$1");
}

function convertLinks(text: string): string {
    return text.replace(/\[([^\[]+)\]\(([^\(]+)\)/g, "<$2|$1>");
}

function convertMarkdown(text: string): string {
    try {
        const converted = text
            .replace(/(\n\s*)-(\s+)/g, "$1•$2")
            .replace(/(^\s*)-(\s+)/g, "$1•$2")
            .replace(/(\n\s*)\*(\s+)/g, "$1•$2")
            .replace(/(^\s*)\*(\s+)/g, "$1•$2")
            .replace(/\*\*([^\*]+)\*\*/g, "<bdmkd>$1<bdmkd>")
            .replace(/\*([^\*]+)\*/g, "<itmkd>$1<itmkd>")
            .replace(/<bdmkd>/g, "*")
            .replace(/<itmkd>/g, "_");
        return convertLinks(convertImageLinks(convertInlineImages(converted)));
    } catch (e) {
        return text;
    }
}

function handleMarkdown(block: Block) {
    return block.type === "text" ?
        convertMarkdown(block.text) :
        block.separator + block.text + block.separator;
}

export function githubToSlack(text: string): string {
    return toTextBlocks(text, null, []).map(handleMarkdown).join("");
}
