enum CodeBlockType {
    none,
    backquote,
    tiled
}

const REGEXP_CODE_BLOCK_BACKQUOTE = /^```/;
const REGEXP_CODE_BLOCK_TILDE = /^~~~/;

export class CodeBlockChecker {
    private codeBlockStatus: CodeBlockType = CodeBlockType.none;

    public pushAndCheck(text: string) {
        if (text.match(REGEXP_CODE_BLOCK_BACKQUOTE)) {
            if (this.codeBlockStatus === CodeBlockType.none) {
                this.codeBlockStatus = CodeBlockType.backquote
            } else if (this.codeBlockStatus === CodeBlockType.backquote) {
                this.codeBlockStatus = CodeBlockType.none;
            }
        } else if (text.match(REGEXP_CODE_BLOCK_TILDE)) {
            if (this.codeBlockStatus === CodeBlockType.none) {
                this.codeBlockStatus = CodeBlockType.tiled
            } else if (this.codeBlockStatus === CodeBlockType.tiled) {
                this.codeBlockStatus = CodeBlockType.none;
            }
        }
        return this.codeBlockStatus !== CodeBlockType.none;
    }
}