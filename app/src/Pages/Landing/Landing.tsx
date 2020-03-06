import * as React from "react";
import {FormEvent, ReactNode} from "react";
import Form from "react-bootstrap/Form";
import {Constants} from "../../Constants";
import Button from "react-bootstrap/Button";
import {ArgKind, Key, Pages} from "../../Enums";
import ErrorPane from "../../Panes/ErrorPane";
import {IPageProps, IPageState, Page} from "../Page";
import {IManifestEntry} from "../../Types";
import {Example} from "./Example";
import {FadeableElement, IFadeableElementProps, IFadeableElementState} from "../../FadeableElement";
import TutorialPane from "../../Panes/TutorialPane";
import Cookies from "js-cookie";

export class Landing extends Page<ILandingProps, ILandingState> {
	private readonly placeholder: string;
	private readonly errorText: string = Constants.INVALID_URL_ERROR_TEXT;
	private readonly tutorialText: string = Constants.LANDING_TUTORIAL_TEXT;
	protected readonly page: Pages = Pages.LANDING;
	protected readonly cookieName: string = "landing";

	public constructor(props: ILandingProps) {
		super(props);
		this.state = {
			error: false,
			onScreen: this.props.active,
			tutorialDismissed: Cookies.get(this.cookieName) === 'true',
			chevronHover: false,
		};
		this.placeholder = Constants.EXAMPLE_LINKS[Math.floor(Math.random() * Constants.EXAMPLE_LINKS.length)];
		this.toggleError = this.toggleError.bind(this);
		this.handleEnter = this.handleEnter.bind(this);
		this.handleKey = this.handleKey.bind(this);
	}

	public componentDidMount(): void {
		document.addEventListener('keydown', this.handleKey);
	}

	protected handleNext(): void {
		const repoElement: HTMLInputElement = (document.getElementById("repoInput") as HTMLInputElement);
		let repoLink: string = "";
		if (repoElement && repoElement.value) {
			repoLink = repoElement.value;
		}
		if (repoLink === "") {
			repoElement.value = repoElement.placeholder;
			return;
		}
		if (!repoLink.toLowerCase().includes("github.")) {
			this.toggleError();
			return;
		}
		if (!repoLink.endsWith(".git")) {
			repoLink = repoLink + ".git";
		}
		this.props.proceedWithUpdate(Pages.FILES, repoLink, ArgKind.REPO)
	}
	
	private handleKey(event: KeyboardEvent): void {
		const repoInputElement = document.getElementById("repoInput") as HTMLInputElement;
		if (this.props.active &&
			document.activeElement &&
			document.activeElement.id === "repoInput" &&
			event.code === Key.RIGHT &&
			repoInputElement &&
			repoInputElement.value === ""
		) {
			repoInputElement.value = repoInputElement.placeholder;
		}
	}

	private toggleError() {
		const state: ILandingState = Object.assign({}, this.state);
		state.error = !this.state.error;
		this.setState(state);
	}

	private handleEnter(event: FormEvent): void {
		event.preventDefault();
		this.handleNext();
	}

