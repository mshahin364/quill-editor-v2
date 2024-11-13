/* eslint-disable @typescript-eslint/no-unused-vars */
import {forwardRef, memo, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState,} from 'react';
import Quill, {type EmitterSource, type Range as RangeStatic} from 'quill';
import ReactQuill from 'react-quill-new';
import type DeltaStatic from 'quill-delta';
import {Mention, MentionBlot} from "quill-mention";
import QuillImageDropAndPaste, {ImageData} from 'quill-image-drop-and-paste';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import {RemainingCharactersModule} from './modules/RemainingCharactersModule';
import {HEADER_SIZE_LIST, HEADER_SIZE_LIST_CUSTOM, IdeascaleSnowTheme} from './themes/IdeascaleSnowTheme';
import {VideoBlot} from './blots/VideoBlot';
import {ImageBlot} from './blots/ImageBlot';
import {LinkBlot} from './blots/LinkBlot';
import {MarkdownShortcutsModule} from './modules/MarkdownShortcutsModule';
import {MaxCharsLimitModule} from './modules/MaxCharsLimitModule';
import {VideoPasteModule} from './modules/VideoPasteModule';
import {ClassificationBlot} from './blots/ClassificationBlot';
import {ImagePasteModule} from './modules/ImagePasteModule';
import {ClassificationModule} from './modules/ClassificationModule';
import EmojiBlot from './blots/EmojiBlot';
import EmojiModule from './modules/emoji/EmojiModule';
import ToolbarEmoji from './modules/emoji/EmojiToolbar';
import TextAreaEmoji from './modules/emoji/TextAreaEmoji';
import {LinkFormatModule} from './modules/LinkFormatModule';
import QuillMarkdown from './quill-markdown/QuillMarkdown';
import QuillResize from './quill-resize-module/QuillResize';
import {UploadedResponse} from './UploadResponse';
import {UploadProgressCallback} from './UploadProgressCallback';
import {ImageUploadAndLinkModal} from './ImageUploadAndLinkModal';
import {HtmlConverter} from './utils/HtmlConverter';
import {RichTextEditorHelper} from './utils/RichTextEditorHelper';
import {classificationDefaultConfig} from "./utils/ClassificationConfig.ts";
import {RichTextClassificationConfig} from './RichTextClassificationConfig';
import {ToolbarType} from './ToolbarType';
import {Emoji} from './quill-emoji/Emoji';
import emojiList from "./quill-emoji/EmojiList";
import {MentionUser} from "./MentionUser";
import {RichTextEditorHandler} from "./RichTextEditorHandler";

interface UnprivilegedEditor {
    getLength: Quill['getLength'];
    getText: Quill['getText'];
    getHTML: () => string;
    getSemanticHTML: Quill['getSemanticHTML'];
    getBounds: Quill['getBounds'];
    getSelection: Quill['getSelection'];
    getContents: Quill['getContents'];
}

const DEFAULT_FILE_NAME_PREFIX = 'embedded-image';

Quill.register('themes/ideascale-snow', IdeascaleSnowTheme, true);
Quill.register('formats/link', LinkBlot, true);
Quill.register('blots/block/embed', ImageBlot, true);
Quill.register('blots/block/embed', VideoBlot, true);
Quill.register({'modules/counter': RemainingCharactersModule}, true);
Quill.register('modules/markdownShortcuts', MarkdownShortcutsModule, true);
Quill.register('modules/maxCharsLimit', MaxCharsLimitModule, true);
Quill.register('modules/videoPaste', VideoPasteModule, true);
Quill.register('modules/resize', QuillResize, true);
Quill.register('modules/imagePaste', ImagePasteModule, true);
Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste, true);
Quill.register('formats/emoji', EmojiBlot, true);
Quill.register('modules/classificationModule', ClassificationModule, true);
Quill.register('modules/linkFormat', LinkFormatModule, true);
Quill.register('modules/emoji-shortname', EmojiModule, true);
Quill.register('modules/emoji-toolbar', ToolbarEmoji, true);
Quill.register('modules/emoji-textarea', TextAreaEmoji, true);
Quill.register({"blots/mention": MentionBlot, "modules/mention": Mention});
Quill.register(`formats/${ClassificationBlot.blotName}`, ClassificationBlot, true);

