import React, {ReactNode} from 'react';
import './App.css';
import {ArgKind, Key, Pages} from './Enums'
import {Landing} from "./Pages/Landing/Landing";
import {Files} from "./Pages/Files/Files";
import {Methods} from "./Pages/Methods/Methods";
import {IHistoryTransport, IManifest, IManifestEntry, IMethodTransport, InternalError, ServerBusyError} from "./Types";
import {BackgroundText} from "./BackgroundText";
import {Constants} from "./Constants";
import {RequestController} from "./RequestController";
import ErrorPane from "./Panes/ErrorPane";
import LoadingPane from "./Panes/LoadingPane";
import {Results} from "./Pages/Results/Results";
import {TestController} from "./TestRequestController";
import LargeButton from "./Buttons/LargeButton";
import SmallButton from "./Buttons/SmallButton";
import Cookies from 'js-cookie';
import {About} from "./Pages/About";

export default class App extends React.Component<any, IAppState> {
	private history: Pages[];
	private rc: RequestController = Constants.IN_TEST ? new TestController() : new RequestController();
	private static readonly loadFilesErrorText = Constants.FILE_REQUEST_ERROR_TEXT;
	private static readonly loadMethodsErrorText = Constants.METHODS_REQUEST_ERROR_TEXT;
	private static readonly loadHistoryErrorText = Constants.RESULTS_REQUEST_ERROR_TEXT;
	private static readonly serverBusyErrorText = Constants.SERVER_BUSY_ERROR_TEXT;
	private static readonly internalErrorText = Constants.INTERNAL_ERROR_TEXT;
	private static readonly cacheErrorText = Constants.CACHE_ERROR_TEXT;
	private oldFileContentStorage: string[] | null = null;
	private oldShaStorage: string = "HEAD";

	public constructor(props: any) {
		super(props);
		this.state = {
			page: Pages.LANDING,
			link: "",
			file: "",
			sha: "HEAD",
			method: Constants.DEFAULT_METHOD,
			loading: false,
			loadFilesError: false,
			loadMethodsError: false,
			loadHistoryError: false,
			serverBusyError: false,
			internalError: false,
			cachedError: false,
			fileContent: null,
			methodContent: null,
			historyContent: null,
			displayTextCopied: false,
			showAbout: false,
			width: window.innerWidth,
			height: window.innerHeight,
			examplesHidden: Cookies.get("examplesHidden") === 'true',
			examples: [],
			shaRefresh: false,
			exampleClick: false,
		};
		this.history = [];
		this.proceedToPage = this.proceedToPage.bind(this);
		this.goBack = this.goBack.bind(this);
		this.handleKey = this.handleKey.bind(this);
		this.updateSelected = this.updateSelected.bind(this);
		this.getNewStateWithArg = this.getNewStateWithArg.bind(this);
		this.proceedWithUpdate = this.proceedWithUpdate.bind(this);
		this.finishLoad = this.finishLoad.bind(this);
		this.closeErrors = this.closeErrors.bind(this);
		this.copyText = this.copyText.bind(this);
		this.getNewTestState = this.getNewTestState.bind(this);
		this.showAbout = this.showAbout.bind(this);
		this.updateSize = this.updateSize.bind(this);
		this.toggleExamples = this.toggleExamples.bind(this);
		this.handleExample = this.handleExample.bind(this);
		this.getExamples = this.getExamples.bind(this);
		this.isError = this.isError.bind(this);
	}

	public componentDidMount(): void {
		document.addEventListener('keydown', this.handleKey);
		window.addEventListener("resize", this.updateSize);
		window.onpopstate = this.goBack;
		setTimeout(this.showAbout, Constants.SHOW_ABOUT_DELAY_TIME);
		setImmediate(this.getExamples);
	}

	public componentWillUnmount(): void {
		document.removeEventListener('keydown', this.handleKey);
	}

	private showAbout(): void {
		const state: IAppState = Object.assign({}, this.state);
		state.showAbout = true;
		this.setState(state);
	}

	private updateSize(): void {
		this.setState({
			width: window.innerWidth,
			height: window.innerHeight,
		});
	}

	private toggleExamples(): void {
		if (this.state.loading) {
			return;
		}
		const examplesHidden: boolean = !this.state.examplesHidden;
		this.setState({examplesHidden});
		setImmediate(() => Cookies.set('examplesHidden', examplesHidden.toString()));
	}

