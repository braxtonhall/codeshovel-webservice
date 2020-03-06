import * as React from "react";
import {FormEvent, ReactNode} from "react";
import {IPageProps, IPageState, Page} from "../Page";
import {ArgKind, Pages} from "../../Enums";
import ErrorPane from "../../Panes/ErrorPane";
import Button from "react-bootstrap/Button";
import {Constants} from "../../Constants";
import Form from "react-bootstrap/Form";
import {Directory} from "./Directory";
import Cookies from "js-cookie";
import TutorialPane from "../../Panes/TutorialPane";

export class Files extends Page<IFilesProps, IFilesState> {
	private readonly fileInputPlaceholder: string = Constants.FILES_SEARCH_TEXT;
	private readonly shaPlaceholder: string = Constants.FILE_SHA_PLACEHOLDER_TEXT;
	private readonly shaErrorText: string = Constants.FILE_SHA_ERROR_TEXT;
	protected readonly page: Pages = Pages.FILES;
	protected readonly cookieName: string = "files";
	private readonly tutorialText = Constants.FILES_TUTORIAL_TEXT;

	private link: string;
	private sha: string;
	private root: Directory;
	private content: string[];

	public constructor(props: IFilesProps) {
		super(props);
		this.state = {
			onScreen: this.props.active,
			loading: false,
			shaError: false,
			search: "",
			tutorialDismissed: Cookies.get(this.cookieName) === 'true',
		};
		this.link = "";
		this.sha = "HEAD";
		this.root = new Directory(".", [], this.proceedToNextPageAndUpdateSelected, this.forceUpdate, true);
		this.content = [];
		this.closeShaError = this.closeShaError.bind(this);
		this.buildDirectory = this.buildDirectory.bind(this);
		this.proceedToNextPageAndUpdateSelected = this.proceedToNextPageAndUpdateSelected.bind(this);
		this.handleRefresh = this.handleRefresh.bind(this);
		this.handleShaEnter = this.handleShaEnter.bind(this);
		this.handleKey = this.handleKey.bind(this);
		this.forceUpdate = this.forceUpdate.bind(this);
		this.handleSearchEnter = this.handleSearchEnter.bind(this);
	}

	public componentDidMount(): void {
		document.addEventListener('keydown', this.handleKey);
	}

	public componentWillUnmount(): void {
		document.removeEventListener('keydown', this.handleKey);
	}

	private handleKey(): void {
		const searchElement: HTMLInputElement = (document.getElementById("fileSearchInput") as HTMLInputElement);
		if (searchElement && typeof searchElement.value === "string" && searchElement.value !== this.state.search) {
			const state: IFilesState = Object.assign({}, this.state);
			state.search = searchElement.value;
			this.setState(state);
		}
	}

	private handleSearchEnter(event: FormEvent): void {
		event.preventDefault();
		if (this.state.search !== "") {
			this.root.search(this.state.search, "");
		} else {
			this.root.reset();
		}
		this.forceUpdate();
	}

	// private handleKey(event: KeyboardEvent): void {
	// 	function isArrowKey(code: string): boolean {
	// 		return code === Key.UP || code === Key.DOWN || code === Key.LEFT || code === Key.RIGHT;
	// 	}
	//
	// 	if (this.props.active && isArrowKey(event.code)) {
	// 		event.preventDefault();
	// 		this.root.moveHighlight(event.code as Key);
	// 		this.forceUpdate();
	// 	}
	// }

	protected handleNext(): void {
		if (this.props.file !== "") {
			this.props.proceedToPage(Pages.METHODS);
		}
	}

	private handleRefresh(): void {
		const shaElement: HTMLInputElement = (document.getElementById("shaInput") as HTMLInputElement);
		if (shaElement && shaElement.value) {
			this.props.proceedWithUpdate(Pages.FILES, shaElement.value, ArgKind.SHA);
		} else {
			const state: IFilesState = Object.assign({}, this.state);
			state.shaError = true;
			this.setState(state);
		}
	}

