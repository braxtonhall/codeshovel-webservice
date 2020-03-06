import {FadeableElement, IFadeableElementProps, IFadeableElementState} from "../FadeableElement";
import {ReactNode} from "react";
import React from "react";
import {Constants} from "../Constants";

export default class LargeButton extends FadeableElement<ICopyRawProps, ICopyRawState> {
	protected readonly fadeOutTime: number = 400;

	public constructor(props: ICopyRawProps) {
		super(props);
		this.state = {
			onScreen: this.props.active,
		};
	}

	protected createReactNode(): ReactNode {
		return (
			<div>
				{this.state.onScreen || this.props.active ?
					<div
						className="BackgroundImage SubtleButton"
						style={{
							height: "30px",
							width: this.props.width + "px",
							position: "absolute",
							bottom: this.props.bottom + "px",
							left: (this.props.shift + this.props.left) +"px",
							font: Constants.FONT,
							fontSize:  "24px",
							color: "rgb(0, 0, 0)",
							backgroundColor: this.props.displayNotification ? "rgb(124, 203, 126)" : "rgb(183, 166, 108)",
							opacity: this.props.active ? 1 : 0,
							transition: this.fadeOutTime + "ms ease-in-out",
							backgroundImage: this.props.backgroundImage,
							backgroundSize: "15px",
							textAlign: this.props.backgroundImage === "" ? "center" : "right",
							padding: "0 15px",
							backgroundPosition: "10px 3.5px",
						}}
						onClick={this.props.handleClick}
					>
						{this.props.text}
					</div> :
					<div className="BackgroundImage"
						 style={{
						 	 position: "absolute",
							 bottom: this.props.bottom + "px",
							 opacity: 0,
							 textAlign: "right",
							 padding: "0 15px",
							 backgroundPosition: "10px 3.5px",
							 color: "rgb(0, 0, 0)",
							 left: (this.props.shift + this.props.left) +"px",
						 }}
					/>

				}
			</div>
		);
	}
}

export interface ICopyRawProps extends IFadeableElementProps{
	handleClick: () => void;
	displayNotification: boolean;
	shift: number;
	text: string;
	backgroundImage: string;
	left: number;
	bottom: number;
	width: number;
}

export interface ICopyRawState extends IFadeableElementState{

}