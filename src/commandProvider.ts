import * as vscode from "vscode"
import { attackTags } from "./extension"

export async function addTagQuickpick() {
    const buildQuickPickItems = (callback: (value: vscode.QuickPickItem[]) => void) => {
        callback(
            attackTags
                .map((tag: any) => {
                    return { label: `${tag["tag"]} - ${tag["name"]}`, detail: `${tag["description"]}` }
                })
                .sort()
                .reverse(),
        )
    }

    const target = await vscode.window.showQuickPick<vscode.QuickPickItem>(
        new Promise<vscode.QuickPickItem[]>(buildQuickPickItems),
        {
            placeHolder: "Registry ...",
            matchOnDescription: true,
            matchOnDetail: true,
        },
    )
    if (target !== undefined && vscode.window.activeTextEditor!.selection) {
        const tagsRegex = new RegExp("^tags:$\n(\\s*-.+$)*", "m")
        let docText = vscode.window.activeTextEditor?.document.getText()!
        let tags = tagsRegex.exec(docText)
        let tab = "    "
        if (
            vscode.window.activeTextEditor?.options.tabSize &&
            typeof vscode.window.activeTextEditor?.options.tabSize !== "string"
        ) {
            tab = ` `.repeat(vscode.window.activeTextEditor?.options.tabSize)
        }
        let tagtoadd = target?.label.match("(.+?) -")![1].toLowerCase()
        if (tagtoadd.match(/^ta.*/)) {
            // Use actual name instead
            tagtoadd = target?.label.match(".+ - (.+)")![1].replace(/\s/g, "_").toLocaleLowerCase()
        }
        if (tags) {
            let index = docText.indexOf(tags[0]) + tags[0].length

            let pos = vscode.window.activeTextEditor?.document.positionAt(index)
            vscode.window.activeTextEditor?.edit(textEdit => {
                textEdit.insert(
                    vscode.window.activeTextEditor?.document.positionAt(index)!,
                    `\n${tab}- attack.${tagtoadd}`,
                )
            })
        } else {
            vscode.window.activeTextEditor!.document.lineAt(vscode.window.activeTextEditor!.selection.active.line).range
            vscode.window.activeTextEditor?.edit(textEdit => {
                textEdit.insert(vscode.window.activeTextEditor?.selection.end!, `${tab}- attack.${tagtoadd}`)
            })
        }
    }
}
