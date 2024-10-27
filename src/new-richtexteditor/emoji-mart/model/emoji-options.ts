import {EmojiMartData} from "@emoji-mart/data";
import {CustomEmojiData} from "./custom-emoji-data.ts";
import {EmojiI18n} from "./emoji-i18n.ts";

export interface EmojiOptions {
    data: EmojiMartData,
    i18n: EmojiI18n,
    categories: EmojiCategory[],
    custom: CustomEmojiData[],
    autoFocus: boolean,
    categoryIcons: Record<EmojiCategory, { src?: string, svg?: string }>,
    dynamicWidth: boolean,
    emojiButtonColors: (RGB | RGBA | HEX)[],
    emojiButtonRadius: `${number}${LengthUnit}`,
    emojiButtonSize: number,
    emojiSize: number,
    emojiVersion: `${number}` | `${number}.${number}`,
    exceptEmojis: string[],
    icons: 'auto' | 'outline' | 'solid',
    maxFrequentRows: number,
    navPosition: 'top' | 'bottom' | 'none',
    noCountryFlags: boolean,
    noResultsEmoji: string,
    perLine: number,
    previewEmoji: 'point_up' | 'point_down',
    previewPosition: 'top' | 'bottom' | 'none',
    searchPosition: 'sticky' | 'static' | 'none',
    set: 'native' | 'apple'  | 'facebook' | 'google' | 'twitter',
    skin: 1 | 2 | 3 | 4 | 5 | 6,
    skinTonePosition: 'preview' | 'search' | 'none',
    theme: 'auto' | 'light' | 'dark',
}

export type EmojiCategory = 'frequent' | 'people' | 'nature' |
                            'foods' | 'activity' | 'places' |
                            'objects' | 'symbols' | 'flags';


type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type LengthUnit = 'cm' | 'mm' | 'in' | 'px' | 'pt' | 'pc' |
                  'em' | 'ex' | 'ch' | 'rem' | 'vw' | 'vh' | 'vmin' | 'vmax' | '%' |
                  'lh' | 'rlh' | 'cqw' | 'cqh' | 'cqi' | 'cqb' | 'cqmax' | 'cqmin';
