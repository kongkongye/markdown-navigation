import * as vscode from "vscode";
import { ProviderResult } from "vscode";
import { MarkdownHeader } from './markdownHeader';
import { MarkdownHeaderNode } from './markdownHeaderNode';

export class MarkdownHeaderProvider implements vscode.TreeDataProvider<MarkdownHeaderNode>
{
	private tree: MarkdownHeaderNode[] = [];
	private onHeaderListChanged: vscode.EventEmitter<MarkdownHeaderNode | undefined> = new vscode.EventEmitter<MarkdownHeaderNode | undefined>();
	onDidChangeTreeData: vscode.Event<MarkdownHeaderNode | undefined> = this.onHeaderListChanged.event;

	getTreeItem(element: MarkdownHeaderNode): MarkdownHeaderNode {
		return element;
	}

	getChildren(element?: MarkdownHeaderNode): Thenable<MarkdownHeaderNode[]> {
		return element ? Promise.resolve(element.childNodes) : Promise.resolve(this.tree);
	}

	getParent?(element: MarkdownHeaderNode): ProviderResult<MarkdownHeaderNode> {
		return element.parent
	}

	setHeaderList(headerList: MarkdownHeader[]) {
		this.tree = [];
		let rootStack: MarkdownHeaderNode[] = [];
		headerList.forEach(header => {
			while ((rootStack.length > 0) && (rootStack[rootStack.length - 1].depth >= header.depth)) {
				rootStack.pop();
			}
			let top = rootStack.length > 0 ? rootStack[rootStack.length - 1] : undefined;
			let headerNode = this.generateNode(header, top);
			header.node = headerNode
			if (top) {
				top.childNodes.push(headerNode);
			} else {
				this.tree.push(headerNode);
			}
			rootStack.push(headerNode);
		});
		this.tree.forEach(node => {
			this.refreshNodeCollapsibleState(node);
		});
		this.onHeaderListChanged.fire(undefined);
	}

	private refreshNodeCollapsibleState(node: MarkdownHeaderNode) {
		if (node.childNodes.length > 0) {
			node.collapsibleState = vscode.TreeItemCollapsibleState.Expanded
			node.childNodes.forEach(childNode => {
				this.refreshNodeCollapsibleState(childNode);
			});
		}
	}

	private generateNode(header: MarkdownHeader, top: MarkdownHeaderNode | undefined): MarkdownHeaderNode {
		let childNodes: MarkdownHeaderNode[] = []
		return new MarkdownHeaderNode(
			header.title,
			vscode.TreeItemCollapsibleState.None,
			header.depth,
			{
				command: 'extension.selectHeader',
				title: 'Select Header',
				arguments: [header.lineNum]
			},
			top,
			childNodes
		)
	}
}