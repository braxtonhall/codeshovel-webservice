import {IPageProps, IPageState, Page} from "./Page";
import {Pages} from "../Enums";
import {ReactNode} from "react";
import * as React from "react";
import {Constants} from "../Constants";

export class About extends Page<IAboutProps, IAboutState> {
	protected readonly page = Pages.ABOUT;
	private readonly codeshovelRepo: string = `https://github.com/ataraxie/codeshovel`;
	private readonly codeshovelUiRepo: string = `https://github.com/braxtonhall/codeshovel-ui`;
	private readonly codeshovelWebserviceRepo: string = `https://github.com/braxtonhall/codeshovel-webservice`;
	private readonly codeshovelPaperRepo: string = `https://open.library.ubc.ca/cIRcle/collections/ubctheses/24/items/1.0379647`;
	private readonly splLink: string = `https://spl.cs.ubc.ca/`;
	private readonly ubcLink: string = `https://www.ubc.ca`;

	constructor(props: IAboutProps) {
		super(props);
		this.state = {
			onScreen: this.props.active,
			tutorialDismissed: true
		}
	}

	protected handleNext(): void {

	}

	private getFontSize(s: string, modifier: number = 1): number {
		const mobileView: boolean = this.props.windowWidth < Constants.MOBILE_WIDTH;
		return ((mobileView ? 2.4 : 1) * this.props.windowWidth * (1 / Math.max(s.length, 50)) * 0.01 * Constants.ABOUT_TEXT_SIZE * modifier);
	}

	private getBoxFontSize(modifier: number): string {
		const mobileView: boolean = this.props.windowWidth < Constants.MOBILE_WIDTH;
		return Math.sqrt((mobileView ? 2 : 1) * this.props.windowHeight * this.props.windowWidth * 0.01 * (1/50) * Constants.ABOUT_TEXT_SIZE * modifier) + "px";
	}