	private handleKey(event: KeyboardEvent): void {
		if (document.activeElement && document.activeElement.className.includes("form")) {
			return;
		}
		if (event.code === Key.BACKSPACE) {
			console.log(document.activeElement ? document.activeElement.className : "NULL");
			setImmediate(() => window.history.back())
		}
		if (Constants.IN_TEST) {
			switch(event.code) {
				case Key._1:
					this.proceedToPage(Pages.LANDING);
					break;
				case Key._2:
					this.proceedToPage(Pages.FILES);
					break;
				case Key._3:
					this.proceedToPage(Pages.METHODS);
					break;
				case Key._4:
					this.proceedToPage(Pages.RESULTS);
					break;
				case Key._5:
					this.proceedToPage(Pages.ABOUT);
					break;
				default:
					// Do nothing
			}
		}
	}

	private async handleExample(example: IManifestEntry): Promise<void> {
		const state: IAppState = {
			...this.state,
			link: example.repo,
			method: example.method,
			sha: example.sha,
			file: example.filePath,
		};
		this.proceedToPage(Pages.RESULTS, state);
	}

	private getExamples(): void {
		RequestController.getManifest()
			.then((manifest: IManifest) => {
				const examples: IManifestEntry[] = Array.from(Object.values(manifest));
				for (let i = examples.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					const temp = examples[i];
					examples[i] = examples[j];
					examples[j] = temp;
				}
				this.setState({examples});
			})
			.catch((err) => {
				// Do nothing
			});
	}

	private proceedToPage(page: Pages, state: IAppState | null = null): void {
		if(this.state.loading || this.isError()) {
			return;
		}
		if (!state) {
			state = Object.assign({}, this.state);
		}
		switch (page) {
			case Pages.FILES:
				if (state.sha !== "HEAD") {
					state.shaRefresh = true;
				}
				state.loading = true;
				this.oldFileContentStorage = state.fileContent;
				state.fileContent = null;
				state.file = "";
				this.rc.listFiles(state.link, state.sha)
					.then((content: string[]) => {
						const state: IAppState = Object.assign({}, this.state);
						state.fileContent = content;
						this.finishLoad(page, null, state);
					})
					.catch((err) => {
						this.finishLoad(this.state.page, err)
					});
				break;
			case Pages.METHODS:
				state.method = Constants.DEFAULT_METHOD;
				state.loading = true;
				state.methodContent = null;
				this.rc.listMethods(state.link, state.sha, state.file)
					.then((content: IMethodTransport[]) => {
						const state: IAppState = Object.assign({}, this.state);
						state.methodContent = content;
						this.finishLoad(page, null, state);
					})
					.catch((err) => {
						this.finishLoad(this.state.page, err)
					});
				break;
			case Pages.RESULTS:
				if (state.sha !== "HEAD") {
					state.exampleClick = true;
				}
				state.loading = true;
				state.historyContent = null;
				this.rc.getHistory(state.link, state.sha, state.file, state.method.startLine,
					state.method.methodName, state.exampleClick)
					.then((content: IHistoryTransport) => {
						const state: IAppState = Object.assign({}, this.state);
						state.historyContent = content;
						this.finishLoad(page, null, state);
					})
					.catch((err) => {
						this.finishLoad(this.state.page, err)
					});
				break;
			default:
				this.finishLoad(page, null, state);
				return;
		}
		this.setState(state);
	}

	private finishLoad(page: Pages, error: Error | null, state: IAppState | null = null) {
		if (!state) {
			state = Object.assign({}, this.state);
		}
		if (state.page !== page) {
			window.history.pushState('', '', page.toString());
			this.history.push(state.page);
			state.page = page;
		}
		if (error){
			if (error instanceof ServerBusyError) {
				state.serverBusyError = true;
			} else if (error instanceof InternalError) {
				state.internalError = true;
				if (state.shaRefresh) {
					state.fileContent = this.oldFileContentStorage;
					state.sha = this.oldShaStorage;
				}
			} else {
				switch (page) {
					case Pages.LANDING:
						if (state.exampleClick) {
							state.loadHistoryError = true;
						} else {
							state.loadFilesError = true;
						}
						break;
					case Pages.FILES:
						state.loadMethodsError = true;
						break;
					case Pages.METHODS:
						state.loadHistoryError = true;
						break;
				}
			}
		}
		state.loading = false;
		state.shaRefresh = false;
		state.exampleClick = false;
		this.setState(state);
	}

	private updateSelected(arg: any, kind: ArgKind): void {
		this.getNewStateWithArg(arg, kind).then((state) => this.setState(state));
		// this.setState();
	}

