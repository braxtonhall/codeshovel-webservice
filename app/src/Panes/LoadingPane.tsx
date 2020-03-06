import React, {ReactNode} from "react";
import {FadeableElement, IFadeableElementProps, IFadeableElementState} from "../FadeableElement";
import {Constants} from "../Constants";

export default class LoadingPane extends FadeableElement<ILoadingPaneProps, ILoadingPaneState> {
	protected readonly fadeOutTime: number = 500;
	private text: string;

	public constructor(props: ILoadingPaneProps) {
		super(props);
		this.state = {onScreen: this.props.active};
		this.text = this.props.text;
	}

	private getFontSize(s: string, modifier: number = 1): string {
		return (this.props.windowWidth * (1 / Math.max(s.length, 50)) * 0.01 * Constants.LOADING_TEXT_SIZE * modifier) + "px";
	}

	public createReactNode(): ReactNode {
		if (this.props.active) {
			this.text = this.props.text;
		}
		return (this.state.onScreen || this.props.active ?
			<div
				style={{
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					height: this.props.size.height + "%",
					width: this.props.size.width + "%",
					color: this.props.active ? "rgb(0, 0, 0)" : "rgb(183, 166, 108)",
					backgroundColor: "rgb(183, 166, 108)",
					opacity: this.props.active ? 1 : 0,
					transition: this.fadeOutTime + "ms ease-in-out",
					position: "relative",
				}}
			>
				<div
					style={{
						display: "flex",
						width: "100%",
						height: "100%",
						font: "100% \"Courier New\", Futura, sans-serif",
						fontSize: this.getFontSize(this.text),
						verticalAlign: "middle",
						justifyContent: "center",
						alignItems: "center",
						animation: "Pulse infinite 2s linear",
					}}
				>
					{this.text}
				</div>
			</div> :
			<div
				style={{
					position: "absolute",
					top: "50%",
					left: "50%",
					opacity: 0,
					transform: "translate(-50%, -50%)",
					color: "rgb(183, 166, 108)",
				}}
			/>
		);
	}
}

export interface ILoadingPaneProps extends IFadeableElementProps {
	text: string;
	size: {height: number, width: number};
	windowWidth: number;
}

export interface ILoadingPaneState extends IFadeableElementState {

}