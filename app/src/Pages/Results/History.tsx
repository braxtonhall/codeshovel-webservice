import {FadeableElement, IFadeableElementProps, IFadeableElementState} from "../../FadeableElement";
import {ReactNode} from "react";
import * as React from "react";
import {IChange, ICommit, ICommitx, IHistoryTransport, IMethodTransport} from "../../Types";
import {ReactCommit} from "./Commit";
import {Changes} from "../../Enums";
import {Constants} from "../../Constants";

export class History {
	private commits: ICommitx[];

	constructor(history: IHistoryTransport, startFile: string) {
		this.commits = History.buildCommits(history, startFile);
	}

	private static buildCommits(history: IHistoryTransport, startFile: string): ICommitx[] {
		const commits: ICommitx[] = Array.from(Object.values(history)).slice();
		let file: string | undefined = startFile;
		for (const commit of commits) {
			commit["file"] = file;
			if (commit.type === Changes.FILE_RENAME || commit.type === Changes.MOV_FROM_FILE) {
				file = commit.extendedDetails.oldPath;
				commit.diff = History.buildFileChangeDiff(commit.extendedDetails.oldPath, commit.extendedDetails.newPath);
			} else if (commit.type.startsWith(Changes.MULTI_CHANGE)) {
				if (commit.subchanges) {
					for (const change of commit.subchanges) {
						if (change.diff) {
							commit.diff = change.diff;
							break;
						}
					}
				}
				if (commit.type.includes(Changes.FILE_RENAME) || commit.type.includes(Changes.MOV_FROM_FILE)) {
					const subChanges: IChange[] = commit.subchanges ? commit.subchanges : [];
					for (const subChange of subChanges) {
						if (subChange.type === Changes.FILE_RENAME || subChange.type === Changes.MOV_FROM_FILE) {
							file = subChange.extendedDetails.oldPath;
							if (!commit.diff) {
								commit.diff = History.buildFileChangeDiff(subChange.extendedDetails.oldPath, subChange.extendedDetails.newPath);
							}
							break;
						}
					}
				}
			}

		}

		return commits;
	}

	private static buildFileChangeDiff(oldPath: string, newPath: string): undefined | string {
		if (oldPath !== newPath) {
			return `@@ -1,1 +1,1 @@\n-\t${oldPath}\n+\t${newPath}\n`;
		}
	}

	public getCommits(): ICommit[] {
		return this.commits.slice();
	}
}

export class ReactHistory extends FadeableElement<IReactHistoryProps, IReactHistoryState> {
	protected readonly fadeOutTime: number = 300;


	constructor(props: IReactHistoryProps) {
		super(props);
		this.state = {onScreen: this.props.active};
	}


	protected createReactNode(): ReactNode {
		const marginTop: number = Math.log(this.props.windowHeight) * Constants.COMMIT_ROW_HEIGHT + 3;
		return(
			<div
				className="Panel"
				style={{
					marginTop,
					display: "block",
					width: "100%",
					marginBottom: "1em",
					overflowY: "scroll",
				}}
			>
				{
					this.props.history.getCommits().map((commit: ICommit) => {
						return (
							<ReactCommit
								commit={commit}
								key={`${commit.commitName}-${this.props.method.longName}`}
								active={this.props.active}
								repo={this.props.repo}
								windowHeight={this.props.windowHeight}
								windowWidth={this.props.windowWidth}
								method={this.props.method}
							/>
						);
					})
				}
			</div>
		);
	}
}

export interface IReactHistoryProps extends IFadeableElementProps {
	history: History;
	repo: string;
	windowHeight: number;
	windowWidth: number;
	method: IMethodTransport;
}

export interface IReactHistoryState extends IFadeableElementState {

}
