import {IFadeableElementState} from "../../FadeableElement";
import {Constants} from "../../Constants";
import {ReactNode} from "react";
import * as React from "react";
import {IChange, ICommitx, IMethodTransport} from "../../Types";
import {Changes} from "../../Enums";
import {ICommitRowProps, ReactCommitRow} from "./CommitRow";
import {RequestController} from "../../RequestController";

export class ReactCommit extends ReactCommitRow<IReactCommitProps, IReactCommitState> {
	protected readonly fadeOutTime: number = 300;
	private diffDeleter: any = undefined;
	private changes: IChange[];
	private longFile: string | undefined;
	private authorRequested: boolean;
	private authorLink: string;
	private readonly commitLink: string | undefined;
	private readonly fileLink: string | undefined;
	private readonly file: string | undefined;
	private readonly sha: string;
	private readonly diffText: string;
	private readonly date: string;
	private readonly time: string;
	private readonly type: string;
	private readonly diffId: string;
	private readonly extension: string | undefined;

	constructor(props: IReactCommitProps) {
		super(props);
		this.state = {onScreen: this.props.active, diff: false, details: false, diffVisible: false};
		if (this.props.commit.type.startsWith(Changes.MULTI_CHANGE) && this.props.commit.subchanges) {
			this.changes = this.props.commit.subchanges;
		} else {
			this.changes = [this.props.commit]
		}
		this.authorRequested = false;
		[this.file, this.extension] = this.getFileName();
		this.diffText = this.chooseDiffText();
		this.date = this.getDate();
		this.time = this.getTime();
		this.type = this.getChangeType();
		this.diffId = `${this.props.commit.commitName}-${this.props.method.startLine}-${this.props.method.methodName}-diff`;
		this.sha = this.props.commit.commitName.slice(0, 7);
		this.commitLink = this.getCommitLink();
		this.fileLink = this.getFileInCommitLink();
		this.authorLink = this.getAuthorLink();
		this.setUpColours();
		this.goToAuthor = this.goToAuthor.bind(this);
		this.goToCommit = this.goToCommit.bind(this);
		this.goToFileInCommit = this.goToFileInCommit.bind(this);
		this.toggleDiff = this.toggleDiff.bind(this);
		this.toggleDetails = this.toggleDetails.bind(this);
		this.getClassName = this.getClassName.bind(this);
		this.getDate = this.getDate.bind(this);
		this.getHeight = this.getHeight.bind(this);
		this.enableDiff = this.enableDiff.bind(this);
		this.getBackgroundImage = this.getBackgroundImage.bind(this);
		this.getFontSize = this.getFontSize.bind(this);
	}

	private getCommitLink(): string | undefined {
		const baseUrl: string = this.props.repo.replace(".git", "");
		const link: string = `${baseUrl}/commit/${this.props.commit.commitName}`;
		if(baseUrl !== "") {
			return link;
		}
	}

	private getFileInCommitLink(): string | undefined {
		const baseUrl: string = this.props.repo.replace(".git", "");
		const link: string = `${baseUrl}/blob/${this.props.commit.commitName}/${this.props.commit.file}`;
		if(this.file && baseUrl !== "") {
			return link;
		}
	}

	private getAuthorLink(): string {
		return `https://github.com/search?q=${this.props.commit.commitAuthor.replace(' ', '+')}&type=Users`;
	}

	private goToAuthor(event: any): void {
		event.preventDefault();
		if (!this.authorRequested) {
			this.authorRequested = true;
			const link: string[] = this.props.repo.replace(".git", "").split('/');
			const org: string = link[link.length - 2];
			const repo: string = link[link.length - 1];
			RequestController.getAuthorUrl(org, repo, this.props.commit.commitName)
				.then((authorUrl: string) => {
					this.authorLink = authorUrl;
					window.open(this.authorLink, "_blank");
				}).catch((err) => {
					window.open(this.authorLink, "_blank");
				});
		} else {
			window.open(this.authorLink, "_blank");
		}
	}

	private goToCommit(event: any): void {
		event.preventDefault();
		window.open(this.commitLink, "_blank");
	}

	private goToFileInCommit(event: any): void {
		event.preventDefault();
		window.open(this.fileLink, "_blank");
	}

