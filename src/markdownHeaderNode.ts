import * as vscode from "vscode";

export class MarkdownHeaderNode extends vscode.TreeItem {
	constructor(
		public label: string,
		public collapsibleState: vscode.TreeItemCollapsibleState,
		public depth: number,
		public command: vscode.Command,
		public parent: MarkdownHeaderNode | undefined,
		public childNodes: MarkdownHeaderNode[]
	) {
		super(label, collapsibleState);
	}
}