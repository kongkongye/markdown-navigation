import * as vscode from 'vscode';
import { MarkdownHeaderProvider } from './markdownHeaderProvider'
import { MarkdownNavTools } from './markdownNavTools'

export let info = vscode.window.createOutputChannel("MarkdownNavigation");

export function activate(context: vscode.ExtensionContext) {
    let markdownHeaderProvider = new MarkdownHeaderProvider();
    const markdownNavView = vscode.window.createTreeView("MarkdownNavigation", {treeDataProvider: markdownHeaderProvider});
    let markdownNavTools = new MarkdownNavTools(markdownHeaderProvider, markdownNavView);
    markdownNavTools.updateToc();
    context.subscriptions.push(markdownNavView);
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection((e) => markdownNavTools.updateTocSelection(e)));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => markdownNavTools.updateToc()));
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => markdownNavTools.updateToc()));
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(() => markdownNavTools.updateToc()));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectHeader', lineNum => markdownNavTools.revealLine(lineNum)));
}