	protected createReactNode(): ReactNode {
		const mobileView: boolean = this.props.windowWidth < Constants.MOBILE_WIDTH;
		const contributorWidth: number = 0.35 * this.props.windowWidth * (mobileView ? 2 : 1);
		const contributorHeight: number = 0.70 * 0.25 * this.props.windowHeight;
		return (
			<div>
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						width: "100%",
						height: "100%",
						transform: this.chooseTransform(),
						opacity: this.props.active ? 1 : 0,
						transition: `${this.fadeOutTime}ms ease-in-out`,
					}}
				>
					<div style={{
						position: "absolute",
						backgroundImage: `url(${process.env.PUBLIC_URL}/icon.png)`,
						width: this.getFontSize("", 16.5),
						height: this.getFontSize("", 16.5),
						backgroundSize: "contain",
						backgroundRepeat: "no-repeat",
						opacity: 0.3,
						top: "-20%",
						left: "10%",
					}}/>
				</div>
				<div
					className="Panel"
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						width: "100%",
						height: "100%",
						transform: this.chooseTransform(),
						opacity: this.props.active ? 1 : 0,
						transition: `${this.fadeOutTime}ms ease-in-out`,
						textAlign: "center",
						display: "flex",
						alignItems: "center",
						font: Constants.FONT,
					}}
				>
					<div
						style={{
							fontSize: this.getFontSize("codeshovel", 3),
							top: "5%",
							left: "10%",
							position: "absolute",
							textAlign: "center",
						}}
					>
						<code>codeshovel</code>
						<br/>
						<div style={{fontSize: this.getFontSize("Unearthing Method Histories")}}>Unearthing Method Histories</div>
						<div
							style={{fontSize: this.getBoxFontSize(0.04), textAlign: "left", position: "absolute", marginTop: "8%", width: this.getFontSize("", 16.5)}}
						>
							<div style={{marginBottom: "5%", fontSize: "70%"}}>
								<code>codeshovel</code> digs through source code to unearth the histories for methods.
								Currently implemented for Java and Python with more languages to follow.
							</div>
							<div style={{marginBottom: "5%", fontSize: "60%"}}>
								<code>codeshovel</code> is a tool for navigating how source code methods have evolved, across the kinds of evolutionary changes applied to the method, including most common refactorings, that the method saw throughout its life span.
								It is capable of tracking a method not only as it moves between line ranges, but as it moves through classes and around a codebase, from file to file.
							</div>
							{!mobileView ?
								<div style={{marginBottom: "5%", fontSize: "60%"}}>
									Enter a repository link, open a file, and select a method to try it for yourself.
								</div> :
								""
							}
							<div style={{marginBottom: "0.5%", fontSize: "55%"}}>
								codeshovel is open source, so check us out!
							</div>
							<div
								style={{
									backgroundColor: "rgb(183, 166, 108)",
									height: this.getFontSize("", 3),
									width: this.getFontSize("", 16.5),
									position: "absolute",
								}}
							>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										width: "100%",
										height: "100%",
										zIndex: 1000,
										color: "rgb(0,0,0)",
										fontSize: this.getFontSize("webservice")
									}}
								>
									<a
										className="SubtleButton CommitRowCell"
										href={this.codeshovelRepo}
										style={{color: "black", backgroundColor: "rgba(255, 255, 255, 0.3)"}}
										onClick={(ev) => {
											ev.preventDefault();
											window.open(this.codeshovelRepo, "_blank");
										}}

									>
										codeshovel
									</a>
									<a
										className="SubtleButton CommitRowCell"
										href={this.codeshovelWebserviceRepo}
										style={{color: "black", backgroundColor: "rgba(255, 255, 255, 0.1)"}}
										onClick={(ev) => {
											ev.preventDefault();
											window.open(this.codeshovelWebserviceRepo, "_blank");
										}}
									>
										webservice
									</a>
									<a
										className="SubtleButton CommitRowCell"
										href={this.codeshovelUiRepo}
										style={{color: "black", backgroundColor: "rgba(255, 255, 255, 0.2)"}}
										onClick={(ev) => {
											ev.preventDefault();
											window.open(this.codeshovelUiRepo, "_blank");
										}}
									>
										ui
									</a>
									<a
										className="SubtleButton CommitRowCell Disabled"
										href={this.codeshovelPaperRepo}
										style={{color: "black", backgroundColor: "rgba(255, 255, 255, 0.15)"}}
										// style={{color: "black", backgroundColor: "#a8a8a8", pointerEvents: "none"}} // Disabled view TODO
										onClick={(ev) => {
											ev.preventDefault();
											window.open(this.codeshovelPaperRepo, "_blank");
										}}
									>
										paper
									</a>
								</div>
							</div>
						</div>
					</div>
					<div
						style={{
							width: contributorWidth,
							right: "10%",
							top: mobileView ? "70%" : "10%",
							position: "absolute",
						}}
					>
						<Contributor
							containerWidth={contributorWidth}
							containerHeight={contributorHeight}
							image={"url(https://avatars2.githubusercontent.com/u/1646086?s=400&v=4)"}
							name={"Felix Grund"}
							username={"ataraxie"}
							info={"Felix is a software developer, MSc student, and the founder of codeshovel."}

						/>
						<Contributor
							containerWidth={contributorWidth}
							containerHeight={contributorHeight}
							image={"url(https://avatars2.githubusercontent.com/u/2560480?s=400&v=4)"}
							name={"Nick C. Bradley"}
							username={"nickbradley"}
							info={"Nick is a PhD student, and co-author of the codeshovel thesis paper."}
							link={"https://www.ncbradley.com/"}
							linkDesc={"ncbradley"}

						/>
						<Contributor
							containerWidth={contributorWidth}
							containerHeight={contributorHeight}
							image={"url(https://avatars1.githubusercontent.com/u/89003?s=400&v=4)"}
							name={"Reid Holmes"}
							username={"rtholmes"}
							info={"Reid is an Associate Professor of Computer Science, and supervisor on codeshovel."}
							link={"https://www.cs.ubc.ca/~rtholmes/"}
							linkDesc={"cs.ubc/rtholmes"}
						/>
						<Contributor
							containerWidth={contributorWidth}
							containerHeight={contributorHeight}
							image={"url(https://avatars3.githubusercontent.com/u/35436247?s=400&v=4)"}
							name={"Braxton Hall"}
							username={"braxtonhall"}
							info={"Braxton is a BA student, and the developer of the codeshovel web service."}

						/>
						<div style={{
							marginTop: "1%",
							position: "relative",
							height: (mobileView ? 3 : 1) * this.props.windowWidth * 0.06 + "px",
							width: (mobileView ? 3 : 1) * this.props.windowWidth * 0.12 + "px",
						}}>
							<a href={this.ubcLink}>
								<div
									className="SubtleButton"
									style={{
										backgroundImage: `url(${process.env.PUBLIC_URL}/ubc-invert.png)`,
										backgroundSize: "100%",
										backgroundRepeat: "no-repeat",
										whiteSpace: "nowrap",
										height: "100%",
										width: "50%",
										float: "left",
									}}
									onClick={(ev) => {
										ev.preventDefault();
										window.open(this.ubcLink, "_blank");
									}}
								/>
							</a>
							<a href={this.splLink}>
								<div
									className="SubtleButton"
									style={{
										backgroundImage: `url(${process.env.PUBLIC_URL}/spl-invert.png)`,
										backgroundSize: "100%",
										backgroundRepeat: "no-repeat",
										height: "100%",
										width: "50%",
										marginLeft: "50%"
									}}
									onClick={(ev) => {
										ev.preventDefault();
										window.open(this.splLink, "_blank");
									}}
								/>
								</a>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