	private async getNewStateWithArg(arg: any, kind: ArgKind): Promise<IAppState> {
		if (Constants.IN_TEST) {
			return await this.getNewTestState(kind);
		}
		const state: IAppState = Object.assign({}, this.state);
		switch (kind) {
			case ArgKind.FILE:
				state.file = arg;
				break;
			case ArgKind.SHA:
				this.oldShaStorage = state.sha;
				state.sha = arg;
				break;
			case ArgKind.METHOD:
				state.method = arg;
				break;
			case ArgKind.REPO:
				state.link = arg;
				this.oldShaStorage = "HEAD";
				state.sha = "HEAD";
				break;
			default:
				console.error("Update Selected Illegal case");
				return this.state;
		}
		return state;
	}

	private async getNewTestState(kind: ArgKind): Promise<IAppState> {
		const state: IAppState = Object.assign({}, this.state);
		switch (kind) {
			case ArgKind.FILE:
				state.file = await TestController.getFile();
				break;
			case ArgKind.SHA:
				state.sha = "HEAD";
				break;
			case ArgKind.METHOD:
				state.method = await TestController.getMethod();
				break;
			case ArgKind.REPO:
				state.link = await TestController.getRepo();
				state.sha = "HEAD";
				break;
			default:
				console.error("Update Selected Illegal case");
				return this.state;
		}
		return state;
	}

	private goBack(): void {
		const state: IAppState = Object.assign({}, this.state);
		const lastPage: Pages | undefined = this.history.pop();
		if (lastPage !== undefined && lastPage !== state.page) {
			state.page = lastPage;
			this.setState(state);
		}
	}

	private async proceedWithUpdate(page: Pages, arg: any, kind: ArgKind): Promise<void> {
		this.proceedToPage(page, await this.getNewStateWithArg(arg, kind));

	}

	private isError(): boolean {
		return this.state.loadFilesError ||
			this.state.loadMethodsError ||
			this.state.loadHistoryError ||
			this.state.serverBusyError ||
			this.state.internalError ||
			this.state.cachedError;
	}

	private closeErrors(): void {
		const state: IAppState = Object.assign({}, this.state);
		if (this.isError()) {
			state.loadFilesError = false;
			state.loadMethodsError = false;
			state.loadHistoryError = false;
			state.serverBusyError = false;
			state.internalError = false;
			state.cachedError = false;
			this.setState(state);
		}
	}

	private copyText(): void {
		const element = document.createElement('textarea');
		if (this.state.loading) {
			element.value = "Loading... One moment.";
		} else {
			switch (this.state.page) {
				case Pages.FILES:
					element.value = JSON.stringify(this.state.fileContent);
					break;
				case Pages.METHODS:
					element.value = JSON.stringify(this.state.methodContent);
					break;
				case Pages.RESULTS:
					element.value = JSON.stringify(this.state.historyContent);
					break;
				default:
					element.value = "No Easter Egg here. Go away!";
			}
		}
		element.setAttribute('readonly', '');
		document.body.appendChild(element);
		element.select();
		if (document.execCommand('copy')) {
			const state: IAppState = Object.assign({}, this.state);
			state.displayTextCopied = true;
			const that: App = this;
			setTimeout(function () {
				const state: IAppState = Object.assign({}, that.state);
				state.displayTextCopied = false;
				that.setState(state)
			}, Constants.NOTIFICATION_DISPLAY_TIME);
			this.setState(state);
		}
		document.body.removeChild(element);
	}

