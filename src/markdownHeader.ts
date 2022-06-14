import { MarkdownHeaderNode } from "./markdownHeaderNode";

export class MarkdownHeader {
	node?: MarkdownHeaderNode;
    lineNumEnd?: number; //nil表示到末尾
    constructor(
        public title: string,
        public lineNum: number,
        public depth: number) {
    }
}