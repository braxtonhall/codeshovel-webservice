import {ICommitRowProps, ReactCommitRow} from "./CommitRow";
import {ReactNode} from "react";
import {IFadeableElementState} from "../../FadeableElement";
import {Constants} from "../../Constants";
import * as React from "react";

export class Header extends ReactCommitRow<IHeaderProps, IHeaderState> {

	constructor(props: IHeaderProps) {
		super(props);
		this.state = {
			onScreen: this.props.active,
		};
		this.setUpColours();
	}

	public createReactNode(): ReactNode {
		const mobileView: boolean = this.props.windowWidth < Constants.MOBILE_WIDTH;
		let height: number = Math.log(this.props.windowHeight) * Constants.COMMIT_ROW_HEIGHT;
		let width: number;
		if (mobileView) {
			width = this.props.windowWidth * 0.01 * Constants.COMMIT_ROW_MOBILE_WIDTH;
		} else {
			width = this.props.windowWidth * 0.01 * Constants.COMMIT_ROW_WIDTH;
		}
		return (
			<div
				style={{
					margin: "0 auto",
					top: "3px",
					marginBottom: "3px",
					textAlign: "left",
					font: Constants.FONT,
					width: width + "px",
					overflow: "hidden",
					zIndex: 9999,
					transition: this.fadeOutTime + "ms ease-in-out",
					display: "grid",
					gridTemplateColumns: mobileView ? "1fr 1fr 0fr 0fr 1fr 1fr" : "1fr 1fr 1fr 1fr 1fr 1fr",
					backgroundColor: "rgb(255, 255, 255)",
					position: "fixed",
					left: "50%",
					transform: "translate(-50%, 0)",
					color: "rgb(0,0,0)",
					height,
				}}
			>
				<div className="CommitRowCell" style={{fontSize: this.getFontSize("Date"), backgroundColor: `rgba(0, 0, 0, 0.${this.datec})`}}>
					Date
				</div>
				<div className="CommitRowCell" style={{fontSize: this.getFontSize("Author"), backgroundColor: `rgba(0, 0, 0, 0.${this.authc})`}}>
					Author
				</div>
				{mobileView ? <div/> :
					<div className="CommitRowCell" style={{
						fontSize: this.getFontSize("Commit"),
						backgroundColor: `rgba(0, 0, 0, 0.${this.comtc})`
					}}>
						Commit
					</div>
				}
				{mobileView ? <div/> :
					<div className="CommitRowCell" style={{
						fontSize: this.getFontSize("File"),
						backgroundColor: `rgba(0, 0, 0, 0.${this.filec})`
					}}>
						File
					</div>
				}
				<div className="CommitRowCell" style={{fontSize: this.getFontSize("Type"), backgroundColor: `rgba(0, 0, 0, 0.${this.typec})`}}>
					Type
				</div>
				<div className="CommitRowCell" style={{fontSize: this.getFontSize("Diff"), backgroundColor: `rgba(0, 0, 0, 0.${this.detlc})`}}>
					Diff
				</div>
			</div>
		);
	}
}

export interface IHeaderProps extends ICommitRowProps{

}

export interface IHeaderState extends IFadeableElementState {

}