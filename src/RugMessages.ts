import { MessageMimeTypes, ResponseMessage } from "@atomist/rug/operations/Handlers";
import { emptyString } from "./Common";
import { Attachment, render } from "./SlackMessages";
/**
 *
 */

export function renderError(msg: string, correlationId?: string): ResponseMessage {
    try {
        const error: Attachment = {
            text: msg,
            author_name: "Unable to run command",
            author_icon: "https://images.atomist.com/rug/error-circle.png",
            fallback: "Unable to run command",
            mrkdwn_in: ["text"],
            color: "#D94649",
        };
        if (!emptyString(correlationId)) {
            error.footer = `Correlation ID: ${correlationId}`;
        }
        const slackMessage = {
            attachments: [error],
        };
        return new ResponseMessage(render(slackMessage), MessageMimeTypes.SLACK_JSON);
    } catch (ex) {
        return new ResponseMessage(`Error rendering error message ${ex}`);
    }
}

export function renderSuccess(msg: string): ResponseMessage {
    try {
        const slackMessage = { text: msg };
        return new ResponseMessage(render(slackMessage), MessageMimeTypes.SLACK_JSON);
    } catch (ex) {
        return renderError(`Error rendering success message ${ex}`);
    }
}