	private chooseDiffText(): string {
		if (!this.props.commit.diff) {
			return "Diff";
		} else if (this.props.commit.type === Changes.MOV_FROM_FILE || this.props.commit.type === Changes.FILE_RENAME) {
			return "Path";
		} else if (this.props.commit.type !== Changes.MULTI_CHANGE) {
			return "Code";
		} else {
			return (this.props.commit.subchanges && this.props.commit.subchanges.some((change: IChange) => {
				return change.type !== Changes.FILE_RENAME && change.type !== Changes.MOV_FROM_FILE && change.diff !== undefined;
			})) ? "Code" : "Path";
		}
	}

	private getBackgroundImage(change?: string): string {
		if (!change) {
			change = this.props.commit.type;
		}
		if (change.startsWith(Changes.MULTI_CHANGE)) {
			change = Changes.MULTI_CHANGE;
		}
		return Constants.CHANGE_IMAGES[change];
	}

	private getChangeType(change?: string): string {
		if (!change) {
			change = this.props.commit.type;
		}
		if (change.startsWith(Changes.MULTI_CHANGE)) {
			change = Changes.MULTI_CHANGE;
		}
		return Constants.CHANGE_TYPES[change];
	}

	private getClassName(change?: string): string {
		if (!change) {
			change = this.props.commit.type;
		}
		if (change.startsWith(Changes.MULTI_CHANGE)) {
			change = Changes.MULTI_CHANGE;
		}
		return change;
	}

	private getDescription(ichange?: IChange): string {
		if (!ichange) {
			ichange = this.props.commit;
		}
		let change = ichange.type;
		if (change.startsWith(Changes.MULTI_CHANGE)) {
			change = Changes.MULTI_CHANGE;
		}
		switch (change) {
			case Changes.EXCEPS_CHANGE:
			case Changes.MOD_CHANGE:
				let oldVal = ichange.extendedDetails.oldValue;
				oldVal = oldVal.replace(/^\[/, "").replace(/]$/, "");
				let newVal = ichange.extendedDetails.newValue;
				newVal = newVal.replace(/^\[/, "").replace(/]$/, "");
				if (ichange.extendedDetails && ichange.extendedDetails.oldValue && ichange.extendedDetails.newValue) {
					const details = oldVal === "" ? ` Added \`${newVal}\`` : newVal === "" ? ` Removed \`${oldVal}\`` : `\`${oldVal}\` to \`${newVal}\``;
					return `${Constants.CHANGE_DESCRIPTIONS[change]}:${details}`;
				} else {
					break;
				}
			case Changes.FILE_RENAME:
			case Changes.MOV_FROM_FILE:
				if (ichange.extendedDetails && ichange.extendedDetails.oldPath && ichange.extendedDetails.newPath) {
					const oldFName = ichange.extendedDetails.oldPath.split('/').pop();
					const newFName = ichange.extendedDetails.newPath.split('/').pop();
					if (oldFName !== newFName) {
						return `${Constants.CHANGE_DESCRIPTIONS[change]}:\`${oldFName}\` to \`${newFName}\``;
					}
				}
				break;
			case Changes.PARAM_CHANGE:
			case Changes.PARAM_META_CHANGE:
				if (ichange.extendedDetails && ichange.extendedDetails.oldValue && ichange.extendedDetails.newValue) {
					const oldParams = this.cleanParameters(ichange.extendedDetails.oldValue);
					const newParams = this.cleanParameters(ichange.extendedDetails.newValue);
					return `${Constants.CHANGE_DESCRIPTIONS[change]}:\`${oldParams}\` to \`${newParams}\``;
				} else {
					break;
				}
			case Changes.RENAME:
			case Changes.RETURN_CHANGE:
				if (ichange.extendedDetails && ichange.extendedDetails.oldValue && ichange.extendedDetails.newValue) {
					return `${Constants.CHANGE_DESCRIPTIONS[change]}:\`${ichange.extendedDetails.oldValue}\` to \`${ichange.extendedDetails.newValue}\``;
				} else {
					break;
				}
			default:
				break;
		}
		return Constants.CHANGE_DESCRIPTIONS[change];
	}

	private cleanParameters(input: string): string {
		input = input.replace(/^\[/, "").replace(/]$/, "");
		input = input.split(', ').map((str) => {
			try {
				const split: string[] = str.split('-', 2);
				return split[0];
			} catch (e) {
				return str;
			}
		}).join(', ');
		return `(${input})`
	}

