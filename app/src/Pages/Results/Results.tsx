import * as React from "react";
import {ReactNode} from "react";
import {IPageProps, IPageState, Page} from "../Page";
import {Pages} from "../../Enums";
import {IHistoryTransport, IMethodTransport} from "../../Types";
import {History, ReactHistory} from "./History";
import {Header} from "./Header";
import Cookies from "js-cookie";
import TutorialPane from "../../Panes/TutorialPane";
import {Constants} from "../../Constants";

export class Results extends Page<IHistoryProps, IHistoryState> {
	protected readonly page: Pages = Pages.RESULTS;
	private content: IHistoryTransport;
	private history: History;
	protected readonly cookieName: string = "results";
	private readonly tutorialText: string = Constants.RESULTS_TUTORIAL_TEXT;

	public constructor(props: IHistoryProps) {
		super(props);
		this.state = {
			onScreen: this.props.active,
			tutorialDismissed: Cookies.get(this.cookieName) === 'true',
		};
		this.history = new History({}, "");
		this.content = {};
		this.buildHistory = this.buildHistory.bind(this);
	}

	protected handleNext(): void {
		this.props.proceedToPage(Pages.ABOUT);
	}

	private buildHistory(history: IHistoryTransport): void {
		this.content = history;
		this.history = new History(history, this.props.file);
	}

	public createReactNode(): ReactNode {
		const mobileView: boolean = this.props.windowWidth < Constants.MOBILE_WIDTH;
		if (this.content !== this.props.content) {
			this.buildHistory(this.props.content);
		}
		const transform: string = this.chooseTransform();
		return(
			<div>
				<div
					className="Panel"
					style={{
						position: "fixed",
						height: "100%",
						width: "100%",
						top: "50%",
						left: "50%",
						transform,
						opacity: this.props.active ? 0.8 : 0,
						transition: `${this.fadeOutTime}ms ease-in-out`,
					}}
				>
					<ReactHistory
						history={this.history}
						active={this.props.active}
						repo={this.props.repo}
						windowHeight={this.props.windowHeight}
						windowWidth={this.props.windowWidth}
						method={this.props.method}
					/>
				</div>
				<div
					style={{
						opacity: this.props.active ? 0.8 : 0,
						position: "relative",
						transform,
						left: "50%",
						transition: `${this.fadeOutTime}ms ease-in-out`,
					}}
				>
					<Header
						windowWidth={this.props.windowWidth}
						windowHeight={this.props.windowHeight}
						active={this.props.active}
					/>
				</div>
				{this.state.onScreen || this.props.active ?
					<div
						style={{
							position: "absolute",
							height: "100%",
							width: "100%",
							top: "50%",
							left: "50%",
							transform,
							transition: `${this.fadeOutTime}ms ease-in-out`,
							pointerEvents: "none",
							opacity: this.props.active ? 1 : 0
						}}
					>
						<TutorialPane
							active={!this.state.tutorialDismissed && !mobileView}
							text={this.tutorialText}
							windowWidth={this.props.windowWidth}
							width={25}
							dismissTutorial={this.dismissTutorial}
							top={60}
							right={60}
							heightRatio={0.67}
						/>
					</div> : <div style={{top: "50%", left: "50%", transform, opacity: 0}}/>
				}
			</div>
		);
	}
}

export interface IHistoryProps extends IPageProps {
	content: IHistoryTransport;
	repo: string;
	file: string;
	windowHeight: number;
	method: IMethodTransport;
}

export interface IHistoryState extends IPageState {

}