class Contributor extends React.Component<IContributorProps, any> {
	private readonly link: string;
	private readonly linkDesc: string;

	constructor(props: IContributorProps) {
		super(props);
		this.state = {

		};
		if (this.props.link && this.props.linkDesc) {
			this.link = this.props.link;
			this.linkDesc = this.props.linkDesc;
		} else {
			this.link = `https://github.com/${this.props.username}`;
			this.linkDesc = `github/${this.props.username}`
		}
	}

	public render(): ReactNode {
		const notStacked: boolean = (this.props.containerWidth / 3.5) < this.props.containerHeight;
		return (
			<div
				style={{
					width: this.props.containerWidth,
					height: this.props.containerHeight,
					position: "relative",
					display: notStacked ? "inline-block" : "",
					marginBottom: notStacked ? "30%" : "1%",
				}}
			>
				<div style={{
					backgroundImage: this.props.image,
					width: this.props.containerHeight,
					height: this.props.containerHeight,
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
				}}/>
				<div
					style={{
						height: "100%",
						position: notStacked ? "initial" : "absolute",
						top: "5%",
						marginLeft: notStacked ? "5%" : "30%",
						textAlign: "left",
					}}
				>
					<div>
						{this.props.name}
					</div>
					<a href={this.link}>
						<div
							className="SubtleButton Underline"
							style={{color: "white", fontSize: "50%"}}
							onClick={(ev) => {
								ev.preventDefault();
								window.open(this.link, "_blank");
							}}
						>
							{this.linkDesc}
						</div>
					</a>
					<div
						style={{fontSize: "60%", marginTop: "3%"}}
					>
						{this.props.info}
					</div>
				</div>
			</div>
		);
	}
}

export interface IAboutProps extends IPageProps {
	windowHeight: number;
}

export interface IAboutState extends IPageState {

}

interface IContributorProps {
	containerWidth: number;
	containerHeight: number;
	image: string;
	name: string;
	username: string;
	info: string;
	link?: string;
	linkDesc?: string;
}
