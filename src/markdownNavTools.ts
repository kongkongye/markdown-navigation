import * as vscode from 'vscode';
import { CodeBlockChecker } from './codeBlockChecker';
import { info } from './extension';
import { MarkdownHeader } from './markdownHeader';
import { MarkdownHeaderProvider } from './markdownHeaderProvider'
import { MarkdownHeaderNode } from './markdownHeaderNode';
import { binarySearch } from './utils';

const REGEXP_HEADER = /^(\#{1,6})\s*(.+)/;
const REGEXP_SPECIAL_HEADER_1 = /^=+$/;
const REGEXP_SPECIAL_HEADER_2 = /^-+$/;

export class MarkdownNavTools {
    constructor(private markdownHeaderProvider: MarkdownHeaderProvider, private markdownNavView: vscode.TreeView<MarkdownHeaderNode>) { }

    private currentTextEditor?: vscode.TextEditor
    private headerList?: MarkdownHeader[]
    private lastSelectLineNum: number = -1

    /**
     * 更新toc
     */
    public updateToc() {
        const headerList_ = this.getHeaderList()
        if (!headerList_) {
            return
        }
        this.currentTextEditor = vscode.window.activeTextEditor
        this.headerList = headerList_
        this.markdownHeaderProvider.setHeaderList(this.headerList);
        info.appendLine('update toc');
    }

    /**
     * 更新toc里的选中项
     */
    public updateTocSelection(e: vscode.TextEditorSelectionChangeEvent) {
        if (!this.isInMarkdownEditor()) {
            return
        }
        if (vscode.window.activeTextEditor !== this.currentTextEditor) {
            return
        }
        //当前没有显示toc，直接返回
        if (!this.headerList) {
            return
        }

        //当前选中的行号为第一个选择区域的active光标位置行号
        const selectLineNum = e.selections[0].active.line

        //当前选中的行号与上次选中的行号相同，直接返回
        if (selectLineNum === this.lastSelectLineNum) {
            return
        }

        //更新
        this.lastSelectLineNum = selectLineNum

        //二分查找headerList
        let headerList = this.headerList
        let headerIndex = binarySearch(headerList, selectLineNum, (tar: number, item: MarkdownHeader) => {
            if (tar < item.lineNum) {
                return -1
            } else if (item.lineNumEnd !== undefined && tar > item.lineNumEnd) {
                return 1
            } else {
                return 0
            }
        })
        if (headerIndex < 0) {
            this.cancelTocSelection()
            return
        }
        //更新选择
        let header = headerList[headerIndex]
        if (header && header.node) {
            this.markdownNavView.reveal(header.node, { select: true });
            info.appendLine('select: ' + header.title);
        }
    }

    public cancelTocSelection() {
        if (this.markdownNavView.selection) {
            for (const select of [...this.markdownNavView.selection]) {
                this.markdownNavView.reveal(select, { select: false });
            }
            info.appendLine('cancel select');//todo: 无效果？
        }
    }

    public revealLine(lineNum: number) {
        if (this.currentTextEditor) {
            let selection = new vscode.Selection(lineNum, 0, lineNum, 0)
            this.currentTextEditor.selection = selection
            this.currentTextEditor.revealRange(selection, vscode.TextEditorRevealType.AtTop)
        }
    }

    private isInMarkdownEditor(): vscode.TextDocument | undefined {
        if (vscode.window.activeTextEditor) {
            let doc = vscode.window.activeTextEditor.document;
            if (doc.languageId === "markdown") {
                return doc
            }
        }
    }

    private getHeaderList(): MarkdownHeader[] | undefined {
        let doc = this.isInMarkdownEditor()
        if (doc) {
            let headerList = [];
            let codeBlockChecker = new CodeBlockChecker();

            for (let lineNum = 0; lineNum < doc.lineCount; ++lineNum) {
                let lineText = doc.lineAt(lineNum).text

                // Skip CodeBlock
                if (codeBlockChecker.pushAndCheck(lineText)) { continue; }

                // Special Header
                if (lineNum > 0) {
                    let lastLineNum = lineNum - 1
                    let lastLineText = doc.lineAt(lastLineNum).text
                    if (lineText.match(REGEXP_SPECIAL_HEADER_1)) {
                        headerList.push(new MarkdownHeader(lastLineText, lastLineNum, 1));
                        continue;
                    } else if (lineText.match(REGEXP_SPECIAL_HEADER_2)) {
                        headerList.push(new MarkdownHeader(lastLineText, lastLineNum, 2));
                        continue;
                    }
                }

                let headerResult = lineText.match(REGEXP_HEADER);
                if (headerResult) {
                    headerList.push(new MarkdownHeader(headerResult[2], lineNum, headerResult[1].length));
                }
            }

            //填充end行号
            for (let i = 0; i < headerList.length; ++i) {
                const header = headerList[i]
                if (i + 1 < headerList.length) {
                    header.lineNumEnd = headerList[i + 1].lineNum - 1
                }
            }

            return headerList;
        }
    }
}