const TOOLBAR_CONFIGURATIONS = {
    default: [
        {'header': HEADER_SIZE_LIST},
        'bold', 'italic', 'underline', 'strike',
        {'list': 'bullet'}, {'list': 'ordered'},
        {indent: '-1'}, {indent: '+1'},
        {'align': ''}, {'align': 'center'}, {'align': 'right'}, {'align': 'justify'},
        'blockquote', 'link', 'video', 'image'
    ],
    standard: [
        'bold', 'italic', 'underline', 'strike',
        {'list': 'bullet'}, {'list': 'ordered'},
        {indent: '-1'}, {indent: '+1'},
        {'align': ''}, {'align': 'center'}, {'align': 'right'}, {'align': 'justify'},
        'blockquote', 'link', 'video', 'image'
    ],
    textOnly: [
        {'header': HEADER_SIZE_LIST},
        'bold', 'italic', 'underline', 'strike',
        {'list': 'bullet'}, {'list': 'ordered'},
        {indent: '-1'}, {indent: '+1'},
        {'align': ''}, {'align': 'center'}, {'align': 'right'}, {'align': 'justify'},
        'blockquote', 'link'
    ],
    minimal: [
        'bold', 'italic', 'underline', 'strike',
        {'list': 'bullet'}, {'list': 'ordered'},
        {indent: '-1'}, {indent: '+1'},
        {'align': ''}, {'align': 'center'}, {'align': 'right'}, {'align': 'justify'},
        'blockquote', 'link'
    ],
    titleText: [
        {'header': HEADER_SIZE_LIST_CUSTOM},
        'bold', 'italic', 'underline', 'strike', 'link'
    ],
    unalignedTextOnly: [
        'bold', 'italic', 'underline', 'strike',
        {'list': 'bullet'}, {'list': 'ordered'},
        'blockquote', 'link'
    ],
};

const COMMON_FORMATS = ['bold', 'italic', 'underline', 'strike', 'list', 'indent', 'align', 'blockquote', 'link'];
const FORMATS_CONFIGURATIONS = {
    default: ['header', ...COMMON_FORMATS, 'image', 'video'],
    standard: [...COMMON_FORMATS, 'image', 'video'],
    textOnly: ['header', ...COMMON_FORMATS],
    minimal: COMMON_FORMATS,
    titleText: ['header', 'bold', 'italic', 'underline', 'strike', 'link'],
    unalignedTextOnly: ['bold', 'italic', 'underline', 'strike', 'list', 'blockquote', 'link']
};

type NewRichTextEditorProps = {
    id: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    placeholder?: string;
    toolbar: ToolbarType;
    maxCharacterLimit?: number;
    enableEmojiPicker?: boolean;
    offensiveEmojis?: string[];
    enableAtMention?: boolean;
    characterLeftLabel?: string;
    existingAttachments?: string[];
    uploadImage?: (data: FormData, onUploadProgress: UploadProgressCallback) => Promise<UploadedResponse>;
    fetchMentionUsers?: (searchTerm: string) => Promise<MentionUser[]>;
    defaultValue?: string
    readonly?: boolean;
    tabIndex?: number;
    className?: string;
    svgIconPath: string;
    debug?: boolean | 'error' | 'warn' | 'log' | 'info';
    onChange?(value: string, delta: DeltaStatic, source: EmitterSource, editor: UnprivilegedEditor): void;
    onChangeSelection?(selection: ReactQuill.Range, source: EmitterSource, editor: UnprivilegedEditor): void;
    onFocus?(selection: RangeStatic, source: EmitterSource, editor: UnprivilegedEditor): void;
    onBlur?(previousSelection: RangeStatic, source: EmitterSource, editor: UnprivilegedEditor): void;
    maxFileSize?: number;
    classificationConfig?: RichTextClassificationConfig;
    defaultFileNamePrefix?: string;
    enableExternalImageEmbedOption?: boolean;
    externalFileBasePath?: string;
}