	private getDate(): string {
		const date: Date = new Date(this.props.commit.commitDate);
		if (date.toDateString() === 'Invalid Date') {
			return "?";
		} else {
			const month: number = date.getMonth() + 1;
			const day: number = date.getDate();
			return `${date.getFullYear()}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
		}
	}

	private getFileName(): [string | undefined, string | undefined] {
		try {
			if (this.props.commit.file) {
				let [file, extension] = (this.props.commit.file.split('/').pop() as string).split('.');
				this.longFile = file;
				if (file.length > 15) {
					file = `${file.substring(0, 10)}...`;
				}
				return [file, extension];
			}
		} catch (err) {
			// suppress
		}
		return [undefined, undefined];
	}

	private getTime(): string {
		const date: Date = new Date(this.props.commit.commitDate);
		if (date.toDateString() === 'Invalid Date') {
			return "";
		} else {
			const hours = date.getHours();
			const minutes = date.getMinutes();
			return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`;
		}
	}

	private getHeight(baseOnly: boolean = false, modifier: number = 1): string {
		let height: number = Math.log(this.props.windowHeight) * Constants.COMMIT_ROW_HEIGHT;
		if (baseOnly) {
			return (height * modifier) + "px";
		}
		const diff: Element | null = document.getElementById(this.diffId);
		let newHeight = height;
		newHeight = newHeight + (diff && diff.clientHeight > 1 ? (0.5 * height) + diff.clientHeight : 0);
		newHeight = this.state.details ? newHeight + (this.changes.length * height) : newHeight;
		return (newHeight * modifier) + "px";
	}

	private enableDiff(): void {
		if (this.state.diff) {
			const state: IReactCommitState = Object.assign({}, this.state);
			state.diffVisible = true;
			this.setState(state);
		}
	}

	private toggleDiff(): void {
		const state: IReactCommitState = Object.assign({}, this.state);
		state.diff = !state.diff;
		if (state.diff) {
			// TODO not this
			if (this.props.commit.diff) {
				/* eslint-disable */
				// @ts-ignore
				const diffDrawer = new Diff2HtmlUI({
					diff: `--- a/f.${this.extension}\n+++ b/f.${this.extension}\n` + this.props.commit.diff
				});
				diffDrawer.draw(`#${this.diffId}`, {inputFormat: 'diff', showFiles: false, matching: 'lines', outputFormat: 'line-by-line'});
				diffDrawer.highlightCode(`#${this.diffId}`);
				if (this.diffDeleter) {
					clearTimeout(this.diffDeleter);
				}
				setTimeout(this.enableDiff, this.fadeOutTime);
			}
		} else {
			state.diffVisible = false;
			state.details = false;
			this.diffDeleter = setTimeout(() => {
				const diff = document.getElementById(this.diffId);
				if (diff) {
					diff.innerHTML = "<div/>";
				}
				this.diffDeleter = undefined;
				this.forceUpdate();
			}, this.fadeOutTime);
		}
		this.setState(state);
	}

	private toggleDetails(): void {
		this.setState({details: !this.state.details});
	}

