import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, '../src/views/MobileChatView.vue'), 'utf8');

assert.match(source, /:replying-to="replyingTo"/, 'MobileChatView must pass reply state into MessageThread');
assert.match(source, /@set-reply-to="setReplyTo"/, 'MobileChatView must handle MessageThread reply selection');
assert.match(source, /@cancel-reply-edit="onCancelReplyEdit"/, 'MobileChatView must clear reply state after send/cancel');
assert.match(source, /@add-reaction="onAddReaction"/, 'MobileChatView must handle MessageThread reaction selection');
assert.match(source, /addReaction/, 'MobileChatView must use shared chat reaction operation');
assert.match(source, /useChatOperations/, 'MobileChatView must use shared chat reply operations');