export const NewRichTextEditor = memo(forwardRef((props: NewRichTextEditorProps, forwardedRef: Ref<RichTextEditorHandler>) => {
    const {
        id,
        ariaLabel = 'Rich Text Editor',
        ariaLabelledBy = '',
        placeholder = 'Enter text',
        maxCharacterLimit = Infinity,
        toolbar = 'minimal',
        enableEmojiPicker = true,
        enableAtMention = true,
        offensiveEmojis: offensiveEmojiProps,
        characterLeftLabel = '',
        fetchMentionUsers,
        existingAttachments = [],
        defaultValue = '',
        readonly = false,
        tabIndex = 0,
        className,
        svgIconPath,
        debug = false,
        onChange,
        onChangeSelection,
        onFocus,
        onBlur,
        uploadImage,
        maxFileSize,
        classificationConfig: classificationProps = classificationDefaultConfig,
        defaultFileNamePrefix = DEFAULT_FILE_NAME_PREFIX,
        enableExternalImageEmbedOption = true,
        externalFileBasePath = '/a/attachments/embedded-file-url'
    } = props;
    const quillRef = useRef<ReactQuill>(null);
    const [imageUploadModalOpen, setImageUploadModalOpen] = useState(false);
    const insertImageCurrentIndexRef = useRef<number>(0);
    const classificationConfig = useMemo(() => ({
        enabled: classificationProps?.enabled || false,
        classifications: classificationProps?.classifications || {}
    }), [classificationProps?.classifications, classificationProps?.enabled]);
    const offensiveEmojis = useMemo(() => offensiveEmojiProps || [], [offensiveEmojiProps]);

    const prevClassificationConfig = useRef<RichTextClassificationConfig | undefined>(classificationConfig);

    useEffect(() => {
        if (classificationConfig?.enabled) {
            const classificationModule = quillRef.current?.editor?.getModule('classificationModule') as any;
            if (classificationModule && !isEqual(prevClassificationConfig.current, classificationConfig)) {
                prevClassificationConfig.current = classificationConfig;
                classificationModule.classificationConfig = classificationConfig;
                classificationModule.applyClassifications();
            }
        }
    }, [classificationConfig]);

    const toggleImageModal = useCallback(() => setImageUploadModalOpen(prev => !prev), []);

    const getFormats = useMemo(() => {
        const formats = [];
        formats.push(...FORMATS_CONFIGURATIONS[toolbar]);
        if (enableEmojiPicker) {
            formats.push('emoji');
        }
        if (enableAtMention) {
            formats.push('mention');
        }
        if (classificationConfig?.enabled) {
            formats.push(ClassificationBlot.blotName);
        }
        return formats;
    }, [classificationConfig?.enabled, enableAtMention, enableEmojiPicker, toolbar]);

    const handlers = useMemo(() => {
        return {
            image(clicked: boolean) {
                if (clicked) {
                    const range = quillRef.current?.getEditor().getSelection();
                    insertImageCurrentIndexRef.current = range?.index || 0;
                    toggleImageModal();
                }
            },
            video() {
                const editor = quillRef.current?.getEditor();
                try {
                    // @ts-ignore
                    editor.theme?.tooltip?.edit('video');
                } catch (e) {
                    throw e;
                }
            },
            align(value: any) {
                quillRef.current?.editor?.format('align', value);
                const resizeModule = quillRef.current?.editor?.getModule('resize') as QuillResize;
                resizeModule?.repositionElements();
            },
            indent(value: any) {
                quillRef.current?.editor?.format('indent', value);
                const resizeModule = quillRef.current?.editor?.getModule('resize') as QuillResize;
                resizeModule?.repositionElements();
            },
            blockquote(value: any) {
                quillRef.current?.editor?.format('blockquote', value);
                const resizeModule = quillRef.current?.editor?.getModule('resize') as QuillResize;
                resizeModule?.repositionElements();
            },
            strike(value: any) {
                quillRef.current?.editor?.format('strike', value);
                const resizeModule = quillRef.current?.editor?.getModule('resize') as QuillResize;
                resizeModule?.repositionElements();
            },
            header(value: any) {
                quillRef.current?.editor?.format('header', value);
                const resizeModule = quillRef.current?.editor?.getModule('resize') as QuillResize;
                resizeModule?.repositionElements();
            }
        };
    }, [toggleImageModal]);

    const getMentionConfiguration = useCallback(() => {
        return {
            allowedChars: /^[A-Za-z0-9\s\\._\-$]*$/,
            showDenotationChar: false,
            mentionDenotationChars: ['@'],
            source: async (searchTerm: string, renderList: Function, _mentionChar: string) => {
                if (fetchMentionUsers) {
                    const matchedPeople = await fetchMentionUsers(searchTerm);
                    renderList(matchedPeople.map(people => ({...people, value: `@${people.name}`})));

                    const mentionListContainerElement = document.querySelectorAll('.ql-mention-list-container');
                    if (mentionListContainerElement && mentionListContainerElement.length > 0) {
                        Array.from(mentionListContainerElement).forEach(item => {
                            item.setAttribute('tabindex', '0')
                        });
                    }
                }
            },
            onSelect: (item: any, insertItem: Function) => {
                const totalCharsLength = (quillRef.current?.editor?.getModule('maxCharsLimit') as MaxCharsLimitModule).totalCharsLength;
                if (totalCharsLength + item.value.length + 3 < maxCharacterLimit) {
                    insertItem(item);
                }
            },
            renderItem: (item: { id: string; value: string; [key: string]: any }) => {
                const container = document.createElement('div');
                container.className = 'd-flex align-items-center py-2';

                const img = document.createElement('img');
                img.src = item.avatar;
                img.className = 'avatar avatar-sm';
                img.alt = `${item.username} avatar`;

                const innerContainer = document.createElement('div');
                innerContainer.className = 'd-flex flex-column justify-content-center align-items-start ms-2';

                const nameSpan = document.createElement('span');
                nameSpan.className = 'fw-bold text-truncate mention-name';
                nameSpan.textContent = item.name;

                const usernameSpan = document.createElement('span');
                usernameSpan.textContent = `@${item.username}`;

                innerContainer.appendChild(nameSpan);
                innerContainer.appendChild(usernameSpan);
                container.appendChild(img);
                container.appendChild(innerContainer);
                return container;
            }
        };
    }, [fetchMentionUsers, maxCharacterLimit]);

    const findNextFocusableElement = (quillEditor: HTMLElement, parent: HTMLElement) => {
        if (parent) {
            const focusableElementsIdentifier = 'a:not(.ql-tooltip a, [disabled], [data-embeddable]), ' +
                'button:not(.ql-tooltip button, [disabled]):not([tabindex="-1"]), ' +
                'input[type=text]:not(.ql-tooltip input,[disabled]), ' +
                '[tabindex]:not([disabled]):not([tabindex="-1"]), ' +
                '.ql-editor[contenteditable="true"], ' +
                '.file-upload-label, ' +
                'input[type=radio]:not([disabled], .disabled),' +
                'input[type=checkbox]:not([disabled], .disabled)';

            const focusableElements = Array.from(parent.querySelectorAll(focusableElementsIdentifier)).filter((element: any) => {
                return element.offsetWidth > 0 || element.offsetHeight > 0 || element === quillEditor;
            });

            const index = focusableElements.indexOf(quillEditor);
            const hasNextFocusableElement = focusableElements.length > 0 && (index + 1) < focusableElements.length;

            if (hasNextFocusableElement) {
                return focusableElements[index + 1] as HTMLElement;
            } else if (parent.classList.contains('modal')) {
                return focusableElements[0] as HTMLElement;
            }
        }
        return null;
    };

    const focusNextElement = useCallback((editor: any) => {
        const quillEditor = editor.container?.querySelector('.ql-editor');
        const formElement = quillEditor?.closest('form');
        const modalElement = quillEditor?.closest('.modal');

        if (quillEditor) {
            const nextFocusableElement = modalElement ? findNextFocusableElement(quillEditor, modalElement) : findNextFocusableElement(quillEditor, formElement);

            if (nextFocusableElement) {
                const focusTimeoutId = setTimeout(() => {
                    clearInterval(focusTimeoutId);
                    (nextFocusableElement as HTMLElement).focus();
                }, 0);
                return false;
            }
        }
        return true;
    }, []);

    const addEmbeddedImage = (url: string, altText?: string) => {
        if (quillRef.current && quillRef.current.getEditor()) {
            quillRef.current.getEditor().insertEmbed(insertImageCurrentIndexRef.current, 'image', {
                src: url,
                alt: altText,
            }, 'user');
            quillRef.current.getEditor().insertText(insertImageCurrentIndexRef.current + 1, '\n', 'user');
            setTimeout(() => {
                if (quillRef.current?.getEditor()) {
                    quillRef.current.getEditor()?.setSelection(insertImageCurrentIndexRef.current + 2, 0);
                    quillRef.current.getEditor()?.focus();
                }
            }, 300);
        }
    };

    const buildFormData = useCallback((imageData: ImageData) => {
        const file = imageData.toFile();
        const formData = new FormData();
        if (file) {
            const fileExtension = file.name?.substring(file.name.lastIndexOf('.') + 1) ?? 'png';
            const newFileName = `${defaultFileNamePrefix ?? DEFAULT_FILE_NAME_PREFIX}.${fileExtension}`;
            formData.append('file', file, newFileName);
        }
        return formData;
    }, [defaultFileNamePrefix]);

    const imagePasteHandler = useCallback(async (_dataUrl: string | ArrayBuffer, _type: string, imageData: ImageData) => {
        if (uploadImage) {
            try {
                const formData = buildFormData(imageData);
                const fileUploadResponse = await uploadImage(formData, (progressEvent) => {
                    Math.ceil(progressEvent.loaded / (progressEvent.total || 1) * 100);
                });

                if (fileUploadResponse) {
                    quillRef.current?.getEditor().focus();
                    const range = quillRef.current?.getEditor().getSelection();
                    insertImageCurrentIndexRef.current = range?.index || 0;
                    addEmbeddedImage(fileUploadResponse.url, '');
                }
            } catch (e: any) {
                alert('Error is happened while uploading a data image');
            }
        }
    }, [buildFormData, uploadImage]);

    const modules = useMemo(() => ({
        toolbar: {
            container: TOOLBAR_CONFIGURATIONS[toolbar],
            handlers
        },
        keyboard: {
            bindings: {
                tab: {
                    key: 9,
                    handler() {
                        quillRef.current?.editor?.blur();
                        focusNextElement(quillRef.current?.editor);
                    }
                },
                indent: {
                    key: 'Tab',
                    format: ['blockquote', 'list']
                }
            }
        },
        videoPaste: {},
        imagePaste: {},
        linkFormat: {},
        imageDropAndPaste: {
            handler: imagePasteHandler
        },
        'emoji-toolbar': true,
        'emoji-shortname': enableEmojiPicker ? {
            emojiList: offensiveEmojis.length > 0 ? (emojiList as Emoji[]).filter(item => !offensiveEmojis.includes(item.shortname)) : emojiList,
            fuse: {
                shouldSort: true,
                threshold: 0.1,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 1,
                keys: ['shortname']
            }
        } : false,
        'emoji-textarea': enableEmojiPicker,
        'counter': characterLeftLabel && {maxCharacter: maxCharacterLimit, label: characterLeftLabel},
        mention: enableAtMention ? getMentionConfiguration() : false,
        markdownShortcuts: {},
        classificationModule: {configData: classificationConfig},
        maxCharsLimit: (maxCharacterLimit || characterLeftLabel) && {maxCharacters: maxCharacterLimit},
        resize: {
            modules: ['Resize', 'DisplaySize']
        }
    }), [toolbar, handlers, focusNextElement, imagePasteHandler, enableEmojiPicker, offensiveEmojis, characterLeftLabel, maxCharacterLimit, enableAtMention, getMentionConfiguration, classificationConfig]);

    const getDefaultValue = useCallback(() => {
        return HtmlConverter.toRenderHtmlFormat(defaultValue);
    }, [defaultValue]);

    const isEmptyHtml = (htmlString: any) => {
        const emptyRegex = /^(<(p|h1|h2|h3|h4|h5|h6)\s*(class=["'][\w-\s]+["'])?>(<br>|<br\/>|<br\s\/>|\s+)<\/(p|h1|h2|h3|h4|h5|h6)>)+$/gm;
        return emptyRegex.test(htmlString);
    };

    const onChangeEvent = useCallback((value: string, delta: DeltaStatic, source: EmitterSource, editor: UnprivilegedEditor) => {
        let hasEmptyValue;
        if (classificationConfig?.enabled && value?.length) {
            const parsedDocs: Document = new DOMParser().parseFromString(value, 'text/html');
            const allClassificationLabels = parsedDocs.querySelectorAll('.classification-label');
            if (allClassificationLabels.length) {
                Array.from(allClassificationLabels, cLabel => cLabel.remove());
            }
            hasEmptyValue = isEmptyHtml(parsedDocs?.body?.innerHTML ?? '');
        } else {
            hasEmptyValue = isEmptyHtml(value);
        }

        if (onChange) {
            onChange(hasEmptyValue ? '' : value, delta, source, editor);
        }
    }, [classificationConfig?.enabled, onChange]);

    useEffect(() => {
        ImageBlot.basePath = externalFileBasePath;
    }, [externalFileBasePath]);

    useEffect(() => {
        let quillMarkdown: QuillMarkdown;
        const editor = quillRef.current?.getEditor();
        if (editor) {
            const options: any = {ignoreTags: ['link']};
            quillMarkdown = new QuillMarkdown(editor, options);
        }
        return () => {
            quillMarkdown?.destroy();
        };
    }, []);

    useImperativeHandle(forwardedRef, () => {
        const setText = (value: string) => quillRef.current?.editor?.setText(value, 'user');

        const setHtml = (value: string) => {
            const deltas = quillRef.current?.editor?.clipboard.convert({html: value});
            if (deltas) {
                quillRef.current?.editor?.setContents(deltas, 'user');
            }
        };

        return {
            setText(value: string) {
                quillRef?.current?.focus();
                setText(value);
            },
            setTextWithBlur(value: string) {
                quillRef?.current?.focus();
                setText(value);
                quillRef.current?.blur();
            },
            setHtml(value: string) {
                setHtml(value);
            },
            setHtmlWithBlur(value: string) {
                quillRef?.current?.focus();
                setHtml(value);
                quillRef.current?.blur();
            },
            setCursorAtEnd() {
                const editor = quillRef.current?.getEditor();
                editor?.setSelection(editor?.getLength(), 0);
            },
            insertClassification(text: string) {
                const editor = quillRef.current?.getEditor();
                const selection = editor?.getSelection(true);
                if (editor && selection) {
                    const [line] = editor!.getLine(selection.index) as any;
                    const start = editor!.getIndex(line);
                    editor!.insertText(start, text);
                    if (!isEmpty(editor!.getFormat(start, text.length))) {
                        editor!.removeFormat(start, text.length);
                    }

                }
            },
            hasInvalidClassifications() {
                const classificationModule = quillRef.current?.editor?.getModule('classificationModule') as ClassificationModule;
                return classificationModule?.hasInvalidClassificationInputs() ?? true;
            },
            isCharacterLimitExceeded(): boolean {
                const remainingCharactersModule = quillRef.current?.editor?.getModule('counter') as RemainingCharactersModule;
                return remainingCharactersModule?.isCharacterLimitExceeded();
            },
            insertTextAtEnd(text: string) {
                const editor = quillRef.current?.getEditor();
                editor?.insertText(editor?.getLength(), text);
            },
            clear() {
                setText('');
            },
            focus() {
                quillRef?.current?.focus();
            },
            blur() {
                quillRef?.current?.blur();
            },
            getReactQuill(): ReactQuill | null {
                return quillRef?.current;
            },
            getPlainText() {
                return quillRef.current?.getEditor().getText() || '';
            },
            getHtmlContent() {
                return quillRef.current?.getEditor().root.innerHTML || '';
            }
        };
    }, []);

    useEffect(() => {
        RichTextEditorHelper.fixQuillAccessibility(id, ariaLabelledBy, ariaLabel);
    }, [id, ariaLabelledBy, ariaLabel]);

    useEffect(() => {
        if (debug) {
            Quill.debug(debug);
        }
    }, [debug]);

    useEffect(() => {
        if (enableEmojiPicker) {
            const closeEmojiPlate = () => {
                const eleEmojiPlate = document.getElementById('textarea-emoji');
                eleEmojiPlate?.remove();
            };

            const curseEmoji = () => {
                offensiveEmojis.forEach(item => {
                    const selector = `.ap-${item.replace(/:/g, '').replace(/&#x?/g, '').replace(/;/g, '')}`;
                    const element = document.querySelector(selector);
                    if (element) {
                        element.classList.add('d-none');
                    }
                });
            };

            const resetEmojiPopupPosition = (emojiPopups: NodeListOf<Element>) => {
                Array.from(emojiPopups).forEach((emojiPopup: Element) => {
                    if (emojiPopup) {
                        const style = getComputedStyle(emojiPopup);
                        if (style && +style.top.replace('px', '') < 0) {
                            if (window.innerWidth < 420) {
                                (emojiPopup as HTMLElement).style.top = '-420px';
                            } else {
                                (emojiPopup as HTMLElement).style.top = -(+style.height.replace('px', '') + 30) + 'px';
                            }
                        }
                    }
                });
            };
            const emojiPopupPosition = () => {
                const emojiControlElements = document.querySelectorAll('.textarea-emoji-control');
                if (emojiControlElements) {
                    Array.from(emojiControlElements).forEach((element: Element) => {
                        element.addEventListener('click', () => {
                            const emojiPopups = document.querySelectorAll('#textarea-emoji');
                            if (emojiPopups) {
                                resetEmojiPopupPosition(emojiPopups);
                                curseEmoji();
                            }
                        });
                    });
                }
            };

            const editorElement = document.querySelectorAll('.new-rich-text-editor');
            Array.from(editorElement).forEach(el => {
                el.querySelectorAll('.textarea-emoji-control').forEach(emojiControl => {
                    emojiControl.setAttribute('aria-hidden', 'true');
                });
                const modalElm = el?.closest('.modal');
                if (modalElm) {
                    modalElm.addEventListener('click', (event) => {
                        const clickedElement = event.target as HTMLElement;
                        const emojiButton = clickedElement.parentElement?.closest('.textarea-emoji-control');
                        const emojiPlate = clickedElement.parentElement?.closest('#textarea-emoji');
                        if (!emojiButton && !emojiPlate) {
                            closeEmojiPlate();
                        }

                        const qlPicker = clickedElement.parentElement?.closest('.ql-header.ql-picker');
                        if (!qlPicker) {
                            const headerPicker = document.querySelector('.modal .ql-header.ql-picker');
                            if (headerPicker) {
                                headerPicker.classList.remove('ql-expanded');
                            }
                        }
                        curseEmoji();
                    });
                    emojiPopupPosition();
                }
            });

            const containerElement = document.querySelectorAll('.ql-container');
            if (containerElement && containerElement.length > 0) {
                Array.from(containerElement).forEach(item => {
                    item.classList.add('top-emoji');
                });
            }

            document.addEventListener('click', (event: MouseEvent) => {
                const clickedElement = event.target as Element;
                if (clickedElement.classList.contains('bem') && clickedElement.classList.contains('ap')) {
                    closeEmojiPlate();
                }
                if (clickedElement.classList.contains('i-nature') || clickedElement.classList.contains('i-people')
                    || clickedElement.classList.contains('i-food') || clickedElement.classList.contains('i-symbols')
                    || clickedElement.classList.contains('i-activity') || clickedElement.classList.contains('i-travel')
                    || clickedElement.classList.contains('i-objects') || clickedElement.classList.contains('i-flags')) {
                    curseEmoji();
                }
            });
            curseEmoji();
            emojiPopupPosition();
        }
    }, [enableEmojiPicker, offensiveEmojis]);


    return (
        <section onDrop={event => event.preventDefault()} onDragOver={event => event.preventDefault()}>
            <ReactQuill
                id={id}
                ref={quillRef}
                placeholder={placeholder}
                className={`new-rich-text-editor ${readonly ? 'readonly' : ''} ${className}`}
                modules={modules}
                formats={getFormats}
                theme="ideascale-snow"
                defaultValue={getDefaultValue()}
                readOnly={readonly}
                tabIndex={tabIndex}
                onChange={onChangeEvent}
                onBlur={onBlur}
                onFocus={onFocus}
                onChangeSelection={onChangeSelection}
            />

            {
                imageUploadModalOpen &&
                <ImageUploadAndLinkModal
                    open={imageUploadModalOpen}
                    toggle={toggleImageModal}
                    svgIconPath={svgIconPath}
                    existingAttachments={existingAttachments}
                    onSelectAttachment={(attachment, altText) => {
                        addEmbeddedImage(attachment, altText);
                    }}
                    getQuill={() => quillRef.current?.getEditor()}
                    uploadImage={uploadImage}
                    maxFileSize={maxFileSize}
                    externalFileBasePath={externalFileBasePath}
                    enableExternalImageEmbedOption={enableExternalImageEmbedOption}
                />
            }
        </section>
    );
}));