	protected createReactNode(): ReactNode {
		const author = this.props.commit.commitAuthor;
		const mobileView: boolean = this.props.windowWidth < Constants.MOBILE_WIDTH;
		let width: number;
		if (mobileView) {
			width = this.props.windowWidth * 0.01 * Constants.COMMIT_ROW_MOBILE_WIDTH;
		} else {
			width = (this.props.windowWidth * 0.01 * (Constants.COMMIT_ROW_WIDTH + (this.state.diff || this.state.details ? Constants.COMMIT_WIDTH_MODIFIER : 0)));
		}
		return(
			<div
				style={{display: "block", alignItems: "center"}}
			>
				<div
					className={this.getClassName()}
					style={{
						margin: "0 auto",
						marginTop: "3px",
						marginBottom: "3px",
						textAlign: "left",
						height: this.getHeight(),
						font: Constants.FONT,
						width: width + "px",
						overflow: "hidden",
						zIndex: 9999,
						transition: this.fadeOutTime + "ms ease-in-out",
					}}
				>
					<div
						style={{
							margin: "0 auto",
							display: "grid",
							gridTemplateColumns: mobileView ? "1fr 1fr 0fr 0fr 1fr 1fr" : "1fr 1fr 1fr 1fr 1fr 1fr",
							height: this.getHeight(true)
						}}
					>
						<div className="CommitRowCell" style={{fontSize: this.getFontSize(this.date), backgroundColor: `rgba(255, 255, 255, 0.${this.datec})`}}>
							{this.date/*<br/>{this.time}*/}
						</div>
						<a href={this.authorLink} className="CommitRowCell SubtleButton Underline" onClick={this.goToAuthor} style={{color: "white", fontSize: this.getFontSize(author), backgroundColor: `rgba(255, 255, 255, 0.${this.authc})`}}>
							{author}
						</a>
						{mobileView ? <div/> :
							this.commitLink ?
								<a href={this.commitLink} className="CommitRowCell SubtleButton Underline" onClick={this.goToCommit} style={{color: "white", fontSize: this.getFontSize("View1234567"), backgroundColor: `rgba(255, 255, 255, 0.${this.comtc})`}}>
									{this.sha}
								</a> :
								<div className="CommitRowCell" style={{
									fontSize: this.getFontSize("Commit"),
									color: `rgba(255, 255, 255, 0.2)`,
									backgroundColor: `rgba(255, 255, 255, 0.${this.comtc})`
								}}>
									Commit
								</div>
						}
						{mobileView ? <div/> :
							this.fileLink ?
								<a href={this.fileLink} className="CommitRowCell SubtleButton Underline" onClick={this.goToFileInCommit} style={{color: "white", fontSize: this.getFontSize(this.file as string), backgroundColor: `rgba(255, 255, 255, 0.${this.filec})`}}>
									{this.file}
								</a> :
								<div className="CommitRowCell" style={{
									fontSize: this.getFontSize("File"),
									color: `rgba(255, 255, 255, 0.2)`,
									backgroundColor: `rgba(255, 255, 255, 0.${this.filec})`
								}}>
									File
								</div>
						}
						<div className="CommitRowCell SubtleButton" onClick={this.toggleDetails} style={{fontSize: this.getFontSize(this.type), backgroundColor: `rgba(255, 255, 255, 0.${this.typec})`}}>
							{this.type}
						</div>
						{this.props.commit.diff ?
							<div className="CommitRowCell SubtleButton" onClick={this.toggleDiff} style={{
								fontSize: this.getFontSize("Diff"),
								backgroundColor: `rgba(255, 255, 255, 0.${this.detlc})`
							}}>
								{this.diffText}
							</div> :
							<div className="CommitRowCell" style={{
								fontSize: this.getFontSize("Diff"),
								color: `rgba(255, 255, 255, 0.2)`,
								backgroundColor: `rgba(255, 255, 255, 0.${this.detlc})`
							}}>
								{this.diffText}
							</div>
						}
					</div>
					{
						this.changes.map((change, i) => {
							const desc: string = this.getDescription(change);
							return (<div
								// className={this.getClassName(change.type)} // Different colour subrows
								className={this.getClassName(this.props.commit.type)}
								style={{
									margin: "0 auto",
									height: this.state.details ? this.getHeight(true) : 0,
									backgroundImage: this.getBackgroundImage(change.type),
									opacity: this.state.details ? 0.8 : 0,
									backgroundSize: this.getHeight(true, 4),
									backgroundRepeat: "no-repeat",
									backgroundPosition: "left",
									transition: this.fadeOutTime + "ms ease-in-out",
									position: "relative",
									marginBottom: i === this.changes.length - 1 && this.props.commit.diff ? this.getHeight(true, 0.25) : "0",
								}}
								key={`${this.props.commit.commitName}-${this.props.method.longName}-${this.props.method.startLine}-${i}`}
							>
									{// this.state.details ?
										<div
											className="NoClick"
											style={{
												fontSize: this.getFontSize(desc, desc.length /  (Math.sqrt(desc.length) + 2), 1.2),
												textAlign: "right",
												position: "absolute",
												bottom: "0",
												right: "0",
												transition: this.fadeOutTime + "ms ease-in-out",
												opacity: this.state.details ? 1 : 0
											}}
										>
											{desc}
										</div>// : <div style={{opacity: 0}}/>
									}
							</div>);
						})
					}
					<div
						id={this.diffId}
						style={{
							width: "90%",
							margin: "0 auto",
							opacity: this.state.diffVisible ? 1 : 0,
							transition: this.fadeOutTime + "ms ease-in-out"
						}}
					/>
				</div>
			</div>
		);
	}
}

export interface IReactCommitProps extends ICommitRowProps {
	commit: ICommitx;
	repo: string;
	method: IMethodTransport;
}

export interface IReactCommitState extends IFadeableElementState {
	diff: boolean;
	details: boolean;
	diffVisible: boolean;
}