	public createReactNode(): ReactNode {
		const mobileView: boolean = this.props.windowWidth < Constants.MOBILE_WIDTH;
		const examplesShown: boolean = this.props.examples.length > 0 && (!this.props.examplesHidden || mobileView);
		return (
			<div style={{
				position: "absolute",
				top: "50%",
				left: "50%",
				width: "100%",
				height: "100%",
				transform: this.chooseTransform(),
				opacity: this.props.active ? 1 : 0,
				transition: `${this.fadeOutTime}ms ease-in-out`,
				textAlign: "center",
				alignItems: "center"
			}}>
				<ExampleContainer
					active={examplesShown}
					tellParentExampleClicked={this.props.tellParent}
					examples={this.props.examples}
					examplesHidden={this.props.examplesHidden}
					toggleExamplesHidden={this.props.toggleHidden}
					windowWidth={this.props.windowWidth}
				/>
				{!mobileView ?
					<React.Fragment>
						<div
							className="NoClick"
							style={{
								position: "absolute",
								top: "50%",
								left: "50%",
								width: "40%",
								transform: examplesShown ? "translate(-20%, -50%)" : "translate(-50%, -50%)",
								height: "20%",
								zIndex: 5000,
								transition: `${400 /*This should be the same as ExampleContainer fadeOutTime*/}ms ease-in-out`,
							}}
						>
							<p>
								Welcome to <code>codeshovel</code>.
							</p>
							<p>
								To begin, enter a link to a GitHub repository.
							</p>
							<Form style={{pointerEvents: "auto"}} onSubmit={this.handleEnter}>
								<Form.Control id="repoInput" size="lg" type="text" placeholder={this.placeholder}/>
							</Form>
							<Button
								style={{pointerEvents: "auto"}}
								variant="primary"
								onClick={this.handleNext}
								disabled={this.state.error}
							>
								Next
							</Button>
						</div>
						<div
							style={{
								position: "relative",
								top: "50%",
								left: "50%",
								transform: examplesShown ? `translate(${-this.props.windowWidth / 5 + "px"}, -50%)` : `translate(${-this.props.windowWidth / 1.8 + "px"}, -50%)`,
								transition: `400ms ease-in-out`,
								height: 140,
								width: 256,
								float: "left",
								zIndex: 3,
								pointerEvents: "none"
							}}
						>
							<div style={{width: "100%", height: "100%", transition: `400ms ease-in-out`, transform: examplesShown ? "scaleX(1)" : "scaleX(-1)"}}>
								<div
									style={{
										backgroundImage: `url(${process.env.PUBLIC_URL}/chevron.png)`,
										backgroundSize: "contain",
										backgroundRepeat: "no-repeat",
										whiteSpace: "nowrap",
										width: "100%",
										height: "100%",
										opacity: this.state.chevronHover ? 0.3 : 0.1
									}}
								>
									<div className="Hitbox3" onClick={this.props.toggleHidden} style={{pointerEvents: "auto"}}/>
									<div className="Hitbox4" onClick={this.props.toggleHidden} style={{pointerEvents: "auto"}}/>
									<div className="Hitbox5" onClick={this.props.toggleHidden} style={{pointerEvents: "auto"}}/>
									<div className="SubtleButton Hitbox Hitbox1" onClick={this.props.toggleHidden} onMouseEnter={() => this.setState({chevronHover: true})} onMouseLeave={() => this.setState({chevronHover: false})} style={{pointerEvents: "auto"}}/>
									<div className="SubtleButton Hitbox Hitbox2" onClick={this.props.toggleHidden} onMouseEnter={() => this.setState({chevronHover: true})} onMouseLeave={() => this.setState({chevronHover: false})} style={{pointerEvents: "auto"}}/>
								</div>
							</div>
						</div>
					</React.Fragment> :
					<div
						className="NoClick"
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							fontSize: "300%",
							opacity: !examplesShown ? 1 : 0,
							transition: `400ms ease-in-out`,
						}}
					>
						<code>
							codeshovel
						</code>
					</div>
				}
				<TutorialPane
					active={!this.state.tutorialDismissed && !mobileView}
					text={this.tutorialText}
					windowWidth={this.props.windowWidth}
					width={25}
					dismissTutorial={this.dismissTutorial}
					top={5}
					right={2}
					heightRatio={0.62}
				/>
				<ErrorPane text={this.errorText} active={this.state.error} exit={this.toggleError} size={{height: 30, width: 72}}/>
			</div>
		);
	}
}

class ExampleContainer extends FadeableElement<IExampleContainerProps, IExampleContainerState> {
	protected fadeOutTime: number = 400;

	public constructor(props: IExampleContainerProps) {
		super(props);
		this.state = {
			onScreen: this.props.active,
		};
		this.tellParentExampleClicked = this.tellParentExampleClicked.bind(this);
	}

	private tellParentExampleClicked(example: IManifestEntry): void {
		this.props.tellParentExampleClicked(example);
	}

	protected createReactNode(): ReactNode {
		const mobileView: boolean = this.props.windowWidth < Constants.MOBILE_WIDTH;
		return(this.props.active || this.state.onScreen ?
			<div
				className="Panel"
				style={{
					display: "block",
					font: Constants.FONT,
					textAlign: "left",
					height: "100%",
					width: "100%",
					left: this.props.active ? "0" : "-50%",
					opacity: this.props.active ? 1 : 0,
					transition: `${this.fadeOutTime}ms ease-in-out`,
					zIndex: 2,
				}}
			>
				{mobileView ?
					<div
						style={{
							textAlign: "left",
							left: "20%",
							top: "10%",
							fontSize: "15px",
							marginTop: "6px",
							marginLeft: "6px",
						}}
					>
						Welcome to <code>codeshovel</code>. Select a history.
					</div> : <div/>
				}
				<div
					style={{
						position: "absolute",
						zIndex: 0,
						marginBottom: "1em"
					}}
				>
					<Example
						windowWidth={this.props.windowWidth}
						example={false}
						tellParent={() => {}}
					/>
					{
						this.props.examples
							.map((example: IManifestEntry, i: number) => (
								<Example
									windowWidth={this.props.windowWidth}
									example={example}
									tellParent={this.tellParentExampleClicked}
									key={i}
								/>
							))
					}
				</div>
			</div> : <div style={{opacity: 0, left: "-50%"}}/>
		);
	}
}

export interface ILandingProps extends IPageProps {
	proceedWithUpdate: (page: Pages, arg: any, kind: ArgKind) => Promise<void>;
	examples: IManifestEntry[];
	examplesHidden: boolean;
	tellParent: (example: IManifestEntry) => void;
	toggleHidden: () => void;
}

export interface ILandingState extends IPageState {
	error: boolean;
	chevronHover: boolean;
}

interface IExampleContainerProps extends IFadeableElementProps {
	tellParentExampleClicked: (example: IManifestEntry) => void;
	examples: IManifestEntry[];
	examplesHidden: boolean;
	toggleExamplesHidden: () => void;
	windowWidth: number;
}

interface IExampleContainerState extends IFadeableElementState {

}
