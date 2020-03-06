import {IFadeableElementProps, IFadeableElementState} from "../../FadeableElement";
import {File, ReactFile} from "./File";
import * as React from "react";
import {ReactNode} from "react";
import {Constants} from "../../Constants";
import {ReactFileSystemNode} from "./FileSystemNode";

export class Directory {
	private name: string;
	private subDirs: Directory[];
	private files: File[];
	private readonly alerter: (name: string) => void;
	private highlight: number | null;
	private expanded: boolean;
	private minimized: boolean;
	private forceUpdate: () => void;
	private parent: Directory | null;

	constructor(name: string, contents: string[], alerter: (name: string) => void, parentUpdate: () => void, root: boolean, parent: Directory | null = null) {
		this.name = name;
		this.alerter = alerter;
		this.subDirs = [];
		this.files = [];
		this.highlight = null;
		this.expanded = root;
		this.minimized = false;
		this.forceUpdate = parentUpdate;
		this.parent = parent;
		this.tellParent = this.tellParent.bind(this);
		this.setExpanded = this.setExpanded.bind(this);
		this.toggleExpanded = this.toggleExpanded.bind(this);
		this.isExpanded = this.isExpanded.bind(this);
		this.buildChildren(contents);
	}

	private buildChildren(contents: string[]): void {
		const subDirs: {[name: string]: string[]} = {};
		for (const entry of contents) {
			const path = entry.split(/\/(.+)/);
			if (path.length === 1) {
				this.files.push(new File(entry, this.tellParent));
			} else {
				if (!Array.isArray(subDirs[path[0]])) {
					subDirs[path[0]] = [];
				}
				subDirs[path[0]].push(path[1]);
			}
		}
		const keys = Object.keys(subDirs);
		if (keys.length === 1 && this.files.length === 0) {
			this.name = `${this.name}/${keys[0]}`;
			this.buildChildren(subDirs[keys[0]]);
		} else {
			this.subDirs = keys.map((key: string) => new Directory(key, subDirs[key], this.tellParent, this.forceUpdate, false, this));
		}
	}

	public search(searchString: string, parentPath: string): boolean {
		let newPath: string;
		if (parentPath === "") {
			newPath = this.getName();
		} else {
			newPath = `${parentPath}/${this.getName()}`
		}
		const subDirsContainMatch = this.subDirs
			.map((subDir: Directory) => subDir.search(searchString, newPath)).includes(true);
		const filesContainMatch = this.files
			.map((file: File) => file.search(searchString, newPath)).includes(true);
		this.expanded = subDirsContainMatch || filesContainMatch;
		this.minimized = !this.expanded;
		return this.expanded;
	}

	public reset(root: boolean = true): void {
		this.minimized = false;
		for (const subDir of this.subDirs) {
			subDir.reset(false);
		}
		for (const file of this.files) {
			file.reset();
		}
		this.expanded = root;
	}

	public setExpanded(expanded: boolean): void {
		this.expanded = expanded;
		if (!this.expanded) {
			this.subDirs.forEach((subDir) => {
				if (subDir.isExpanded()) {
					subDir.setExpanded(false);
				}
			});
		}
	}

	public toggleExpanded(): void {
		this.setExpanded(!this.expanded);
		this.forceUpdate();
	}

	public isExpanded(): boolean {
		return this.expanded;
	}

	public isMinimized(): boolean {
		return this.minimized;
	}

	private tellParent(path: string): void {
		this.alerter(this.name + "/" + path);
	}

	public getDirectories(): Directory[] {
		return this.subDirs;
	}

	public getFiles(): File[] {
		return this.files;
	}

	public getName(): string {
		return this.name;
	}

	public toReactNode(): ReactNode {
		return <ReactDirectory dir={this} level={0} active={true} expanded={this.isExpanded()}/>
	}
}

export class ReactDirectory extends ReactFileSystemNode<IReactDirectoryProps, IReactDirectoryState> {
	protected readonly fadeOutTime: number = 300;

	constructor(props: IReactDirectoryProps) {
		super(props);
		this.state = {onScreen: this.props.active, margin: 0};
		this.mouseDown = this.mouseDown.bind(this);
		this.toggleExpanded = this.toggleExpanded.bind(this);
		this.forceUpdate = this.forceUpdate.bind(this);
	}

	private toggleExpanded(): void {
		const state: IReactDirectoryState = Object.assign({}, this.state);
		state.margin = 0;
		this.props.dir.toggleExpanded();
		this.setState(state);
	}

	private mouseDown(): void {
		const state: IReactDirectoryState = Object.assign({}, this.state);
		state.margin = Constants.LIST_ELEMENT_NEW_LINE_PX_COUNT;
		this.setState(state);
	}

	protected createReactNode(): ReactNode {
		const name: string = this.props.dir.getName() + "/";
		// const style = {marginLeft: (this.props.level * Constants.LIST_ELEMENT_NEW_LINE_PX_COUNT) + this.state.margin + "px", marginBottom: 0, marginTop: 0, height: 0};
		return(
			<div
				style={{display: "block", marginTop: this.props.level === 0 ? "3px" : 0, marginBottom: this.props.level === 0 ? "1em" : 0}}
			>
				<div
					style={{
						marginLeft: (this.props.level * Constants.LIST_ELEMENT_NEW_LINE_PX_COUNT) + this.state.margin + "px",
						marginTop: this.props.active ? (!this.props.dir.isMinimized() ? "0" : "0") : 0,
						marginBottom: this.props.active ? (!this.props.dir.isMinimized() ? "3px" : "1px") : 0,
						backgroundColor:/* this.props.highlight ? "rgb(124, 0, 6)" : */"rgb(75, 75, 124)",
						height: this.props.active ? (this.props.dir.isMinimized() ? "8px" : "40px") : "0",
						font: "100% \"Courier New\", Futura, sans-serif",
						width: "650px",
						overflow: "hidden",
						zIndex: 9999,
						transition: this.fadeOutTime + "ms ease-in-out",
						fontSize: ReactFileSystemNode.getFontSize(name, this.props.dir.isMinimized() ? 1/12 : 1),
						opacity: this.props.active ? (this.props.dir.isMinimized() ? 0.5 : 1) : 0,
					}}
					onClick={this.toggleExpanded}
					onMouseDown={this.mouseDown}
				>
					{name}
				</div>
				{(this.state.onScreen || this.props.active ? this.props.dir.getDirectories() : [])
					.map((dir: Directory, i: number) => <ReactDirectory dir={dir} level={this.props.level + 1} key={`${dir.getName()}-${i}`} active={this.props.expanded && this.props.active} expanded={dir.isExpanded()}/>)}
				{(this.state.onScreen || this.props.active ? this.props.dir.getFiles() : [])
					.map((file: File, i: number) => <ReactFile file={file} level={this.props.level + 1} key={`${file.getName()}-${i}`} active={this.props.expanded && this.props.active} highlight={file.shouldHighlightThis()}/>)}

			</div>
		);
	}
}

export interface IReactDirectoryProps extends IFadeableElementProps{
	dir: Directory;
	level: number;
	expanded: boolean;
}

export interface IReactDirectoryState extends IFadeableElementState {
	margin: number;
}