	public render(): ReactNode {
		return(
			<header className="App-header">
				<div
					style={{
						textAlign: "center",
						height: "100%",
						width: "100%",
						top: "0",
						left: "0",
						position: "fixed",
					}}
				>
					<BackgroundText
						file={this.state.file}
						page={this.state.page}
						method={this.state.method}
						sha={this.state.sha}
						repo={this.state.link}
						windowArea={this.state.width * this.state.height}
					/>
					<Landing
						proceedToPage={this.proceedToPage}
						active={this.state.page === Pages.LANDING}
						proceedWithUpdate={this.proceedWithUpdate}
						page={this.state.page}
						examplesHidden={this.state.examplesHidden}
						examples={this.state.examples}
						tellParent={this.handleExample}
						toggleHidden={this.toggleExamples}
						windowWidth={this.state.width}
					/>
					<Files
						proceedToPage={this.proceedToPage}
						active={this.state.page === Pages.FILES}
						file={this.state.file}
						page={this.state.page}
						proceedWithUpdate={this.proceedWithUpdate}
						content={this.state.fileContent ? this.state.fileContent : []}
						windowWidth={this.state.width}
					/>
					<Methods
						proceedToPage={this.proceedToPage}
						active={this.state.page === Pages.METHODS}
						method={this.state.method}
						proceedWithUpdate={this.proceedWithUpdate}
						page={this.state.page}
						content={this.state.methodContent ? this.state.methodContent : []}
						windowWidth={this.state.width}
					/>
					<Results
						proceedToPage={this.proceedToPage}
						active={this.state.page === Pages.RESULTS}
						page={this.state.page}
						content={this.state.historyContent ? this.state.historyContent : {}}
						repo={this.state.link}
						file={this.state.file}
						windowHeight={this.state.height}
						windowWidth={this.state.width}
						method={this.state.method}
					/>
					<About
						proceedToPage={this.proceedToPage}
						active={this.state.page === Pages.ABOUT}
						page={this.state.page}
						windowHeight={this.state.height}
						windowWidth={this.state.width}
					/>
					<SmallButton
						active={this.state.page === Pages.ABOUT}
						onClick={() => {if (this.history.length > 0) window.history.back()}}
						width={30}
						height={30}
						backgroundImage={`url(${process.env.PUBLIC_URL}/left.png)`}
						backgroundSize={15}
						shift={this.state.page === Pages.ABOUT ? 35 : 0}
						left={-30}
						bottom={5}
					/>
					<SmallButton
						active={this.state.page !== Pages.ABOUT && (this.state.showAbout || this.history.length > 0)}
						onClick={() => this.proceedToPage(Pages.ABOUT)}
						width={30}
						height={30}
						backgroundImage={`url(${process.env.PUBLIC_URL}/question.png)`}
						backgroundSize={15}
						shift={this.state.page === Pages.ABOUT ? 35 : 0}
						left={5}
						bottom={5}
					/>
					<LargeButton
						active={this.state.page > Pages.LANDING && this.state.page < Pages.ABOUT}
						handleClick={() => setImmediate(this.copyText)}
						shift={this.state.page === Pages.ABOUT ? 35 : 0}
						displayNotification={this.state.displayTextCopied}
						text={"Copy JSON"}
						backgroundImage={`url(${process.env.PUBLIC_URL}/clipboard.png)`}
						left={40}
						bottom={5}
						width={180}
					/>
					<LoadingPane windowWidth={this.state.width} text={this.state.exampleClick ? `Digging through ${this.state.method.methodName}'s history` : `Cloning ${this.state.link}`} active={this.state.loading && this.state.page === Pages.LANDING} size={{height: 30, width: 72}}/>
					<LoadingPane windowWidth={this.state.width} text={this.state.shaRefresh ? `Checking out ${this.state.sha}` : `Getting all methods in ${this.state.file.split('/').pop()}`} active={this.state.loading && this.state.page === Pages.FILES} size={{height: 30, width: 72}}/>
					<LoadingPane windowWidth={this.state.width} text={`Digging through ${this.state.method.methodName}'s history`} active={this.state.loading && this.state.page === Pages.METHODS} size={{height: 30, width: 72}}/>
					<ErrorPane text={App.serverBusyErrorText} active={this.state.serverBusyError} size={{height: 30, width: 72}} exit={this.closeErrors}/>
					<ErrorPane text={App.cacheErrorText} active={this.state.cachedError} size={{height: 30, width: 72}} exit={this.closeErrors}/>
					<ErrorPane text={App.internalErrorText} active={this.state.internalError} size={{height: 30, width: 72}} exit={this.closeErrors}/>
					<ErrorPane text={App.loadFilesErrorText} active={this.state.loadFilesError} size={{height: 30, width: 72}} exit={this.closeErrors}/>
					<ErrorPane text={App.loadMethodsErrorText} active={this.state.loadMethodsError} size={{height: 30, width: 72}} exit={this.closeErrors}/>
					<ErrorPane text={App.loadHistoryErrorText} active={this.state.loadHistoryError} size={{height: 30, width: 72}} exit={this.closeErrors}/>
				</div>
			</header>
		);
	}
}

export interface IAppState {
	page: Pages;
	link: string;
	file: string;
	sha: string;
	method: IMethodTransport;
	loading: boolean;
	loadFilesError: boolean;
	loadMethodsError: boolean;
	loadHistoryError: boolean;
	serverBusyError: boolean;
	internalError: boolean;
	fileContent: string[] | null;
	methodContent: IMethodTransport[] | null;
	historyContent: IHistoryTransport | null;
	displayTextCopied: boolean;
	showAbout: boolean;
	width: number;
	height: number;
	examplesHidden: boolean;
	examples: IManifestEntry[];
	cachedError: boolean;
	shaRefresh: boolean;
	exampleClick: boolean;
}
