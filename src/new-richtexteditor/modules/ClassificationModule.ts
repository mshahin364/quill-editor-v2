import Quill from 'quill';
import isEmpty from 'lodash/isEmpty';
import {ClassificationBlot, ClassificationBlotValue} from '../blots/ClassificationBlot';
import {ClassificationTextParser} from '../utils/ClassificationTextParser';
import {RichTextClassificationConfig} from '../RichTextClassificationConfig';
import {CommonUtil} from "../utils/CommonUtil.ts";

export class ClassificationModule {
    quill: Quill;
    classificationConfig: RichTextClassificationConfig;

    constructor(quill: Quill, options: { configData: RichTextClassificationConfig }) {
        this.quill = quill;
        this.classificationConfig = options.configData;

        this.quill.once('text-change', _delta => {
            const invalidClassifications = ((this.quill.scroll.descendants && this.quill.scroll.descendants(ClassificationBlot)) || [])
                .filter((classificationBlot) => !(classificationBlot as unknown as ClassificationBlot).isValid());
            if (invalidClassifications.length > 0) {
                invalidClassifications.forEach((invalidClassification: ClassificationBlot) => invalidClassification.remove());
            }
        });

        this.quill.on('text-change', _delta => {
            if (this.classificationConfig.enabled) {
                if (!isEmpty(this.classificationConfig.classifications)) {
                    setTimeout(() => this.applyClassifications());
                }
            } else {
                setTimeout(() => {
                    const existingClassifications = ((this.quill.scroll.descendants && this.quill.scroll.descendants(ClassificationBlot)) || []) as ClassificationBlot[];
                    existingClassifications.forEach((classification) => classification.replaceWithTextValue());
                });
            }
        });
    }

    public hasInvalidClassificationInputs() {
        const existingClassifications = ((this.quill.scroll.descendants && this.quill.scroll.descendants(ClassificationBlot)) || []) as ClassificationBlot[];
        const classificationParser = new ClassificationTextParser(this.classificationConfig);

        return existingClassifications.some(classificationBlot => {
            return classificationBlot.hasPreviousSiblings() ||
                classificationBlot.hasNonParagraphParent() ||
                !classificationParser.isValidInput((classificationBlot.domNode as HTMLElement)?.innerText ?? '');
        });
    }

    public applyClassifications() {
        const existingClassifications = ((this.quill.scroll.descendants && this.quill.scroll.descendants(ClassificationBlot)) || []) as ClassificationBlot[];
        const classificationParser = new ClassificationTextParser(this.classificationConfig);

        const invalidClassifications = existingClassifications.filter(classificationBlot =>
            classificationBlot.hasPreviousSiblings() ||
            classificationBlot.hasNonParagraphParent() ||
            !classificationParser.isValidInput(classificationBlot.text));

        if (invalidClassifications.length > 0) {
            invalidClassifications.forEach((classification) => classification.replaceWithTextValue());
        } else {
            const existingText = (this.quill.scroll && this.quill.scroll.domNode && this.quill.scroll.domNode.innerHTML) || '';
            if (CommonUtil.hasRegexMatch(classificationParser.getClassificationInputRegex(), existingText)) {
                const matchedLines = this.quill.getLines()
                    .filter(line => line.domNode &&
                        line.domNode.nodeName === 'P' &&
                        CommonUtil.hasRegexMatch(classificationParser.getClassificationQueryRegex(), line.domNode.innerHTML) &&
                        classificationParser.isValidInput(CommonUtil.getRegexMatchedText(classificationParser.getClassificationQueryRegex(), line.domNode.innerHTML)[0])
                    );

                if (matchedLines.length > 0) {
                    const line = matchedLines[0];
                    const matchedText = CommonUtil.getRegexMatchedText(classificationParser.getClassificationQueryRegex(), line.domNode.innerHTML)[0];

                    if (classificationParser.isValidInput(matchedText)) {
                        const start = this.quill.getIndex(line);
                        this.quill.insertEmbed(start, ClassificationBlot.blotName,
                            {
                                text: `(${classificationParser.prepareClassificationText(matchedText)})`,
                                classification: classificationParser.getClassification(matchedText),
                                extensions: classificationParser.getExtensions(matchedText)
                            } as ClassificationBlotValue);
                        this.quill.insertText(start + 1, ' ');
                        this.quill.deleteText(start + 2, matchedText.length);
                    }
                }
            }
        }
    }
}