	private proceedToNextPageAndUpdateSelected(path: string): void {
		this.props.proceedWithUpdate(Pages.METHODS, path.replace(/^\.\//, ""), ArgKind.FILE);
	}

	private handleShaEnter(event: FormEvent): void {
		event.preventDefault();
		this.handleRefresh();
	}

	private closeShaError(): void {
		const state: IFilesState = Object.assign({}, this.state);
		state.shaError = false;
		this.setState(state);
	}

	private buildDirectory(files: string[]): void {
		this.content = files;
		this.root = new Directory(".", files, this.proceedToNextPageAndUpdateSelected, this.forceUpdate, true);
	}

	public createReactNode(): ReactNode {
		const searchElement: HTMLInputElement = (document.getElementById("fileSearchInput") as HTMLInputElement);
		if (searchElement) {
			searchElement.value = this.state.search;
		}
		if (this.content !== this.props.content) {
			this.buildDirectory(this.props.content);
		}
		return (
			<div>
				<div>
					{this.state.onScreen || this.props.active ?
						<div
							style={{
								opacity: this.props.active ? 1 : 0,
								transition: this.fadeOutTime + "ms ease-in-out",
								position: "absolute",
								right: "-1%",
								top: "2%",
								font: "200% \"Courier New\", Futura, sans-serif",
								textAlign: "right",
								fontStyle: "italic",
							}}
						>
							Select a file.
						</div> : <div style={{right: "-1%", top: "2%", font: "200% \"Courier New\", Futura, sans-serif", opacity: 0}}/>
					}
				</div>
				<div>
					<div
						style={{
							position: "fixed",
							height: "100%",
							width: "100%",
							top: "50%",
							left: "50%",
							transform: this.chooseTransform(),
							opacity: this.props.active ? 1 : 0,
							transition: `${this.fadeOutTime}ms ease-in-out`,
						}}
					>
						<FileContainer dir={this.root}/>
						<TutorialPane
							active={!this.state.tutorialDismissed}
							text={this.tutorialText}
							windowWidth={this.props.windowWidth}
							width={25}
							dismissTutorial={this.dismissTutorial}
							top={30}
							right={10}
							heightRatio={0.8}
						/>
					</div>
				</div>
				<div>
					{this.state.onScreen || this.props.active ?

						<div
							style={{
								position: "absolute",
								bottom: "3%",
								right: "1%",
								width: "28%",
								height: "10%",
								opacity: this.props.active ? 1 : 0,
								transition: this.fadeOutTime + "ms ease-in-out",
							}}
						>
							<Form onSubmit={this.handleShaEnter}>
								<Form.Control id="shaInput" size="sm" type="text" placeholder={this.shaPlaceholder}/>
							</Form>
							<Button style={{marginTop: "1%", marginLeft: "auto", marginRight: "5%", position: "relative", float: "right",}} variant="primary" onClick={this.handleRefresh} disabled={false}>Refresh</Button>
						</div> : <div style={{opacity: 0}}/>
					}
				</div>
				<div>
					{this.state.onScreen || this.props.active ?
						<div>
							<ErrorPane text={this.shaErrorText} active={this.state.shaError && this.props.active} size={{height: 30, width: 72}} exit={this.closeShaError}/>
						</div> : <div/>
					}
				</div>
				<div>
					{this.state.onScreen || this.props.active ?
						<div style={{opacity: this.props.active ? 1 : 0, transition: this.fadeOutTime + "ms ease-in-out",}}>
							<div
								style={{
									width: "20%",
									position: "absolute",
									right: "2%",
									top: "10%",
								}}
							>
								<Form onSubmit={this.handleSearchEnter}>
									<Form.Control id="fileSearchInput" size="sm" type="text" placeholder={this.fileInputPlaceholder} onChange={this.handleKey}/>
								</Form>
								<Button
									style={{
										marginTop: "1%",
										marginLeft: "auto",
										marginRight: "5%",
										position: "relative",
										float: "right",
									}} variant="primary"
									onClick={this.handleSearchEnter}
									disabled={false}
								>
									Search
								</Button>
							</div>
						</div> : <div style={{opacity: 0}}/>
					}
				</div>
			</div>
		);
	}
}

class FileContainer extends React.Component<{dir: Directory}, any> {
	public render(): ReactNode {
		return(
			<div
				className="Panel"
				style={{
					display: "block",
					textAlign: "left",
					width: "100%",
					height: "100%",
					opacity: 0.8
				}}
			>
				{this.props.dir.toReactNode()}
			</div>
		);
	}
}

export interface IFilesProps extends IPageProps {
	content: string[];
	file: string;
	proceedWithUpdate: (page: Pages, arg: any, kind: ArgKind) => Promise<void>;
}

export interface IFilesState extends IPageState {
	loading: boolean;
	shaError: boolean;
	search: string;
}
