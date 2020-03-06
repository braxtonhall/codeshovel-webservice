import React, {ReactNode} from "react";
import {FadeableElement, IFadeableElementProps, IFadeableElementState} from "../FadeableElement";

export default class SmallButton extends FadeableElement<ISmallButtonProps, ISmallButtonState> {
	protected readonly fadeOutTime: number = 400;

	public constructor(props: ISmallButtonProps) {
		super(props);
		this.state = {
			onScreen: this.props.active,
		};
	}

	protected createReactNode(): ReactNode {
		return (this.state.onScreen || this.props.active ?
				<div
					className="BackgroundImage SubtleButton"
					style={{
						height: this.props.height + "px",
						width: this.props.width + "px",
						position: "absolute",
						bottom: this.props.bottom + "px",
						left: (this.props.left + this.props.shift) + "px",
						backgroundColor: "rgb(183, 166, 108)",
						opacity: this.props.active ? 1 : 0,
						transition: this.fadeOutTime + "ms ease-in-out",
						backgroundImage: this.props.backgroundImage,
						backgroundSize: this.props.backgroundSize + "px",
					}}
					onClick={this.props.onClick}
				/> :
				<div
					className="BackgroundImage"
					style={{
						position: "absolute",
						bottom: this.props.bottom + "px",
						left: this.props.left + this.props.shift + "px",
						opacity: 0,
					}}
				/>
		);
	}
}

export interface ISmallButtonProps extends IFadeableElementProps{
	onClick: () => void;
	height: number;
	width: number;
	bottom: number;
	left: number;
	backgroundImage: string;
	backgroundSize: number;
	shift: number;
}

export interface ISmallButtonState extends IFadeableElementState{

}