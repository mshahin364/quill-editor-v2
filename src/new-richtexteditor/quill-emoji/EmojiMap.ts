import emojiList from './EmojiList';
import {Emoji} from "./Emoji";

const emojiMap: {
    [key: string]: Emoji;
} = {};

emojiList.forEach((emojiListObject) => {
    emojiMap[emojiListObject.name] = emojiListObject;
});

export default emojiMap;