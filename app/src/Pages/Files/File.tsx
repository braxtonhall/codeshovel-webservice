import {IFadeableElementProps, IFadeableElementState} from "../../FadeableElement";
import {Constants} from "../../Constants";
import {ReactNode} from "react";
import * as React from "react";
import {ReactFileSystemNode} from "./FileSystemNode";

export class File {
	private readonly name: string;
	private readonly alerter: (name: string) => void;
	private highlight: boolean;
	private minimized: boolean;

	constructor(name: string, alerter: (name: string) => void) {
		this.name = name;
		this.alerter = alerter;
		this.highlight = false;
		this.minimized = false;
		this.tellParent = this.tellParent.bind(this);
	}

	public shouldHighlightThis(): boolean {
		return this.highlight;
	}

	public tellParent(): void {
		this.alerter(this.name);
	}

	public getName(): string {
		return this.name;
	}

	public removeHighlight(): void {
		this.highlight = false;
	}

	public addHighlight(): void {
		this.highlight = true;
	}

	public isMinimized(): boolean {
		return this.minimized;
	}

	public reset(): void {
		this.minimized = false;
	}

	public search(searchString: string, parentPath: string): boolean {
		const pathToSearch = `${parentPath}/${this.getName()}`;
		let matches: boolean;
		if (searchString.startsWith("/") && searchString.endsWith("/")) {
			matches = File.regexMatch(pathToSearch, searchString);
		} else {
			matches = File.stringMatch(pathToSearch, searchString);
		}
		this.minimized = !matches;
		return matches;
	}

	private static regexMatch(pathToSearch: string, searchString: string): boolean {
		searchString = searchString.substring(1, searchString.length - 1);
		const regex: RegExp = new RegExp(searchString);
		return regex.test(pathToSearch);
	}

	private static stringMatch(pathToSearch: string, searchString: string): boolean {
		const searchWords = searchString.split(/ /);
		return searchWords.every((searchWord: string) => {
			if (pathToSearch.includes(searchWord)) {
				pathToSearch = pathToSearch.substring(pathToSearch.indexOf(searchWord) + searchWord.length);
				return true;
			} else {
				return false;
			}
		});
	}
}

export class ReactFile extends ReactFileSystemNode<IReactFileProps, IReactFileState> {
	protected readonly fadeOutTime: number = 300;

	constructor(props: IReactFileProps) {
		super(props);
		this.state = {selected: false, onScreen: this.props.active, margin: 0};
		this.handleClick = this.handleClick.bind(this);
		this.mouseDown = this.mouseDown.bind(this);
	}

	private handleClick(): void {
		if (!this.props.file.isMinimized()) {
			setImmediate(this.props.file.tellParent);
			const state: IReactFileState = Object.assign({}, this.state);
			state.margin = 0;
			this.setState(state);
		}
	}

	private mouseDown(): void {
		if (!this.props.file.isMinimized()) {
			const state: IReactFileState = Object.assign({}, this.state);
			state.margin = Constants.LIST_ELEMENT_NEW_LINE_PX_COUNT;
			this.setState(state);
		}
	}

	protected createReactNode(): ReactNode {
		const name: string = this.props.file.getName();
		// const style = {marginLeft: (this.props.level * Constants.LIST_ELEMENT_NEW_LINE_PX_COUNT) + this.state.margin + "px", marginBottom: 0, marginTop: 0};
		return(
				<div
					style={{display: "block", marginTop: 0, marginBottom: 0}}
				>
					<div
						style={{
							marginLeft: (this.props.level * Constants.LIST_ELEMENT_NEW_LINE_PX_COUNT) + this.state.margin + "px",
							marginTop: this.props.active ? (!this.props.file.isMinimized() ? "0" : "0") : 0,
							marginBottom: this.props.active ? (!this.props.file.isMinimized() ? "3px" : "1px") : 0,
							backgroundColor: "rgb(124, 124, 124)",
							height: this.props.active ? (this.props.file.isMinimized() ? "8px" : "40px") : "0",
							font: "100% \"Courier New\", Futura, sans-serif",
							width: (650 - Constants.LIST_ELEMENT_NEW_LINE_PX_COUNT * 1.5) + "px",
							overflow: "hidden",
							zIndex: 9999,
							transition: this.fadeOutTime + "ms ease-in-out",
							fontSize: ReactFileSystemNode.getFontSize(name, this.props.file.isMinimized() ? 1/12 : 1),
							opacity: this.props.active ? (this.props.file.isMinimized() ? 0.5 : 1) : 0,
						}}
						onClick={this.handleClick}
						onMouseDown={this.mouseDown}
					>
						{name}
					</div>

				</div>
		);
	}
}

export interface IReactFileProps extends IFadeableElementProps {
	file: File;
	level: number;
	highlight: boolean;
	// shouldAnimate: boolean;
}

export interface IReactFileState extends IFadeableElementState {
	selected: boolean;
	margin: number;
}
